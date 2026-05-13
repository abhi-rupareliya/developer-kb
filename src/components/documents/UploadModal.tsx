'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText, Typography
} from '@mui/material';
import {
  CloudUpload,
  Close,
  DeleteOutlineRounded,
  ErrorOutlineRounded,
  FilePresentOutlined,
  CheckCircleRounded,
} from '@mui/icons-material';
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } from '@/constants/Uploads';
import { Document } from '@/types/graphql';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: (documents: Document[]) => void;
}

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string | null;
  progress?: number;
}

export function UploadModal({ open, onClose, onUploadSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validFiles = useMemo(() => files.filter((file) => file.status === 'pending'), [files]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`;
    }

    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return `Unsupported file type`;
    }

    return null;
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithStatus[] = Array.from(selectedFiles).map((file) => {
      const error = validateFile(file);
      return {
        file,
        status: error ? 'error' : 'pending',
        error,
      };
    });

    setSubmitError(null);
    setFiles((current) => [...current, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      handleFileSelect(event.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleUpload = async () => {
    if (validFiles.length === 0) return;

    setIsUploading(true);
    setSubmitError(null);
    setFiles((current) =>
      current.map((file) =>
        file.status === 'pending' ? { ...file, status: 'uploading', progress: 0 } : file,
      ),
    );

    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('files', file.file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setFiles((current) =>
        current.map((file) =>
          file.status === 'uploading' ? { ...file, status: 'success', progress: 100 } : file,
        ),
      );

      onUploadSuccess(result.documents);
      setTimeout(() => {
        setFiles([]);
      }, 400);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setSubmitError(message);
      setFiles((current) =>
        current.map((file) =>
          file.status === 'uploading'
            ? { ...file, status: 'error', error: message, progress: 0 }
            : file,
        ),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setFiles([]);
    setSubmitError(null);
    onClose();
  };

  const removeFile = (index: number) => {
    if (isUploading) return;
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CloudUpload fontSize="small" />
            <Typography variant="h6">Upload documents</Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isUploading} aria-label="Close upload dialog">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box
          onDrop={handleDrop}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragOver(false);
          }}
          onClick={() => document.getElementById('upload-file-input')?.click()}
          sx={{
            border: '1.5px dashed',
            borderColor: dragOver ? 'primary.main' : 'divider',
            borderRadius: 3,
            px: 2.5,
            py: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: dragOver ? 'rgba(37, 99, 235, 0.04)' : 'background.default',
            transition: 'all 160ms ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(37, 99, 235, 0.03)',
            },
          }}
        >
          <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="subtitle1">Drop files here or click to browse</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Supported: {SUPPORTED_EXTENSIONS.join(', ')}. Max {Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB each.
          </Typography>
          <input
            id="upload-file-input"
            type="file"
            multiple
            accept={SUPPORTED_EXTENSIONS.join(',')}
            hidden
            onChange={(event) => handleFileSelect(event.target.files)}
          />
        </Box>

        {submitError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        ) : null}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Chip size="small" label={`${files.length} files`} variant="outlined" />
          <Chip size="small" label={`${validFiles.length} ready to upload`} color="primary" variant="outlined" />
        </Box>

        {files.length > 0 ? (
          <List dense sx={{ mt: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            {files.map((fileWithStatus, index) => (
              <Box key={`${fileWithStatus.file.name}-${index}`}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {fileWithStatus.status === 'success' ? (
                        <CheckCircleRounded color="success" fontSize="small" />
                      ) : fileWithStatus.status === 'error' ? (
                        <ErrorOutlineRounded color="error" fontSize="small" />
                      ) : null}
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                        aria-label={`Remove ${fileWithStatus.file.name}`}
                      >
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <FilePresentOutlined sx={{ mr: 1.5, mt: 0.25, color: 'text.secondary' }} fontSize="small" />
                  <ListItemText
                    primary={
                      <Box
                        component="span"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fileWithStatus.file.name}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {(fileWithStatus.file.size / 1024).toFixed(1)} KB
                        </Typography>
                        {fileWithStatus.error ? (
                          <Typography variant="caption" color="error">
                            {fileWithStatus.error}
                          </Typography>
                        ) : null}
                        {fileWithStatus.status === 'uploading' ? (
                          <LinearProgress variant="determinate" value={fileWithStatus.progress ?? 0} />
                        ) : null}
                      </Box>
                    }
                  />
                </ListItem>
                {index < files.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </List>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={validFiles.length === 0 || isUploading}
          startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
        >
          {isUploading ? 'Uploading…' : 'Upload files'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
