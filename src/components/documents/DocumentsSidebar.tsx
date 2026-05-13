'use client';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Chip,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { UploadModal } from './UploadModal';
import { useDocumentsSidebar } from './useDocumentsSidebar';
import { AppPanel } from '@/components/ui/AppPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { StatusChip } from '@/components/ui/StatusChip';
import { DocumentTypeIcon } from './DocumentTypeIcon';
import { AppSnackbar } from '@/components/ui/AppSnackbar';
import Link from 'next/link';
import { useState } from 'react';
import { Document } from '@/types/graphql';

function getStatusChip(document: Document) {
  switch (document.processing_status) {
    case 'failed':
      return <StatusChip status="error" label="Failed" icon={<ErrorOutlineRoundedIcon fontSize="small" />} />;
    default:
      return null;
  }
}

export function DocumentsSidebar() {
  const {
    documents,
    loading,
    error,
    selectedDocumentIds,
    toggleDocumentSelection,
    menuAnchor,
    selectedDocumentId,
    uploadModalOpen,
    setUploadModalOpen,
    handleMenuOpen,
    handleMenuClose,
    handleDeleteDocument,
    handleUploadSuccess,
  } = useDocumentsSidebar();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const openDeleteConfirm = () => {
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  return (
    <AppPanel dense sx={{ height: '100%' }}>
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 1.5 }}>
          <SectionHeader
            title="Documents"
            subtitle={`${selectedDocumentIds.length} selected`}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => setUploadModalOpen(true)}
              >
                Upload
              </Button>
            }
          />
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: 1.25 }}>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={40} />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={64} />
              ))}
            </Stack>
          ) : error ? (
            <EmptyState
              title="Could not load documents"
              description={error.message}
            />
          ) : documents.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description="Upload files to start grounding your conversations in source material."
              action={{ label: 'Upload documents', onClick: () => setUploadModalOpen(true) }}
            />
          ) : (
            <List disablePadding sx={{ display: 'grid', gap: 0.75 }}>
              {documents.map((document) => {
                const isSelected = selectedDocumentIds.includes(document.id);

                return (
                   <ListItem
                    key={document.id}
                    disablePadding
                    sx={{
                      '& .MuiListItemSecondaryAction-root': {
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        pointerEvents: 'none',
                      },
                      '&:hover .MuiListItemSecondaryAction-root': {
                        opacity: 1,
                        pointerEvents: 'auto',
                      },
                      ...(selectedDocumentId === document.id && Boolean(menuAnchor) && {
                        '& .MuiListItemSecondaryAction-root': {
                          opacity: 1,
                          pointerEvents: 'auto',
                        },
                      }),
                      minWidth: 0,
                      "& .MuiListItemButton-root": {
                        pr: 1.5,
                        transition: "padding-right 0.2s ease",
                      },
                      "&:hover .MuiListItemButton-root": {
                        pr: 5,
                      },
                      ...(selectedDocumentId === document.id &&
                        Boolean(menuAnchor) && {
                          "& .MuiListItemButton-root": {
                            pr: 5,
                          },
                        }),
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, document.id)}
                          aria-label={`Actions for ${document.title || document.original_file_name}`}
                        >
                          <MoreVertRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemButton
                      onClick={() => toggleDocumentSelection(document.id)}
                      selected={isSelected}
                      disableRipple
                      sx={{
                        alignItems: 'center',
                        minWidth: 0,
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        size='small'
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleDocumentSelection(document.id)}
                        sx={{ mt: -0.5 }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 0 }}>
                          <DocumentTypeIcon
                            mimeType={document.mime_type}
                            fileName={document.original_file_name}
                            fontSize="small"
                            color="action"
                          />
                          <ListItemText
                            sx={{ m: 0, minWidth: 0 }}
                            primary={
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {document.title || document.original_file_name}
                              </Typography>
                            }
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                          {getStatusChip(document)}
                          {document.file_size ? (
                            <Chip size="small" label={`${Math.max(1, Math.round(document.file_size / 1024))} KB`} variant="outlined" />
                          ) : null}
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem component={Link} href={`/documents/${selectedDocumentId}`} onClick={handleMenuClose}>
          <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          View document
        </MenuItem>
        <MenuItem onClick={openDeleteConfirm}>
          <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete document
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete document?"
        description="This document will be removed from the knowledge base and cannot be restored."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await handleDeleteDocument();
          setConfirmDeleteOpen(false);
        }}
        onClose={() => setConfirmDeleteOpen(false)}
      />

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={(uploaded) => {
          handleUploadSuccess();
          setSnackbar({
            open: true,
            message: `${uploaded.length} document${uploaded.length === 1 ? '' : 's'} uploaded successfully.`,
            severity: 'success',
          });
        }}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </AppPanel>
  );
}
