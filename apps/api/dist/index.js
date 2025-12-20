import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { createReadStream, createWriteStream } from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
// Determine the role based on the email. The demo defines three special
// addresses; everything else is a viewer. Passwords are ignored except
// that the string '123' is required as the password.
function resolveRole(email) {
    if (email === 'admin@demo.com')
        return 'admin';
    if (email === 'manager@demo.com')
        return 'manager';
    return 'viewer';
}
// Generate a mock token by base64 encoding the payload. The prefix 'mock.' is
// used so the frontend can distinguish the format. The payload includes an
// expiration timestamp (seconds since epoch).
function generateToken(payload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    return `mock.${encoded}`;
}
// Decode the token and return the payload if valid. Returns null if the
// structure is invalid or the JSON cannot be parsed. Expiration is checked
// elsewhere.
function decodeToken(token) {
    try {
        const [, encoded] = token.split('.');
        const json = Buffer.from(encoded, 'base64').toString('utf8');
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
// Create and configure the Fastify instance.
const app = Fastify({ logger: true });
// Register CORS to allow the frontend to make cross‑origin requests in
// development. In production the frontend rewrites API calls to the same
// origin so CORS is less important, but leaving it enabled is harmless.
await app.register(cors, { origin: true });
// Register multipart support. Although the PUT /upload endpoint writes the
// request body directly to disk, multipart registration is useful if you
// extend the API in the future.
await app.register(multipart);
// Determine where to store uploads and metadata. The folder is created on
// demand. Metadata is persisted in a JSON file to avoid introducing a full
// database for the demo.
const uploadsDir = path.join(process.cwd(), 'uploads');
const metadataFile = path.join(process.cwd(), 'db.json');
async function ensureUploadsDir() {
    await fsPromises.mkdir(uploadsDir, { recursive: true });
}
async function readMetadata() {
    try {
        const data = await fsPromises.readFile(metadataFile, 'utf8');
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}
async function writeMetadata(items) {
    await fsPromises.writeFile(metadataFile, JSON.stringify(items, null, 2));
}
// Prehandler for route protection. Checks the Authorization header for a
// Bearer token, decodes it and verifies the expiration. If a list of roles
// is provided the user's role must be included; otherwise access is denied.
function authGuard(allowedRoles) {
    return async function (request, reply) {
        const header = request.headers['authorization'];
        if (!header || !header.startsWith('Bearer ')) {
            reply.code(401).send({ code: 'UNAUTHENTICATED', message: 'Missing token' });
            return;
        }
        const token = header.replace('Bearer ', '');
        const payload = decodeToken(token);
        if (!payload) {
            reply.code(401).send({ code: 'UNAUTHENTICATED', message: 'Invalid token' });
            return;
        }
        // Check expiry (seconds since epoch)
        if (payload.exp * 1000 < Date.now()) {
            reply.code(401).send({ code: 'TOKEN_EXPIRED', message: 'Session expired' });
            return;
        }
        if (allowedRoles && !allowedRoles.includes(payload.role)) {
            reply.code(403).send({ code: 'FORBIDDEN', message: 'No access' });
            return;
        }
        // Attach the user to the request for later handlers
        request.user = payload;
    };
}
// Authentication endpoint. Returns a mock token and the user's role and
// expiration. In this demo the password must always be '123'.
app.post('/auth/login', async (request, reply) => {
    const body = request.body;
    const { email, password } = body ?? {};
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        reply.code(400).send({ code: 'VALIDATION_ERROR', message: 'Email and password required' });
        return;
    }
    if (password !== '123') {
        reply.code(401).send({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
        return;
    }
    const role = resolveRole(email);
    // Token expires in 24 hours
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const token = generateToken({ email, role, exp });
    reply.send({ token, role, exp });
});
// Presign endpoint. Returns an upload URL and public URL along with a
// generated UUID. Only managers and admins can presign uploads. The client
// validates file size and type; the server performs the same validation to
// prevent abuse.
app.post('/uploads/presign', { preHandler: authGuard(['manager', 'admin']) }, async (request, reply) => {
    const body = request.body;
    const { filename, contentType, size } = body ?? {};
    const maxSize = parseInt(process.env.MAX_FILE_SIZE ?? '5242880', 10);
    const allowed = (process.env.ALLOWED_TYPES ?? 'image/png,image/jpeg').split(',');
    if (!filename || !contentType || typeof size !== 'number') {
        reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid request', details: { file: 'Missing filename or content type' } });
        return;
    }
    if (size > maxSize || !allowed.includes(contentType)) {
        reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid file', details: { file: 'Type or size not allowed' } });
        return;
    }
    const uploadId = randomUUID();
    // The uploadUrl is relative to the API root; the client will PUT the file
    // contents to this endpoint.
    const uploadUrl = `/upload/${uploadId}`;
    const publicUrl = `/files/${uploadId}`;
    reply.send({ uploadId, uploadUrl, publicUrl });
});
// Handle file uploads. The file body is streamed directly to disk. Only
// managers and admins may upload. Metadata is recorded for listing recent
// uploads. The metadata file keeps only the latest 100 entries to prevent
// uncontrolled growth.
app.put('/upload/:uploadId', { preHandler: authGuard(['manager', 'admin']) }, async (request, reply) => {
    const params = request.params;
    const { uploadId } = params;
    await ensureUploadsDir();
    const destPath = path.join(uploadsDir, uploadId);
    // Stream the request body to the destination file
    const writeStream = createWriteStream(destPath);
    await new Promise((resolve, reject) => {
        request.raw.pipe(writeStream);
        request.raw.on('end', () => resolve());
        request.raw.on('error', (err) => reject(err));
    });
    // Determine content type and size from headers
    const contentType = request.headers['content-type'] ?? 'application/octet-stream';
    const contentLength = parseInt(request.headers['content-length'] ?? '0', 10);
    // Record metadata
    const items = await readMetadata();
    const user = request.user;
    items.unshift({
        uploadId,
        filename: uploadId,
        contentType,
        size: contentLength,
        uploadedAt: new Date().toISOString(),
        publicUrl: `/files/${uploadId}`,
        role: user.role,
        uploaderEmail: user.email
    });
    await writeMetadata(items.slice(0, 100));
    reply.send({ ok: true });
});
// Serve uploaded files. Anyone logged in may fetch files. This endpoint
// streams the file contents and sets the appropriate content type. If the
// file does not exist a 404 is returned.
app.get('/files/:uploadId', async (request, reply) => {
    const { uploadId } = request.params;
    const filePath = path.join(uploadsDir, uploadId);
    try {
        const fileStat = await fsPromises.stat(filePath);
        const items = await readMetadata();
        const meta = items.find((m) => m.uploadId === uploadId);
        const contentType = meta?.contentType ?? 'application/octet-stream';
        reply.header('Content-Length', fileStat.size);
        reply.header('Content-Type', contentType);
        return reply.send(createReadStream(filePath));
    }
    catch (err) {
        reply.code(404).send({ code: 'NOT_FOUND', message: 'File not found' });
    }
});
// Return a list of recent uploads. The optional `limit` query parameter
// controls how many items are returned; the default is 10. Any authenticated
// user can query recent uploads.
app.get('/uploads/recent', { preHandler: authGuard() }, async (request, reply) => {
    const limitParam = request.query.limit;
    const limit = parseInt(limitParam ?? '10', 10);
    const items = await readMetadata();
    reply.send(items.slice(0, limit));
});
// Demo endpoints for triggering various HTTP responses. These routes are used
// by the frontend to demonstrate centralized error handling.
app.get('/demo/http-500', async (_request, reply) => {
    reply.code(500).send({ code: 'SERVER_ERROR', message: 'Intentional server error' });
});
app.get('/demo/http-401', async (_request, reply) => {
    reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Demo unauthorized response' });
});
app.post('/demo/validation', async (_request, reply) => {
    reply.code(422).send({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: { email: 'Invalid email' } });
});
// Health check endpoint. Useful for orchestrators to check container health.
app.get('/health', async () => {
    return { status: 'ok' };
});
// Start the server on the configured port. Fastify automatically reads
// environment variables like PORT when listening.
const PORT = parseInt(process.env.PORT ?? '4000', 10);
app.listen({ port: PORT, host: '0.0.0.0' }).catch((err) => {
    app.log.error(err);
    process.exit(1);
});
