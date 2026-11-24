import { notFound, redirect } from "next/navigation";
import { AuthService } from "@/src/features/auth/authService";
import {
  getCustomFormForOwner,
  listFormResponses,
} from "@/src/features/custom_forms/customForms.service";
import { FormResponsesClient } from "@/src/features/custom_forms/components/FormResponsesClient";
import PageHeader from "@/src/shared_components/ui/PageHeader";
import { Breadcrumbs } from "@/src/shared_components/ui/Breadcrumbs";
import { FilterTabs } from "@/src/shared_components/ui/FilterTabs";

export default async function OrganizerFormResponsesPage({
  params,
}: {
  params: Promise<{ organizer_id: string; formId: string }>;
}) {
  const { organizer_id, formId } = await params;
  const user = await AuthService.getCurrentUser();
  if (!user) {
    redirect(`/auth/signin?next=/organizer/${organizer_id}/forms/${formId}/responses`);
  }
  if (user.userId !== organizer_id) {
    const admin = await AuthService.requireAdmin("organizers");
    if (!admin?.isOwner) redirect("/access-denied");
  }

  const form = await getCustomFormForOwner(formId, organizer_id);
  if (!form) notFound();
  const responses = await listFormResponses(formId, organizer_id);
  const editorHref = `/organizer/${organizer_id}/forms/${form.id}`;
  const responsesHref = `/organizer/${organizer_id}/forms/${form.id}/responses`;

  return (
    <div className="px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: `/organizer/${organizer_id}/dashboard` },
            { label: "Forms", href: `/organizer/${organizer_id}/forms` },
            { label: form.title, href: editorHref },
            { label: "Responses" },
          ]}
        />
        <PageHeader
          eyebrow="Custom forms · Survey editor"
          title={`${form.title} — Responses`}
          description={`${responses.length} response(s).`}
        />
        <FilterTabs
          label="Form views"
          activeValue="responses"
          tabs={[
            { label: "Editor", value: "editor", href: editorHref },
            {
              label: "Responses",
              value: "responses",
              href: responsesHref,
              count: responses.length,
            },
          ]}
        />
        <FormResponsesClient ownerId={organizer_id} form={form} responses={responses} />
      </div>
    </div>
  );
}
