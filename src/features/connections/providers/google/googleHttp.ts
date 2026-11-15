import { getGoogleMode } from "@/src/env";

/**
 * Shared Google HTTP entry — when GOOGLE_MODE=mock, MSW intercepts these URLs
 * (handlers in src/test/google/msw). Live mode uses real fetch.
 */
export async function googleHttp(
  accessToken: string,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  void getGoogleMode(); // ensures env is readable; MSW listens on process when started
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

export function isGoogleMockMode(): boolean {
  try {
    return getGoogleMode() === "mock";
  } catch {
    return process.env.GOOGLE_MODE !== "live";
  }
}
