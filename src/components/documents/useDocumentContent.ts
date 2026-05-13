import { useState, useEffect } from "react";
import { toErrorMessage } from "@/utils/error-utils";

interface UseDocumentContentReturn {
  content: string;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch the text content of a document by its ID.
 */
export function useDocumentContent(documentId?: string | null): UseDocumentContentReturn {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const text = await res.text();
        if (!controller.signal.aborted) {
          setContent(text);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error fetching document content:", err);
        setError(toErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => controller.abort();
  }, [documentId]);

  return {
    content: documentId ? content : "",
    loading: Boolean(documentId) && loading,
    error: documentId ? error : null,
  };
}
