import { api } from "./api";

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  sort: string;
  order: "asc" | "desc";
  facets: Record<string, string[]> | null;
};

export type ListParams = Record<string, string | number | undefined>;

/** Server-side paginated list: GET /<path>?page&limit&sort&order&q&level&... */
export async function fetchPage<T>(path: string, params: ListParams): Promise<Paged<T>> {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "all"));
  return (await api.get<Paged<T>>(path, { params: { page: 1, ...clean } })).data;
}
