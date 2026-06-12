"use client";

import { offlineDb, type OfflineDraft } from "./db";

export async function saveOfflineDraft(type: OfflineDraft["type"], payload: unknown) {
  return offlineDb.drafts.add({
    type,
    payload,
    synced: 0,
    createdAt: new Date().toISOString()
  });
}

export async function syncOfflineDrafts() {
  const drafts = await offlineDb.drafts.where("synced").equals(0).toArray();

  for (const draft of drafts) {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });

    if (response.ok && draft.id) {
      await offlineDb.drafts.update(draft.id, { synced: 1 });
    }
  }
}
