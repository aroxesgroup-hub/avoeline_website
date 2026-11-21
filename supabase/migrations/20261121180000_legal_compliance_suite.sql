-- Legal Compliance Suite: suite chrome settings + richer v2 legal markdown (callouts)

-- ---------------------------------------------------------------------------
-- Public-readable site_settings.legal_suite
-- ---------------------------------------------------------------------------
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select
  to anon, authenticated
  using (
    key in (
      'nav',
      'footer',
      'social',
      'contact',
      'announcement',
      'seo_defaults',
      'stats',
      'legal_suite'
    )
  );

insert into public.site_settings (key, value, updated_at)
values (
  'legal_suite',
  $json${
    "eyebrow": "Legal & Regulatory Hub",
    "title": "Compliance & Governance Suite",
    "intro": "The structural framework governing Avoeline platform operations, data stewardship, and organizer sovereignty.",
    "contactEmail": "info@aroxes.com",
    "downloadLabel": "Download Bundle PDF",
    "contactLabel": "Contact Legal Desk",
    "zeroSell": {
      "title": "Zero-Sell Guarantee",
      "body": "Attendee PII is never sold, rented, or tokenized by Avoeline. Organizers remain the dedicated controllers of registration data.",
      "stat1Label": "Organizer-Dedicated",
      "stat1Value": "100%",
      "stat2Label": "Zero-Sell Non-Tokenizable",
      "stat2Value": "Guaranteed"
    },
    "dpa": {
      "title": "Need a Tailored Data Processing Addendum (DPA)?",
      "body": "Request our standard DPA pack for enterprise or campus procurement review.",
      "buttonLabel": "Request DPA Pack",
      "mailtoSubject": "Avoeline DPA pack request"
    },
    "docs": {
      "privacy": {
        "index": 1,
        "label": "Privacy Architecture",
        "navLabel": "Privacy & Data Architecture"
      },
      "terms": {
        "index": 2,
        "label": "Terms of Service",
        "navLabel": "Terms of Service"
      },
      "organizer-agreement": {
        "index": 3,
        "label": "Organizer Agreement",
        "navLabel": "Organizer Agreement"
      },
      "content-rights": {
        "index": 4,
        "label": "Content & Verification Rights",
        "navLabel": "Content & Verification Rights"
      }
    }
  }$json$::jsonb,
  now()
)
on conflict (key) do update set
  value = excluded.value,
  updated_at = excluded.updated_at;

-- Display titles for suite cards (bodies remain versioned)
update public.legal_documents set title = 'Privacy Policy & Stewardship Architecture' where slug = 'privacy';
update public.legal_documents set title = 'Terms of Service' where slug = 'terms';
update public.legal_documents set title = 'Organizer Master Services Agreement' where slug = 'organizer-agreement';
update public.legal_documents set title = 'Content, Media & Certificate Rights' where slug = 'content-rights';

-- ---------------------------------------------------------------------------
-- Version 2 bodies (immutable insert; only promote if still on v1)
-- ---------------------------------------------------------------------------
insert into public.legal_document_versions (id, document_id, version, body_md, change_summary, effective_date, published_at)
select
  v.id,
  d.id,
  2,
  v.body_md,
  'Compliance Suite v2 — structured sections + callouts',
  current_date,
  now()
