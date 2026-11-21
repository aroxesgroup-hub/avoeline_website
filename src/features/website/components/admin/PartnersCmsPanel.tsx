"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { buttonClass, fieldClass, labelClass } from "@/src/lib/ui";
import { ConfirmDialog } from "@/src/shared_components/ui/ConfirmDialog";
import { StatusBadge } from "@/src/shared_components/ui/StatusBadge";
import { EmptyState } from "@/src/shared_components/ui/EmptyState";
import { Modal } from "@/src/components/ui/Modal";
import {
  deletePartnerAction,
  setPartnerConsentAction,
  upsertPartnerAction,
} from "../../actions/partners.action";

export type PartnerAdminRow = {
  id: string;
  name: string;
  url: string | null;
  category: string | null;
  description: string | null;
  consent_status: string;
  visible: boolean;
  featured: boolean;
  sort: number;
  organizer_id: string | null;
  logo_media_id: string | null;
  logoUrl?: string | null;
};

export type PartnerMediaOption = {
  id: string;
  alt: string;
  url: string;
};

const CATEGORY_CHIPS = [
  "campus",
  "society",
  "vendor",
  "academy",
  "developer",
  "media",
  "sponsor",
  "technology",
] as const;

export function PartnersCmsPanel({
  partners,
  mediaOptions,
}: {
  partners: PartnerAdminRow[];
  mediaOptions: PartnerMediaOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<PartnerAdminRow> | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const logoPreview = useMemo(() => {
    if (!edit?.logo_media_id) return edit?.logoUrl || null;
    return mediaOptions.find((m) => m.id === edit.logo_media_id)?.url || edit.logoUrl || null;
  }, [edit, mediaOptions]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Organizer opt-ins arrive as pending. Attach a logo from the Media library, approve to show
          on /partners.
        </p>
        <button
          type="button"
          className={buttonClass("primary", "md")}
          onClick={() =>
            setEdit({
              name: "",
              url: "",
              category: "",
              description: "",
              consent_status: "pending",
              visible: false,
              featured: false,
              sort: 0,
              logo_media_id: null,
            })
          }
        >
          Add partner
        </button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {partners.length === 0 ? (
        <EmptyState
          title="No partners"
          description="Add a logo partner or wait for organizer opt-ins."
          size="sm"
        />
      ) : (
        <ul className="space-y-3">
          {partners.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                {p.logoUrl ? (
                  <Image
                    src={p.logoUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg border border-line object-contain bg-white p-1"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-soft">
                    No logo
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink-soft">
                    {p.category || "uncategorized"}
                    {p.organizer_id ? " · organizer opt-in" : ""}
                  </p>
                </div>
              </div>
              <StatusBadge
                status={
                  p.consent_status === "granted"
                    ? "approved"
                    : p.consent_status === "revoked"
                      ? "rejected"
                      : "pending"
                }
                label={p.consent_status}
                size="sm"
              />
              <div className="flex flex-wrap gap-2">
                {p.consent_status !== "granted" ? (
                  <button
                    type="button"
                    className={buttonClass("secondary", "sm")}
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await setPartnerConsentAction({
                          id: p.id,
                          status: "granted",
                          visible: true,
                        });
                        if (!res.ok) setError(res.error.message);
                        else router.refresh();
                      })
                    }
                  >
                    Approve
                  </button>
                ) : null}
                <button
                  type="button"
                  className={buttonClass("ghost", "sm")}
                  onClick={() => setEdit(p)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={buttonClass("ghost", "sm")}
                  onClick={() => setRevokeId(p.id)}
                >
                  Revoke
                </button>
                <button
                  type="button"
                  className={buttonClass("ghost", "sm")}
                  onClick={() => setDeleteId(p.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        title={edit?.id ? "Edit partner" : "Add partner"}
        maxWidth="lg"
        footer={
          <button
            type="button"
            className={buttonClass("primary", "md")}
            disabled={pending || !edit?.name?.trim()}
            onClick={() =>
              startTransition(async () => {
                if (!edit?.name?.trim()) return;
                const res = await upsertPartnerAction({
                  id: edit.id,
                  name: edit.name,
                  url: edit.url || null,
                  category: edit.category || null,
                  description: edit.description || null,
                  logo_media_id: edit.logo_media_id || null,
                  featured: edit.featured ?? false,
                  visible: edit.visible ?? false,
                  sort: edit.sort ?? 0,
                  consent_status:
                    (edit.consent_status as "pending" | "granted" | "revoked") || "pending",
                });
                if (!res.ok) setError(res.error.message);
                else {
                  setEdit(null);
                  router.refresh();
                }
              })
            }
          >
            Save
          </button>
        }
      >
        {edit ? (
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Name</label>
              <input
                className={fieldClass}
                value={edit.name ?? ""}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>URL</label>
              <input
                className={fieldClass}
                value={edit.url ?? ""}
                onChange={(e) => setEdit({ ...edit, url: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input
                className={fieldClass}
                value={edit.category ?? ""}
                onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                placeholder="e.g. campus"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORY_CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium text-ink-soft hover:border-ink hover:text-ink"
                    onClick={() => setEdit({ ...edit, category: c })}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Logo</label>
              {logoPreview ? (
                <div className="mb-2 flex h-16 w-40 items-center justify-center rounded-lg border border-line bg-white p-2">
                  <Image
                    src={logoPreview}
                    alt=""
                    width={140}
                    height={48}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              ) : (
                <p className="mb-2 text-xs text-ink-soft">
                  Upload under Website → Media, then select here.
                </p>
              )}
              <select
                className={fieldClass}
                value={edit.logo_media_id ?? ""}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    logo_media_id: e.target.value ? e.target.value : null,
                  })
                }
              >
                <option value="">No logo</option>
                {mediaOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.alt || m.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={fieldClass}
                value={edit.description ?? ""}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Sort</label>
              <input
                className={fieldClass}
                type="number"
                value={edit.sort ?? 0}
                onChange={(e) => setEdit({ ...edit, sort: Number(e.target.value) || 0 })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={edit.visible ?? false}
                onChange={(e) => setEdit({ ...edit, visible: e.target.checked })}
              />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={edit.featured ?? false}
                onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
              />
              Featured
            </label>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(revokeId)}
        title="Revoke partner consent?"
        description="The logo will hide from the public partners page immediately."
        confirmLabel="Revoke"
        tone="danger"
        busy={pending}
        onCancel={() => setRevokeId(null)}
        onConfirm={() =>
          startTransition(async () => {
            if (!revokeId) return;
            const res = await setPartnerConsentAction({ id: revokeId, status: "revoked" });
            setRevokeId(null);
            if (!res.ok) setError(res.error.message);
            else router.refresh();
          })
        }
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete partner?"
        description="This permanently removes the partner row."
        confirmLabel="Delete"
        tone="danger"
        busy={pending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() =>
          startTransition(async () => {
            if (!deleteId) return;
            const res = await deletePartnerAction({ id: deleteId });
            setDeleteId(null);
            if (!res.ok) setError(res.error.message);
            else router.refresh();
          })
        }
      />
    </div>
  );
}
