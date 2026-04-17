import { kommoFetch } from "./client";
import type { KommoLead, KommoLeadsResponse } from "@/types/kommo";

interface FetchLeadsOptions {
  pipelineIds?: number[];
  updatedFrom?: number; // Unix timestamp
  updatedTo?: number;
  closedFrom?: number;
  closedTo?: number;
  page?: number;
  limit?: number;
}

export async function fetchLeadsPage(
  options: FetchLeadsOptions = {}
): Promise<{ leads: KommoLead[]; hasMore: boolean }> {
  const params = new URLSearchParams();
  const page = options.page ?? 1;
  const limit = options.limit ?? 250;

  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("order[updated_at]", "asc");

  if (options.pipelineIds?.length) {
    for (const id of options.pipelineIds) {
      params.append("filter[pipeline_id][]", String(id));
    }
  }

  if (options.updatedFrom) {
    params.set("filter[updated_at][from]", String(options.updatedFrom));
  }
  if (options.updatedTo) {
    params.set("filter[updated_at][to]", String(options.updatedTo));
  }
  if (options.closedFrom) {
    params.set("filter[closed_at][from]", String(options.closedFrom));
  }
  if (options.closedTo) {
    params.set("filter[closed_at][to]", String(options.closedTo));
  }

  const data = await kommoFetch<KommoLeadsResponse>(
    `/api/v4/leads?${params.toString()}`
  );

  const leads = data._embedded?.leads ?? [];
  return { leads, hasMore: leads.length === limit };
}

export async function fetchAllLeads(
  options: Omit<FetchLeadsOptions, "page"> = {}
): Promise<KommoLead[]> {
  const allLeads: KommoLead[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchLeadsPage({ ...options, page });
    allLeads.push(...result.leads);
    hasMore = result.hasMore;
    page++;

    // Safety: max 100 pages (25,000 leads)
    if (page > 100) {
      console.warn("Limite de 100 páginas atingido na busca de leads");
      break;
    }
  }

  return allLeads;
}
