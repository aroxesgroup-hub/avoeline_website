import { notFound, redirect } from "next/navigation";
import { AuthService } from "@/src/features/auth/authService";
import { getCustomFormForOwner } from "@/src/features/custom_forms/customForms.service";
import { FormEditorClient } from "@/src/features/custom_forms/components/FormEditorClient";
import PageHeader from "@/src/shared_components/ui/PageHeader";
import { Breadcrumbs } from "@/src/shared_components/ui/Breadcrumbs";
import { headers } from "next/headers";

export default async function OrganizerFormEditorPage({
  params,
}: {
  params: Promise<{ organizer_id: string; formId: string }>;
}) {
  const { organizer_id, formId } = await params;
  const user = await AuthService.getCurrentUser();
  if (!user) redirect(`/auth/signin?next=/organizer/${organizer_id}/forms/${formId}`);
  if (user.userId !== organizer_id) {
    const admin = await AuthService.requireAdmin("organizers");
    if (!admin?.isOwner) redirect("/access-denied");
  }

  const form = await getCustomFormForOwner(formId, organizer_id);
  if (!form) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const publicOrigin = `${proto}://${host}`;

  return (
    <div className="px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: `/organizer/${organizer_id}/dashboard` },
            { label: "Forms", href: `/organizer/${organizer_id}/forms` },
            { label: form.title },
          ]}
        />
        <PageHeader
          eyebrow="Custom forms · Survey editor"
          title={form.title}
          description="Edit questions, open the form, and share the link."
        />
        <FormEditorClient ownerId={organizer_id} form={form} publicOrigin={publicOrigin} />
      </div>
    </div>
  );
}
