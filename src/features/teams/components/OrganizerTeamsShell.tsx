"use client";

import { useMemo, useState } from "react";
import { Download, Plus, UserPlus } from "lucide-react";
import PageHeader from "@/src/shared_components/ui/PageHeader";
import { MetricTile } from "@/src/shared_components/ui/MetricTile";
import { Breadcrumbs } from "@/src/shared_components/ui/Breadcrumbs";
import { FilterTabs } from "@/src/shared_components/ui/FilterTabs";
import { Card, CardBody } from "@/src/shared_components/ui/Card";
import { LockedModulePanel } from "@/src/features/permissions/components/LockedModulePanel";
import { buttonClass, fieldClass, labelClass } from "@/src/lib/ui";
import type {
  OrganizerAccessGrantSummary,
  OrganizerTeamsStats,
  RecruitmentFormDoc,
  StaffApplicant,
  TeamPositionDoc,
  TeamWithMembers,
} from "../teamEngine.types";
import {
  ACCESS_LABELS,
  ORGANIZER_TEAMS_ACCESS,
  ORGANIZER_TEAMS_ROLES,
  ORGANIZER_TEAMS_TABS,
  ROLE_LABELS,
  TAB_LABELS,
  isAdvancedOrganizerTeamsTab,
  organizerTeamsHref,
  type OrganizerTeamsFilters,
} from "../organizerTeams.filters";
import { AddMemberModal } from "./AddMemberModal";
import { AddTeamModal } from "./AddTeamModal";
import { ExportTeamsModal } from "./ExportTeamsModal";
import { GrantInviteModal } from "./GrantInviteModal";
import { OrganizerAccessTab } from "./OrganizerAccessTab";
import { OrganizerRecruitmentTab } from "./OrganizerRecruitmentTab";
import { OrganizerTeamsTab } from "./OrganizerTeamsTab";

export type OrganizerTeamsShellProps = {
  organizerId: string;
  currentUserId: string;
  currentUserName?: string;
  currentUserEmail?: string;
  advanced: boolean;
  filters: OrganizerTeamsFilters;
  stats: OrganizerTeamsStats;
  teams: TeamWithMembers[];
  assignmentCounts: Record<string, number>;
  grants: OrganizerAccessGrantSummary[];
  forms: RecruitmentFormDoc[];
  applicants: StaffApplicant[];
  events: { id: string; title: string }[];
  applyOrigin: string;
  advancedDetails: {
    team: TeamWithMembers;
    positions: TeamPositionDoc[];
    applicants: StaffApplicant[];
    forms: RecruitmentFormDoc[];
  }[];
};

function statDisplay(advanced: boolean, advancedOnly: boolean, value: number): string {
  if (advancedOnly && !advanced) return "—";
  return String(value);
}

