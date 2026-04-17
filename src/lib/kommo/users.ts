import { kommoFetch } from "./client";
import type { KommoUser, KommoUsersResponse } from "@/types/kommo";

export async function fetchKommoUsers(): Promise<KommoUser[]> {
  const allUsers: KommoUser[] = [];
  let page = 1;

  while (true) {
    const data = await kommoFetch<KommoUsersResponse>(
      `/api/v4/users?page=${page}&limit=250`
    );

    const users = data._embedded?.users ?? [];
    allUsers.push(...users);

    if (users.length < 250) break;
    page++;
  }

  return allUsers;
}