from public.legal_documents d
join (
  values
    (
      'b1000000-0000-4000-8000-000000000021'::uuid,
      'privacy'::text,
      $privacy$
Avoeline processes event and account data under a clear controller / processor split. This outline is a product draft — counsel should finalize jurisdiction-specific language before relying on it as a binding policy.

> [!SPLIT]
> **Event Organizer — Data Controller**
> Decides why and how registration data is collected for each event; sets retention; handles attendee rights requests for that event data.
> ---
> **Avoeline Platform — Data Processor**
> Hosts and processes registration data on the organizer’s documented instructions; runs accounts, billing, and platform security as controller for those purposes.

## 1.1 Who we are
Aroxes operates Avoeline. Contact: info@aroxes.com. [legal entity, address].

## 1.2 What we collect
Account details; event, sponsor, partner and vendor records organizers enter; registration details attendees submit (name, email, phone, form answers, payment proofs, team details, check-in); technical logs (device, IP); support messages; and, if you connect Google, only data needed for features you enable.

## 1.3 Why we use it
To run events and registrations, issue tickets and certificates, process payments, provide support, keep the service secure, meet legal duties, and improve Avoeline using aggregated or de-identified information. Product updates and community networking require opt-in and can be withdrawn.

## 1.4 Who sees it
Organizers see registrations for their own events. Sponsors and partners see only what the organizer or you choose to share.

> [!GUARANTEE]
> **Zero-sell.** We do not sell personal data. Attendee PII is not rented or tokenized for secondary markets.

## 1.5 Roles
For registration data, the event organizer is the controller and Avoeline processes it on their behalf. For accounts, billing and platform usage, Avoeline is the controller.

## 1.6 Google user data
We use Google data only for features you enable, never for advertising, and not to train AI models. Use follows Google’s API Services User Data Policy, including Limited Use.

## 1.7 Service providers
Hosting, database, email and payment tools (for example Vercel, Supabase, Resend, Google), under contract.

## 1.8 Retention and deletion
[periods]. Registration data follows the organizer’s retention settings and legal needs.

## 1.9 Security
Encryption in transit, restricted access, audit logs.

## 1.10 Your rights
Access, correction, deletion, objection and withdrawal of consent via info@aroxes.com or the data request form on this page. [Add regulator or complaint information for your jurisdiction.]

## 1.11 Other
Cookies, children, international transfers, changes, and effective date are described in the published version history.
$privacy$
    ),
    (
      'b1000000-0000-4000-8000-000000000022'::uuid,
      'terms'::text,
      $terms$
These Terms govern access to Avoeline. Material changes may be announced in-product or by email. [eligibility rules].

## 2.1 Acceptance and accounts
By using Avoeline you accept these terms. Keep credentials safe; you are responsible for activity under your account.

## 2.2 Organizer responsibilities
Lawful data use; permission for messages you send; accurate event information; refunds and attendee communication.

## 2.3 Attendees and vendors
Use the service as intended for registration, tickets, certificates, quotes and bookings.

> [!WARNING]
> **Prohibited invocations.** No spam, malware, unlawful content, credential stuffing, scraping that harms the service, or attempts to bypass access controls, payment verification, or certificate integrity checks.

## 2.4 Fees and billing
Paid plans and marketplace fees as stated at signup or on Plans. Billing may use bank transfer with an invoice. [commission terms].

## 2.5 Content and Google connections
You keep rights to content you upload and grant Avoeline a license to host and display it to operate the service. Google connections are optional; email sending is subject to plan limits and provider policies.

## 2.6 Availability, suspension, liability
We may change or interrupt the service. We may suspend accounts that breach these terms or the law. [disclaimer language]. [liability caps]. [jurisdiction].

## 2.7 Contact
info@aroxes.com.
$terms$
    ),
    (
      'b1000000-0000-4000-8000-000000000023'::uuid,
      'organizer-agreement'::text,
      $org$
This Organizer Master Services Agreement covers events you create on Avoeline. You remain responsible for event accuracy, registrations you collect, and how you use attendee data.

## 3.1 Role and compliance
You confirm you have the rights to publish the event and that it complies with applicable law and Avoeline policies.

> [!GUARANTEE]
> **Sovereign fee transparency.** Plan prices and marketplace fees shown at signup or on Plans are the fees that apply for the selected term unless you agree otherwise in writing. **Guaranteed:** no hidden platform markups on listed plan prices.

## 3.2 Payments and refunds
You set ticket prices and handle payment verification for paid events. Refunds and disputes are your responsibility unless otherwise agreed in writing.

## 3.3 Account security
You keep your account secure, connect only accounts you control, and disconnect Google access when you no longer need it.

## 3.4 Changes and contact
We may update this agreement. Material changes may be announced in-product or by email. Contact: info@aroxes.com.
$org$
    ),
    (
      'b1000000-0000-4000-8000-000000000024'::uuid,
      'content-rights'::text,
      $rights$
By publishing an event you confirm that you have the rights to use all uploaded images, video links, logos, and written content for that event.

## 4.1 Licences
You grant Avoeline a non-exclusive licence to host and display that content for operating and promoting the event on the platform.

> [!NOTE]
> **Decoupled certificate immutability.** Issued verification codes and certificate payloads are designed so display templates can evolve without rewriting the attested achievement record already issued to an attendee.

## 4.2 Takedown
If content you uploaded infringes rights, you will remove or replace it promptly when notified.

## 4.3 Contact
info@aroxes.com.
$rights$
    )
) as v(id, slug, body_md) on d.slug = v.slug
on conflict (document_id, version) do nothing;

update public.legal_documents d
set current_version_id = v2.id
from public.legal_document_versions v2
where v2.document_id = d.id
  and v2.version = 2
  and d.slug in ('privacy', 'terms', 'organizer-agreement', 'content-rights')
  and (
    d.current_version_id is null
    or exists (
      select 1
      from public.legal_document_versions cur
      where cur.id = d.current_version_id
        and cur.version = 1
    )
  );
