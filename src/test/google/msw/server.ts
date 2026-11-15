import { setupServer } from "msw/node";
import { googleMockHandlers } from "./handlers";

/** Node MSW server for Google mocks — start in tests / scripts when GOOGLE_MODE=mock. */
export const googleMockServer = setupServer(...googleMockHandlers);

export function startGoogleMockServer(): typeof googleMockServer {
  googleMockServer.listen({ onUnhandledRequest: "bypass" } as never);
  return googleMockServer;
}

export function stopGoogleMockServer(): void {
  googleMockServer.close();
}
