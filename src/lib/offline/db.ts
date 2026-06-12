"use client";

import Dexie, { type Table } from "dexie";

export type OfflineDraft = {
  id?: number;
  type: "apr" | "pt" | "assinatura";
  payload: unknown;
  synced: 0 | 1;
  createdAt: string;
};

class SstOfflineDatabase extends Dexie {
  drafts!: Table<OfflineDraft, number>;

  constructor() {
    super("sst-offline");
    this.version(1).stores({
      drafts: "++id,type,synced,createdAt"
    });
  }
}

export const offlineDb = new SstOfflineDatabase();
