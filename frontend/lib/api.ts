import { ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export class ApiError extends Error {}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch {
    return {
      success: false,
      error: { message: "Could not reach the election API. Check your connection and try again." },
    };
  }
}

export function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
