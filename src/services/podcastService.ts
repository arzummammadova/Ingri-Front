import { api } from "./api";
import type { Podcast } from "@/types";

export const podcastService = {
  list: async () => (await api.get<{ items: Podcast[] }>("/podcasts")).data.items,
  get: async (slug: string) => (await api.get<{ item: Podcast }>(`/podcasts/${slug}`)).data.item,
};
