-- Plans page display copy: highlights, enterprise public card, plans FAQs.
-- Prices/modules remain owned by subscription_plans / module_catalog.

update public.subscription_plans
set
  is_public = true,
  is_recommended = false,
  badge_text = 'Starter tier',
  tagline = 'For club workshops and small community events',
  billing_note = 'Free forever for core organizer tools.',
  cta_label = 'Get started free',
  cta_href = '/auth/signup?plan=free',
  highlight_features = array[
    'Unlimited free registrations',
    'QR gate scanning',
    'Custom sign-up questions',
    'Basic analytics',
    'Email invites (plan daily cap)',
    'Public event page'
  ],
  updated_at = now()
where key = 'free';

update public.subscription_plans
set
  is_public = true,
  is_recommended = true,
  badge_text = 'Recommended',
  tagline = 'For growing societies, conferences, and competitive summits',
  billing_note = 'Billed by bank transfer with an invoice.',
  cta_label = 'Upgrade to Pro',
  cta_href = '/auth/signup?plan=pro',
  highlight_features = array[
    'Everything in Free',
    'Verifiable digital certificates',
    'Hackathon & CTF judging',
    'Advanced teams & roles',
    'Higher email caps',
    'Vendor marketplace access',
    'Priority bank-transfer clearance'
  ],
  updated_at = now()
where key = 'pro';

-- Existing enterprise row keeps list prices for admin; marketing UI shows "Custom Quote".
update public.subscription_plans
set
  name = 'Enterprise & Campus',
  description = 'Institutional tenancy for departments, clubs, and multi-event networks.',
  is_active = true,
  is_public = true,
  is_recommended = false,
  sort_order = 20,
  badge_text = 'Institutional scale',
  tagline = 'Multi-department tenancy and volume procurement',
  billing_note = 'Custom quote — bank transfer / purchase order.',
  cta_label = 'Contact Enterprise Sales',
  cta_href = '/contact?topic=enterprise',
  highlight_features = array[
    'Department and club hierarchy',
    'Custom module bundles',
    'Priority onboarding',
    'Volume email & storage',
    'SSO / campus SSO options',
    'Dedicated success contact'
  ],
  updated_at = now()
where key = 'enterprise';

delete from public.site_faqs where scope = 'plans';

insert into public.site_faqs (scope, question, answer_md, sort, visible)
values
  (
    'plans',
    'What does it cost?',
    'There is a free organizer plan and paid Pro pricing shown on this page. Enterprise and campus networks are quoted. We do not invent surcharges — live prices come from the plan catalog.',
    10,
    true
  ),
  (
    'plans',
    'How does bank-transfer billing work?',
    'Paid plans are typically settled by bank transfer with an invoice. After signup you receive payment instructions; access unlocks when the owner approves payment.',
    20,
    true
  ),
  (
    'plans',
    'Can I switch between monthly and annual?',
    'Where a yearly price is published, the Plans page toggle shows annual billing. Savings appear when yearly is discounted versus twelve monthly payments.',
    30,
    true
  ),
  (
    'plans',
    'What changes when I upgrade to Pro?',
    'Pro unlocks modules such as certificates, hackathon ops, advanced teams, and higher email caps. Exact modules are listed in the comparison table and follow the plan’s included_modules.',
    40,
    true
  ),
  (
    'plans',
    'Do attendees need a paid plan?',
    'No. Attendees register on public events without buying a platform plan. Organizer plans cover the tools used to run events.',
    50,
    true
  ),
  (
    'plans',
    'How do campus or enterprise deals work?',
    'Contact us with your department or university network needs. We quote custom tenancy, volume limits, and onboarding — then bill via invoice or purchase order.',
    60,
    true
  );
