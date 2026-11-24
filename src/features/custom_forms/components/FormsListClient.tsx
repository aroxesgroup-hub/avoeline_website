"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCustomFormAction, deleteCustomFormAction } from "../actions/customForms.action";
import type { CustomFormPublic } from "../types";
import { buttonClass, fieldClass, labelClass } from "@/src/lib/ui";
import { Card, CardBody } from "@/src/shared_components/ui/Card";
import { EmptyState } from "@/src/shared_components/ui/EmptyState";
import { ClipboardList } from "lucide-react";

export function FormsListClient({
  ownerId,
  initialForms,
}: {
  ownerId: string;
  initialForms: CustomFormPublic[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"survey" | "feedback" | "checklist" | "other">("survey");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card tone="flat">
        <CardBody>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await createCustomFormAction({
                  ownerId,
                  title: title.trim() || "Untitled form",
                  kind,
                });
                if (!r.ok) {
                  setError(r.error.message);
                  return;
                }
                router.push(`/organizer/${ownerId}/forms/${r.data.form.id}`);
              });
            }}
          >
            <label className={labelClass}>
              New form title
              <input
                className={`${fieldClass} mt-1 min-w-[14rem]`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Feedback after demo day"
              />
            </label>
            <label className={labelClass}>
              Kind
              <select
                className={`${fieldClass} mt-1`}
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="survey">Survey</option>
                <option value="feedback">Feedback</option>
                <option value="checklist">Checklist</option>
                <option value="other">Other</option>
              </select>
            </label>
            <button type="submit" className={buttonClass("primary", "sm")} disabled={pending}>
              Create
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        </CardBody>
      </Card>

      {!initialForms.length ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="No forms yet"
          description="Create a survey, feedback form, or checklist — share the public link and collect responses here."
        />
      ) : (
        <Card tone="flat">
          <ul className="divide-y divide-line">
            {initialForms.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <Link
                    href={`/organizer/${ownerId}/forms/${f.id}`}
                    className="font-medium text-ink underline-offset-2 hover:underline"
                  >
                    {f.title}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {f.kind} · {f.status} · {f.responseCount ?? 0} response(s)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/organizer/${ownerId}/forms/${f.id}/responses`}
                    className={buttonClass("secondary", "sm")}
                  >
                    Responses
                  </Link>
                  <button
                    type="button"
                    className={buttonClass("ghost", "sm")}
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await deleteCustomFormAction({ ownerId, formId: f.id });
                        router.refresh();
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
