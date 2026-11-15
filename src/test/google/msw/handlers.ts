import { http, HttpResponse } from "msw";

/** Minimal Google API stubs for CI / local GOOGLE_MODE=mock. */
export const googleMockHandlers = [
  http.post("https://oauth2.googleapis.com/token", async () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      expires_in: 3600,
      token_type: "Bearer",
      refresh_token: "mock-refresh-token",
      scope: "https://www.googleapis.com/auth/gmail.send",
    });
  }),

  http.post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", async () => {
    return HttpResponse.json({ id: "mock-msg-1", labelIds: ["SENT"] });
  }),

  http.post("https://www.googleapis.com/gmail/v1/users/me/messages/send", async () => {
    return HttpResponse.json({ id: "mock-msg-1", labelIds: ["SENT"] });
  }),

  http.post("https://www.googleapis.com/calendar/v3/calendars/:calId/events", async () => {
    return HttpResponse.json({
      id: "mock-event-1",
      hangoutLink: "https://meet.google.com/mock-meet",
      htmlLink: "https://calendar.google.com/event?eid=mock",
    });
  }),

  http.get("https://www.googleapis.com/calendar/v3/calendars/:calId/events/:eventId", async () => {
    return HttpResponse.json({ id: "mock-event-1", status: "confirmed" });
  }),

  http.delete(
    "https://www.googleapis.com/calendar/v3/calendars/:calId/events/:eventId",
    async () => {
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get("https://www.googleapis.com/drive/v3/files", async () => {
    return HttpResponse.json({ files: [] });
  }),

  http.post("https://www.googleapis.com/drive/v3/files", async () => {
    return HttpResponse.json({
      id: "mock-file-1",
      name: "mock",
      mimeType: "application/octet-stream",
      webViewLink: "https://drive.google.com/file/d/mock-file-1/view",
    });
  }),

  http.get("https://www.googleapis.com/drive/v3/files/:fileId", async ({ params }) => {
    return HttpResponse.json({
      id: params.fileId,
      name: "mock",
      mimeType: "application/octet-stream",
      webViewLink: `https://drive.google.com/file/d/${params.fileId}/view`,
    });
  }),
];
