import { use } from "react";
import { DocumentPageView } from "@/views/documents/DocumentPageView";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DocumentPageView id={id} />;
}
