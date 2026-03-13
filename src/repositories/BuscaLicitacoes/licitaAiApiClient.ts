import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

const apiBaseUrl =
  (import.meta.env.VITE_LICITAAI_API_URL as string | undefined) ??
  "/api/licitaai";

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

let lastApiErrorToastAt = 0;

function notifyApiError(status?: number) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastApiErrorToastAt < 1200) return;
  lastApiErrorToastAt = now;

  if (status && status >= 400 && status < 600) {
    toast.error(`Ocorreu um erro (${status})`);
    return;
  }

  toast.error("Ocorreu um erro");
}

async function getAccessToken(options?: { forceRefresh?: boolean }): Promise<string> {
  if (options?.forceRefresh) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      throw new Error("Unable to refresh Supabase session for API authentication.");
    }

    const refreshedToken = data.session?.access_token;
    if (!refreshedToken) {
      throw new Error("No refreshed Supabase access token returned.");
    }

    return refreshedToken;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error("Unable to read Supabase session for API authentication.");
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error("No authenticated Supabase session found.");
  }

  return token;
}

async function signOutAndRedirectToLogin(): Promise<void> {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

async function requestWithAuthRetry(
  path: string,
  init: { method: "GET" | "POST"; body?: string },
): Promise<Response> {
  const url = `${normalizeBaseUrl(apiBaseUrl)}${path}`;
  let token: string;
  try {
    token = await getAccessToken();
  } catch {
    notifyApiError(401);
    await signOutAndRedirectToLogin();
    throw new Error(`No active session for ${path}. Redirecting to login.`);
  }

  const buildInit = (accessToken: string): RequestInit => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };
    if (init.method === "POST") {
      headers["Content-Type"] = "application/json";
    }
    return {
      method: init.method,
      headers,
      body: init.body,
    };
  };

  const firstResponse = await fetch(url, buildInit(token));
  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  try {
    const refreshedToken = await getAccessToken({ forceRefresh: true });
    const retryResponse = await fetch(url, buildInit(refreshedToken));
    if (retryResponse.status !== 401) {
      return retryResponse;
    }
  } catch {
    // Ignore and continue to force sign out below.
  }

  notifyApiError(401);
  await signOutAndRedirectToLogin();
  throw new Error(`LicitaAI API 401 for ${path}. Session expired, redirecting to login.`);
}

export async function licitaAiGet(path: string): Promise<unknown> {
  const response = await requestWithAuthRetry(path, { method: "GET" });
  if (!response.ok) {
    if (response.status >= 400 && response.status < 600) {
      notifyApiError(response.status);
    }
    const body = await response.text();
    throw new Error(`LicitaAI API ${response.status} for ${path}: ${body}`);
  }
  return response.json();
}

export async function licitaAiPost(path: string, body: unknown): Promise<unknown> {
  const response = await requestWithAuthRetry(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status >= 400 && response.status < 600) {
      notifyApiError(response.status);
    }
    const payload = await response.text();
    throw new Error(`LicitaAI API ${response.status} for ${path}: ${payload}`);
  }

  return response.json();
}
