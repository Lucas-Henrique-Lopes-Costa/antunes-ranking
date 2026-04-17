// Tipos da API do Kommo CRM

export interface KommoLead {
  id: number;
  name: string;
  price: number;
  responsible_user_id: number;
  group_id: number;
  status_id: number;
  pipeline_id: number;
  loss_reason_id: number | null;
  created_by: number;
  updated_by: number;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
  closed_at: number | null; // Unix timestamp
  closest_task_at: number | null;
  is_deleted: boolean;
  custom_fields_values: unknown[] | null;
  score: number | null;
  account_id: number;
  labor_cost: number | null;
  _embedded?: {
    tags?: { id: number; name: string }[];
    companies?: { id: number }[];
    contacts?: { id: number; is_main: boolean }[];
  };
}

export interface KommoLeadsResponse {
  _page: number;
  _links: { self: { href: string } };
  _embedded: {
    leads: KommoLead[];
  };
}

export interface KommoUser {
  id: number;
  name: string;
  email: string;
  lang: string;
  rights: {
    is_admin: boolean;
    is_free: boolean;
    is_active: boolean;
  };
}

export interface KommoUsersResponse {
  _embedded: {
    users: KommoUser[];
  };
}

export interface KommoPipeline {
  id: number;
  name: string;
  sort: number;
  is_main: boolean;
  is_unsorted_on: boolean;
  is_archive: boolean;
  account_id: number;
  _embedded: {
    statuses: KommoStatus[];
  };
}

export interface KommoStatus {
  id: number;
  name: string;
  sort: number;
  is_editable: boolean;
  pipeline_id: number;
  color: string;
  type: number;
  account_id: number;
}

export interface KommoPipelinesResponse {
  _embedded: {
    pipelines: KommoPipeline[];
  };
}

export interface KommoTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface KommoAuthConfig {
  subdomain: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}
