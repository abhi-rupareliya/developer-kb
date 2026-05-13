"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_DOCUMENTS } from "@/graphql/queries";
import { Document } from "@/types/graphql";
import { DocumentContent } from "@/components/documents/DocumentContent";

export function DocumentModalView({ documentId }: { documentId: string }) {
  const router = useRouter();
  const { data, loading, error: queryError } = useQuery<{ documents: Document[] }>(GET_DOCUMENTS);

  const documents = data?.documents || [];
  const document = documents.find((doc) => doc.id === documentId);

  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          height: '90vh',
          maxHeight: '90vh',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ pr: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="h6" noWrap>
            {document?.title || document?.original_file_name || 'Document'}
          </Typography>
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, bgcolor: 'background.default' }}>
        {queryError ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">Failed to load document: {queryError.message}</Typography>
          </Box>
        ) : loading || !document ? (
          <Box sx={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <CircularProgress />
            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
              {loading ? 'Loading documents…' : 'Document not found'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
            <DocumentContent document={document} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
