// Realtime subscription helpers
// Used in React components only — browser-side
import { createClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type DocumentChangeEvent = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export function subscribeToDocumentChanges(
  callback: (event: DocumentChangeEvent) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel("document-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "documents",
        // Only receive events for approved documents
        filter: "validation_status=eq.APPROVED",
      },
      (payload) => {
        callback({
          eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
          new: payload.new as Record<string, unknown>,
          old: payload.old as Record<string, unknown>,
        });
      }
    )
    .subscribe();

  return channel;
}

export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  const supabase = createClient();
  await supabase.removeChannel(channel);
}