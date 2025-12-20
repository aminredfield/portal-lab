"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  Button,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Skeleton
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PageHeader from '@/components/PageHeader';
import useAuth from '@/store/auth';
import axios from 'axios';
import { useToast } from '@/components/ToastProvider';

interface UploadItem {
  uploadId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  publicUrl: string;
}

export default function UploadsPage() {
  const { token, role } = useAuth();
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<UploadItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const isViewer = role === 'viewer';
  const maxSize = 5 * 1024 * 1024; // 5 MB

  useEffect(() => {
    fetchRecent();
    // Revoke preview URL on unmount
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const fetchRecent = async () => {
    setLoadingRecent(true);
    try {
      const res = await axios.get('/api/uploads/recent?limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecent(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Validate type and size client side
    if (!['image/png', 'image/jpeg'].includes(f.type)) {
      setError('Only PNG and JPEG files are allowed');
      return;
    }
    if (f.size > maxSize) {
      setError('File exceeds 5 MB');
      return;
    }
    setError(null);
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
    setStatus('idle');
    setProgress(0);
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setError(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setStatus('uploading');
    setError(null);
    try {
      // Step 1: presign
      const presignRes = await axios.post(
        '/api/uploads/presign',
        { filename: file.name, contentType: file.type, size: file.size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { uploadUrl, publicUrl } = presignRes.data;
      // Step 2: upload file
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type, Authorization: `Bearer ${token}` },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        }
      });
      setStatus('success');
      addToast('Uploaded successfully.', 'success');
      // Refresh recent list
      fetchRecent();
      // Clear selection but leave preview for user to open
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setStatus('error');
      const msg = err?.message || 'Upload failed';
      setError(msg);
      addToast(msg, 'error');
    }
  };

  const renderUploadCard = () => {
    return (
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="h6" gutterBottom>Upload file</Typography>
        <Typography variant="body2" color="text.secondary">PNG/JPEG up to 5MB</Typography>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!file && (
            <Button variant="outlined" component="label" disabled={isViewer}>
              Choose file
              <input type="file" accept="image/png,image/jpeg" hidden onChange={handleFileSelect} />
            </Button>
          )}
          {file && previewUrl && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <img src={previewUrl} alt="preview" style={{ maxHeight: 220, borderRadius: 8 }} />
              <Typography variant="body2">{file.name} ({(file.size / 1024).toFixed(1)} KB)</Typography>
            </Box>
          )}
          {file && !previewUrl && (
            <Box>
              <Typography variant="body2">{file.name}</Typography>
            </Box>
          )}
          {status === 'uploading' && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" sx={{ mt: 0.5 }}>{progress}%</Typography>
            </Box>
          )}
          {status === 'success' && (
            <Chip label="Uploaded" color="success" />
          )}
          {status === 'error' && error && (
            <Alert severity="error">{error}</Alert>
          )}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={!file || isViewer || status === 'uploading'}
              onClick={handleUpload}
            >
              {status === 'uploading' ? 'Uploading…' : status === 'error' ? 'Retry' : 'Upload'}
            </Button>
            <Button variant="outlined" onClick={clearSelection} disabled={status === 'uploading'}>
              Clear
            </Button>
          </Stack>
          {isViewer && (
            <Typography variant="caption" color="text.secondary">Upload available for manager/admin</Typography>
          )}
        </Box>
      </Paper>
    );
  };

  const renderRecent = () => {
    return (
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="h6" gutterBottom>Recent uploads</Typography>
        {loadingRecent ? (
          <Box>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={40} sx={{ my: 0.5 }} />
            ))}
          </Box>
        ) : recent.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>No uploads yet</Typography>
            <Button variant="outlined" onClick={() => {
              const uploadCard = document.getElementById('upload-card');
              uploadCard?.scrollIntoView({ behavior: 'smooth' });
            }}>Upload your first file</Button>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploaded at</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent.map((item) => (
                <TableRow key={item.uploadId}>
                  <TableCell>
                    <Stack spacing={0}>
                      <Typography variant="body2">{item.filename}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.contentType}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{(item.size / 1024).toFixed(1)} KB</TableCell>
                  <TableCell>{new Date(item.uploadedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => window.open(item.publicUrl, '_blank')}>
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    );
  };

  return (
    <>
      <PageHeader title="Uploads" subtitle="Presigned upload with progress and retry" />
      <Box id="upload-card" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box sx={{ flex: { md: 5 } }}>{renderUploadCard()}</Box>
        <Box sx={{ flex: { md: 7 } }}>{renderRecent()}</Box>
      </Box>
    </>
  );
}