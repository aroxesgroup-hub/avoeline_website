"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/src/shared_components/ui/ConfirmDialog";
import { buttonClass } from "@/src/lib/ui";

export function DesignSystemDemos() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={() => setModalOpen(true)}>
        Open modal
      </Button>
      <button
        type="button"
        className={buttonClass("destructive")}
        onClick={() => setConfirmOpen(true)}
      >
        Open confirm
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample modal"
        description="Backdrop uses bg-ink/60; panel uses paper + line."
        footer={
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        }
      >
        <p className="text-sm text-ink-soft">
          Client island for focus trap and portal. Prefer ConfirmDialog for destructive confirms.
        </p>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete sample?"
        description="ConfirmDialog uses native dialog + token backdrop. Confirm labels the act."
        confirmLabel="Delete sample"
        tone="danger"
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
