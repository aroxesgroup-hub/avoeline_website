import fs from "node:fs";
import path from "node:path";

export type JourneyState = {
  organizerEmail: string;
  departmentEmail: string;
  vendorEmail: string;
  password: string;
  presidentEmail?: string;
  clubName?: string;
  memberEmail?: string;
  eventTitle?: string;
};

const file = path.join(process.cwd(), "e2e/.auth/journey-state.json");

export function writeJourneyState(patch: Partial<JourneyState>): JourneyState {
  const prev = readJourneyState();
  const next = { ...prev, ...patch } as JourneyState;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(next, null, 2));
  return next;
}

export function readJourneyState(): Partial<JourneyState> {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8")) as Partial<JourneyState>;
}
