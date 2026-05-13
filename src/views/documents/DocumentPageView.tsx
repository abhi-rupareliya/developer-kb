"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_DOCUMENTS } from "@/graphql/queries";
import { Document } from "@/types/graphql";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DocumentContent } from "@/components/documents/DocumentContent";

export function DocumentPageView({ id }: { id: string }) {
  const router = useRouter();
  const { data, loading, error: queryError } = useQuery<{ documents: Document[] }>(GET_DOCUMENTS);

  const documents = data?.documents || [];
  const document = documents.find((doc) => doc.id === id);

  if (queryError) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Alert severity="error" action={<Button color="inherit" onClick={() => router.back()}>Back</Button>}>
          Failed to load documents: {queryError.message}
        </Alert>
      </Container>
    );
  }

  if (loading || !document) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box
          sx={{
            minHeight: '70vh',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="subtitle1" color="text.secondary">
              {loading ? 'Loading document…' : 'Document not found'}
            </Typography>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
              Back
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1.5, md: 2 } }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
            Back
          </Button>
        </Box>

        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            {document.title || document.original_file_name || 'Document'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {document.original_file_name}
          </Typography>
        </Box>

        <DocumentContent document={document} />
      </Stack>
    </Container>
  );
}
