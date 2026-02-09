import { api } from '@/lib/api/axios'
import type { paths } from "./schema";
import { authStore } from "./authStore";

type LoginReq =
  NonNullable<paths["/auth/login"]["post"]["requestBody"]>["content"]["application/json"];

type LoginRes =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

type RefreshRes =
  paths["/auth/refresh"]["post"]["responses"]["200"]["content"]["application/json"];

type MeRes =
  paths["/auth/me"]["get"]["responses"]["200"]["content"]["application/json"];

export async function login(body: LoginReq) {
  const res = await api.post<LoginRes>("/auth/login", body);
  const accessToken = res.data.data.accessToken;
  authStore.setAccessToken(accessToken);
  return res.data;
}

export async function refresh() {
  const res = await api.post<RefreshRes>("/auth/refresh");
  const accessToken = res.data.data.accessToken;
  authStore.setAccessToken(accessToken);
  return res.data;
}

export async function me() {
  const res = await api.get<MeRes>("/auth/me");
  return res.data;
}

export async function logout() {
  await api.post("/auth/logout");
  authStore.clear();
}
