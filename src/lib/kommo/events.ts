import { kommoFetch } from "./client";

export interface KommoEventStatusValue {
  lead_status?: {
    id: number;
    pipeline_id: number;
  };
}

export interface KommoEvent {
  id: string;
  type: string;
  entity_id: number;
  entity_type: string;
  created_by: number;
  created_at: number;
  account_id?: number;
  value_before?: KommoEventStatusValue[];
  value_after?: KommoEventStatusValue[];
}

interface EventsResponse {
  _page?: number;
  _embedded?: {
    events?: KommoEvent[];
  };
  _links?: {
    next?: { href: string };
  };
}

export interface FetchEventsOptions {
  createdFrom?: number;
  createdTo?: number;
  types?: string[];
  entityIds?: number[];
}

export async function fetchLeadEvents(options: FetchEventsOptions = {}): Promise<KommoEvent[]> {
  const events: KommoEvent[] = [];
  const limit = 250;
  let page = 1;

  const types = options.types ?? ["lead_status_changed"];

  while (true) {
    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    qs.set("page", String(page));
    for (const t of types) qs.append("filter[type][]", t);
    if (options.createdFrom !== undefined) {
      qs.set("filter[created_at][from]", String(options.createdFrom));
    }
    if (options.createdTo !== undefined) {
      qs.set("filter[created_at][to]", String(options.createdTo));
    }
    if (options.entityIds?.length) {
      for (const id of options.entityIds) qs.append("filter[entity_id][]", String(id));
    }

    const res = await kommoFetch<EventsResponse>(`/api/v4/events?${qs.toString()}`);
    const batch = res._embedded?.events ?? [];
    events.push(...batch);

    if (batch.length < limit) break;
    if (!res._links?.next) break;
    page++;

    if (page > 200) {
      console.warn("[events] parando após 200 páginas");
      break;
    }
  }

  return events;
}
