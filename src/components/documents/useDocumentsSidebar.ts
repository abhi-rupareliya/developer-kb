import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useChat } from "@/contexts/chat-context";
import { GET_DOCUMENTS } from "@/graphql/queries";
import { DELETE_DOCUMENT } from "@/graphql/mutations";
import { Document } from "@/types/graphql";

export function useDocumentsSidebar() {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { selectedDocumentIds, toggleDocumentSelection } = useChat();
  const { data, loading, error, refetch } = useQuery<{ documents: Document[] }>(
    GET_DOCUMENTS,
  );
  const [deleteDocument] = useMutation(DELETE_DOCUMENT);

  const processingDocumentIds = useMemo(() => {
    return (
      data?.documents
        ?.filter(
          (doc) =>
            doc.processing_status === "processing" ||
            doc.processing_status === "pending",
        )
        .map((doc) => doc.id) ?? []
    );
  }, [data?.documents]);

  useEffect(() => {
    if (processingDocumentIds.length === 0) return;

    const interval = setInterval(() => {
      void refetch();
    }, 2000);

    return () => clearInterval(interval);
  }, [processingDocumentIds.length, refetch]);

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, documentId: string) => {
      event.stopPropagation();
      setMenuAnchor(event.currentTarget);
      setSelectedDocumentId(documentId);
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setSelectedDocumentId(null);
  }, []);

  const handleDeleteDocument = async () => {
    if (!selectedDocumentId) return;

    try {
      await deleteDocument({
        variables: { id: selectedDocumentId },
      });

      if (selectedDocumentIds.includes(selectedDocumentId)) {
        toggleDocumentSelection(selectedDocumentId);
      }

      void refetch();
      handleMenuClose();
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    void refetch();
  };

  return {
    documents: data?.documents || [],
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
  };
}
