import { kommoFetch } from "./client";
import type { KommoPipeline, KommoPipelinesResponse } from "@/types/kommo";

export async function fetchKommoPipelines(): Promise<KommoPipeline[]> {
  const data = await kommoFetch<KommoPipelinesResponse>(
    "/api/v4/leads/pipelines"
  );
  return data._embedded?.pipelines ?? [];
}
