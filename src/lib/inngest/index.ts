import { Inngest } from "inngest";
import { INNGEST } from "@/constants/Ingest";

/**
 * Inngest client
 * Used to send events and define background workflows
 */
export const inngest = new Inngest({
  id: "ai-doc-ingestion-app",

  // Optional but useful in dev
  eventKey: INNGEST.EVENT_KEY,
});