export function OrganizerTeamsShell({
  organizerId,
  currentUserId,
  currentUserName = "",
  currentUserEmail = "",
  advanced,
  filters,
  stats,
  teams,
  assignmentCounts,
  grants,
  forms,
  applicants,
  events,
  applyOrigin,
  advancedDetails,
}: OrganizerTeamsShellProps) {
  const basePath = `/organizer/${organizerId}/teams`;
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [grantAfterCreate, setGrantAfterCreate] = useState<string | null>(null);

  const lockedAdvancedTab = isAdvancedOrganizerTeamsTab(filters.tab) && !advanced;

  const positionsByTeam = useMemo(() => {
    const map = new Map<string, TeamPositionDoc[]>();
    for (const d of advancedDetails) map.set(d.team.id, d.positions);
    return map;
  }, [advancedDetails]);

  const positionsByTeamRecord = useMemo(() => {
    const out: Record<string, TeamPositionDoc[]> = {};
    for (const [id, list] of positionsByTeam) out[id] = list;
    return out;
  }, [positionsByTeam]);

  function openAddMember(teamId?: string) {
    setAddMemberTeamId(teamId || null);
    setShowAddMember(true);
  }

  const filterTabs = ORGANIZER_TEAMS_TABS.map((tab) => ({
    value: tab,
    href: organizerTeamsHref(basePath, filters, { tab, page: 1 }),
    label:
      !advanced && isAdvancedOrganizerTeamsTab(tab) ? `${TAB_LABELS[tab]} · Paid` : TAB_LABELS[tab],
  }));

  return (
    <div className="px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: `/organizer/${organizerId}/dashboard` },
            { label: "Teams" },
          ]}
        />
        <PageHeader
          eyebrow="Teams · Access management"
          title="Teams"
          description={
            advanced
              ? "Shared ops library — create teams, recruit, grant access. Assign them from each event’s Team tab."
              : "Create teams and add members. Positions, recruitment, and grants need Advanced team roles."
          }
          actions={
            <>
              <button
                type="button"
                className={buttonClass("primary", "sm")}
                onClick={() => setShowAddTeam(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add team
              </button>
              <button
                type="button"
                className={buttonClass("secondary", "sm")}
                onClick={() => openAddMember()}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add member
              </button>
              <button
                type="button"
                className={buttonClass("secondary", "sm")}
                onClick={() => setShowExport(true)}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </>
          }
        />

        <div className="overflow-hidden rounded-xl border border-line bg-paper sm:grid sm:grid-cols-3 lg:grid-cols-7">
          <MetricTile
            label="Teams"
            value={statDisplay(advanced, false, stats.teamsCount)}
            size="md"
          />
          <MetricTile
            label="Members"
            value={statDisplay(advanced, false, stats.membersCount)}
            size="md"
          />
          <MetricTile
            label="Leads with access"
            value={statDisplay(advanced, true, stats.leadsWithAccess)}
            size="md"
          />
          <MetricTile
            label="Open forms"
            value={statDisplay(advanced, true, stats.openForms)}
            size="md"
          />
          <MetricTile
            label="New applicants (7d)"
            value={statDisplay(advanced, true, stats.newApplicants7d)}
            size="md"
          />
          <MetricTile
            label="In interview"
            value={statDisplay(advanced, true, stats.inInterview)}
            size="md"
          />
          <MetricTile
            label="Pending invites"
            value={statDisplay(advanced, true, stats.pendingInvites)}
            size="md"
          />
        </div>

        <FilterTabs tabs={filterTabs} activeValue={filters.tab} label="Teams sections" />

        <Card tone="flat">
          <CardBody>
            <form method="get" action={basePath} className="flex min-w-0 flex-wrap items-end gap-3">
              {filters.tab !== "teams" ? (
                <input type="hidden" name="tab" value={filters.tab} />
              ) : null}
              <label className={`min-w-[12rem] flex-1 ${labelClass}`}>
                Search
                <input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Name or email"
                  className={`${fieldClass} mt-1`}
                />
              </label>
              <label className={`w-40 ${labelClass}`}>
                Team
                <select name="team" defaultValue={filters.team} className={`${fieldClass} mt-1`}>
                  <option value="">All teams</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`w-36 ${labelClass}`}>
                Role
                <select name="role" defaultValue={filters.role} className={`${fieldClass} mt-1`}>
                  {ORGANIZER_TEAMS_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`w-36 ${labelClass}`}>
                Access
                <select
                  name="access"
                  defaultValue={filters.access}
                  className={`${fieldClass} mt-1`}
                >
                  {ORGANIZER_TEAMS_ACCESS.map((a) => (
                    <option key={a} value={a}>
                      {ACCESS_LABELS[a]}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={buttonClass("secondary", "sm")}>
                Apply
              </button>
            </form>
          </CardBody>
        </Card>

        {lockedAdvancedTab ? (
          <LockedModulePanel
            moduleKey="teams_advanced_roles"
            title={
              filters.tab === "recruitment"
                ? "Recruitment needs Advanced team roles"
                : "Access grants need Advanced team roles"
            }
            description={
              filters.tab === "recruitment"
                ? "Open application forms, interview scheduling, and onboarding are included on the paid Teams module."
                : "Invite people to the dashboard with scoped permissions on the paid Teams module."
            }
            ctaLabel="Back to Teams"
            ctaHref={organizerTeamsHref(basePath, filters, { tab: "teams", page: 1 })}
          />
        ) : null}

        {!lockedAdvancedTab && filters.tab === "teams" ? (
          <OrganizerTeamsTab
            organizerId={organizerId}
            advanced={advanced}
            filters={filters}
            teams={teams}
            assignmentCounts={assignmentCounts}
            grants={grants}
            positionsByTeam={positionsByTeam}
            onRequestAddMember={openAddMember}
          />
        ) : null}

        {!lockedAdvancedTab && filters.tab === "recruitment" ? (
          <OrganizerRecruitmentTab
            organizerId={organizerId}
            teams={teams}
            forms={forms}
            applicants={applicants}
            positionsByTeam={positionsByTeamRecord}
            applyOrigin={applyOrigin}
          />
        ) : null}

        {!lockedAdvancedTab && filters.tab === "access" ? (
          <OrganizerAccessTab
            organizerId={organizerId}
            grants={grants}
            teams={teams}
            events={events}
          />
        ) : null}

        <AddTeamModal
          open={showAddTeam}
          onClose={() => setShowAddTeam(false)}
          organizerId={organizerId}
          advanced={advanced}
          currentUser={{
            userId: currentUserId,
            name: currentUserName,
            email: currentUserEmail,
          }}
          onCreated={({ inviteLead, leadEmail }) => {
            if (inviteLead && leadEmail) setGrantAfterCreate(leadEmail);
          }}
        />

        <AddMemberModal
          open={showAddMember}
          onClose={() => {
            setShowAddMember(false);
            setAddMemberTeamId(null);
          }}
          teams={teams}
          positionsByTeam={positionsByTeam}
          advanced={advanced}
          preselectTeamId={addMemberTeamId}
        />

        {showExport ? (
          <ExportTeamsModal
            teams={teams}
            positionsByMember={new Map()}
            scope={{ kind: "organizer", organizerId }}
            forms={forms}
            onClose={() => setShowExport(false)}
          />
        ) : null}

        {grantAfterCreate ? (
          <GrantInviteModal
            organizerId={organizerId}
            initialEmail={grantAfterCreate}
            onClose={() => setGrantAfterCreate(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
