"use client";

import { useState, useTransition } from "react";
import { FormBuilder } from "@/src/features/events/components/wizard/FormBuilder";
import type { CustomField } from "@/src/services/models/event.model";
import { saveCustomFormAction } from "../actions/customForms.action";
import type { CustomFormKind, CustomFormPublic, CustomFormStatus } from "../types";
import { buttonClass, fieldClass } from "@/src/lib/ui";
import { Card, CardBody } from "@/src/shared_components/ui/Card";
import { FilterTabs } from "@/src/shared_components/ui/FilterTabs";

export function FormEditorClient({
  ownerId,
  form,
  publicOrigin,
}: {
  ownerId: string;
  form: CustomFormPublic;
  publicOrigin: string;
}) {
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [kind, setKind] = useState<CustomFormKind>(form.kind);
  const [status, setStatus] = useState<CustomFormStatus>(form.status);
  const [fields, setFields] = useState<CustomField[]>(form.fields || []);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shareUrl = `${publicOrigin}/f/${form.publicToken}`;
  const editorHref = `/organizer/${ownerId}/forms/${form.id}`;
  const responsesHref = `/organizer/${ownerId}/forms/${form.id}/responses`;

  const save = (patch?: { status?: CustomFormStatus }) => {
    start(async () => {
      const r = await saveCustomFormAction({
        ownerId,
        formId: form.id,
        title,
        description,
        kind,
        status: patch?.status ?? status,
        fields,
      });
      if (!r.ok) {
        setError(r.error.message);
        return;
      }
      if (patch?.status) setStatus(patch.status);
      setMessage("Saved.");
      setError(null);
    });
  };

  return (
    <div className="space-y-6">
      <FilterTabs
        label="Form views"
        activeValue="editor"
        tabs={[
          { label: "Editor", value: "editor", href: editorHref },
          { label: "Responses", value: "responses", href: responsesHref },
        ]}
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-ink-soft">{message}</p> : null}

      <Card title="Form details">
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-ink sm:col-span-2">
              Title
              <input
                className={`${fieldClass} mt-1`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="block text-xs text-ink sm:col-span-2">
              Description
              <textarea
                className={`${fieldClass} mt-1 min-h-[4rem]`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="block text-xs text-ink">
              Kind
              <select
                className={`${fieldClass} mt-1`}
                value={kind}
                onChange={(e) => setKind(e.target.value as CustomFormKind)}
              >
                <option value="survey">Survey</option>
                <option value="feedback">Feedback</option>
                <option value="checklist">Checklist</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block text-xs text-ink">
              Status
              <select
                className={`${fieldClass} mt-1`}
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomFormStatus)}
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
        </CardBody>
      </Card>

      <Card title="Public link">
        <CardBody>
          <p className="break-all text-sm text-ink-soft">{shareUrl}</p>
          <p className="mt-1 text-xs text-ink-soft">Set status to Open before sharing.</p>
        </CardBody>
      </Card>

      <Card title="Questions">
        <CardBody>
          <p className="mb-3 text-xs text-ink-soft">
            File and image fields are omitted from the public form for now.
          </p>
          <FormBuilder fields={fields} onChange={setFields} />
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClass("primary", "sm")}
          disabled={pending}
          onClick={() => save()}
        >
          Save
        </button>
        <button
          type="button"
          className={buttonClass("secondary", "sm")}
          disabled={pending}
          onClick={() => save({ status: "open" })}
        >
          Save & open
        </button>
        <button
          type="button"
          className={buttonClass("ghost", "sm")}
          disabled={pending}
          onClick={() => save({ status: "closed" })}
        >
          Close form
        </button>
      </div>
    </div>
  );
}
