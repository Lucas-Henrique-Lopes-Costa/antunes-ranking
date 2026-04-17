import { prisma } from "@/lib/prisma";
import { fetchLeadEvents } from "@/lib/kommo/events";
import type { KommoEvent } from "@/lib/kommo/events";

const LAST_EVENT_KEY = "last_event_fetched_at";

async function getLastEventTimestamp(): Promise<number | undefined> {
  const row = await prisma.appConfig.findUnique({ where: { key: LAST_EVENT_KEY } });
  if (!row) return undefined;
  const n = Number(row.value);
  return Number.isFinite(n) ? n : undefined;
}

async function setLastEventTimestamp(ts: number): Promise<void> {
  await prisma.appConfig.upsert({
    where: { key: LAST_EVENT_KEY },
    update: { value: ts },
    create: { key: LAST_EVENT_KEY, value: ts },
  });
}

function extractStatus(value: KommoEvent["value_before"] | KommoEvent["value_after"]): {
  status?: number;
  pipeline?: number;
} {
  const first = value?.[0]?.lead_status;
  if (!first) return {};
  return { status: first.id, pipeline: first.pipeline_id };
}

export async function syncEvents(): Promise<{
  fetched: number;
  stored: number;
  latestTs: number | null;
}> {
  const lastTs = await getLastEventTimestamp();
  const createdFrom = lastTs ? lastTs + 1 : undefined;

  const events = await fetchLeadEvents({ createdFrom });

  if (events.length === 0) {
    return { fetched: 0, stored: 0, latestTs: null };
  }

  const userKommoIds = Array.from(new Set(events.map((e) => e.created_by)));
  const users = await prisma.kommoUser.findMany({
    where: { kommoUserId: { in: userKommoIds } },
    select: { id: true, kommoUserId: true },
  });
  const userMap = new Map(users.map((u) => [u.kommoUserId, u.id]));

  let stored = 0;
  let maxTs = lastTs ?? 0;

  for (const e of events) {
    const before = extractStatus(e.value_before);
    const after = extractStatus(e.value_after);

    await prisma.leadEvent.upsert({
      where: { kommoEventId: String(e.id) },
      update: {
        userId: userMap.get(e.created_by) ?? null,
      },
      create: {
        kommoEventId: String(e.id),
        kommoLeadId: e.entity_id,
        createdByKommo: e.created_by,
        userId: userMap.get(e.created_by) ?? null,
        type: e.type,
        statusBefore: before.status ?? null,
        statusAfter: after.status ?? null,
        pipelineBefore: before.pipeline ?? null,
        pipelineAfter: after.pipeline ?? null,
        kommoCreatedAt: new Date(e.created_at * 1000),
        raw: e as unknown as object,
      },
    });
    stored++;
    if (e.created_at > maxTs) maxTs = e.created_at;
  }

  if (maxTs > (lastTs ?? 0)) {
    await setLastEventTimestamp(maxTs);
  }

  return { fetched: events.length, stored, latestTs: maxTs || null };
}
