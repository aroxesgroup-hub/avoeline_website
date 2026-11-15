"use client";

import { useActionState } from "react";
import { FormFeedback } from "@/src/shared_components/ui/FormFeedback";
import { buttonClass } from "@/src/lib/ui";
import type { ActionResult } from "@/src/lib/action";
import { recordJudgeInviteResponse } from "@/src/features/hackathon/actions/judging.action";

export function JudgeInviteRespondForm({ token }: { token: string }) {
  const action = recordJudgeInviteResponse.bind(null, token);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error ? <FormFeedback error={state.error} /> : null}
      {state?.success ? <FormFeedback success="Response saved." /> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          name="decision"
          value="accept"
          className={buttonClass("primary", "sm")}
        >
          Accept
        </button>
        <button
          type="submit"
          name="decision"
          value="decline"
          className={buttonClass("secondary", "sm")}
        >
          Decline
        </button>
      </div>
    </form>
  );
}
