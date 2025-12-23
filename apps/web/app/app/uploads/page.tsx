"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Skeleton,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
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

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadsPage() {
  const { token, role } = useAuth();
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<UploadItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const isViewer = role === 'viewer';
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ['image/png', 'image/jpeg'];

  useEffect(() => {
    fetchRecent();
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const fetchRecent = async () => {
    setLoadingRecent(true);
    try {
      const res = await axios.get('/api/uploads/recent?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecent(res.data);
    } catch (err: any) {
      console.error(err);
      addToast('Не удалось загрузить список файлов', 'error');
    } finally {
      setLoadingRecent(false);
    }
  };

  const validateFile = (f: File): string | null => {
    if (!allowedTypes.includes(f.type)) {
      return 'Разрешены только PNG и JPEG файлы';
    }
    if (f.size > maxSize) {
      return `Максимальный размер файла: ${(maxSize / 1024 / 1024).toFixed(0)} МБ`;
    }
    return null;
  };

  const handleFileSelect = (f: File) => {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(f));
    }
    setStatus('idle');
    setProgress(0);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  }, []);

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
    setProgress(0);

    try {
      const presignRes = await axios.post(
        '/api/uploads/presign',
        { filename: file.name, contentType: file.type, size: file.size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { uploadUrl } = presignRes.data;

      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type, Authorization: `Bearer ${token}` },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });

      setStatus('success');
      addToast('Файл успешно загружен!', 'success');
      fetchRecent();

      setTimeout(() => {
        clearSelection();
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      const msg = err?.message || 'Ошибка загрузки';
      setError(msg);
      addToast(msg, 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <PageHeader title="Загрузки файлов" subtitle="Presigned upload с отслеживанием прогресса" />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Загрузить файл</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Поддерживаются PNG и JPEG до 5 МБ
              </Typography>

              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  mt: 2,
                  p: 3,
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: isDragging ? 'action.hover' : 'background.default',
                  textAlign: 'center',
                  cursor: isViewer ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {!file ? (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Перетащите файл сюда или
                    </Typography>
                    <Button variant="outlined" component="label" disabled={isViewer} size="small" sx={{ mt: 1 }}>
                      Выберите файл
                      <input type="file" accept="image/png,image/jpeg" hidden onChange={handleFileInputChange} />
                    </Button>
                    {isViewer && (
                      <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                        Доступно только для менеджера и администратора
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box>
                    {previewUrl && (
                      <Box component="img" src={previewUrl} alt="preview" sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, mb: 2 }} />
                    )}
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <InsertDriveFileIcon color="action" />
                      <Box>
                        <Typography variant="body2">{file.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                      </Box>
                    </Stack>

                    {status === 'uploading' && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress variant="determinate" value={progress} />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {progress}% загружено
                        </Typography>
                      </Box>
                    )}

                    {status === 'success' && (
                      <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mt: 2 }}>
                        Файл успешно загружен!
                      </Alert>
                    )}

                    {status === 'error' && error && (
                      <Alert icon={<ErrorIcon />} severity="error" sx={{ mt: 2 }}>
                        {error}
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>

              {error && !file && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>{error}</Alert>
              )}

              {file && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    disabled={status === 'uploading' || status === 'success'}
                    onClick={handleUpload}
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    {status === 'uploading' ? 'Загрузка...' : status === 'error' ? 'Повторить' : 'Загрузить'}
                  </Button>
                  <Button variant="outlined" onClick={clearSelection} disabled={status === 'uploading'} startIcon={<DeleteIcon />}>
                    Отмена
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Недавние загрузки</Typography>

              {loadingRecent ? (
                <Box>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} height={60} sx={{ my: 0.5 }} />
                  ))}
                </Box>
              ) : recent.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <InsertDriveFileIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Пока нет загруженных файлов
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ mt: 2 }} disabled={isViewer}>
                    Загрузите первый файл
                  </Button>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Файл</TableCell>
                        <TableCell align="right">Размер</TableCell>
                        <TableCell>Дата</TableCell>
                        <TableCell align="right">Действие</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recent.map((item) => (
                        <TableRow key={item.uploadId} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <InsertDriveFileIcon fontSize="small" color="action" />
                              <Box>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{item.filename}</Typography>
                                <Typography variant="caption" color="text.secondary">{item.contentType}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">{formatFileSize(item.size)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(item.uploadedAt)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => window.open(item.publicUrl, '_blank')} title="Открыть файл">
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}