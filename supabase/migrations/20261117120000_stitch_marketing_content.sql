-- Stitch Modern Dual-Theme (project 13819902314645578273) → CMS content.
-- Upserts published+draft site_blocks for home/about/partners/contact so public
-- pages match Stitch copy and the hero Live Event Command panel is editable.

-- ---------------------------------------------------------------------------
-- site_pages SEO (keep existing ids via slug conflict)
-- ---------------------------------------------------------------------------
insert into public.site_pages (id, slug, title, status, seo, published_at, updated_at)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'home',
    'Avoeline',
    'published',
    jsonb_build_object(
      'title', 'Avoeline — Run every event from one place',
      'description', 'Publish your event, open registration, check guests in with QR codes, and follow up with verified digital certificates. Built for organizers, university societies, and departments.'
    ),
    now(),
    now()
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'about',
    'About',
    'published',
    jsonb_build_object(
      'title', 'About Avoeline',
      'description', 'Avoeline is the event operations platform from Aroxes — built for organizers, university societies, departments, and vendors.'
    ),
    now(),
    now()
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'partners',
    'Partners',
    'published',
    jsonb_build_object(
      'title', 'Partners & Vendors — Avoeline',
      'description', 'Organizations, sponsors, vendors and technology partners on Avoeline. Logos appear only with granted consent.'
    ),
    now(),
    now()
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'contact',
    'Contact',
    'published',
    jsonb_build_object(
      'title', 'Contact Avoeline',
      'description', 'Reach the Avoeline team at info@aroxes.com. We typically reply within one business day.'
    ),
    now(),
    now()
  )
on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status,
  seo = excluded.seo,
  published_at = coalesce(public.site_pages.published_at, excluded.published_at),
  updated_at = now();

delete from public.site_blocks
where page_id in (
  select id from public.site_pages where slug in ('home', 'about', 'partners', 'contact')
);

-- ---------------------------------------------------------------------------
-- site_blocks — home (Stitch Homepage Redesign)
-- ---------------------------------------------------------------------------
insert into public.site_blocks (page_id, type, sort, visible, draft, published, updated_at)
select p.id, b.type, b.sort, true, b.payload, b.payload, now()
from public.site_pages p
cross join lateral (
  values
    (
      'hero'::text,
      10,
      $hero${
        "headline": "Run every event from one place.",
        "subheadline": "Publish your event, open registration, check guests in with QR codes, and follow up with verified digital certificates. Built for organizers, university societies, and departments.",
        "eyebrow": "EVENT OPERATIONS PLATFORM — NEW RELEASE",
        "statusLine": "Live ops network: 99.98% Uptime",
        "trustLine": "",
        "trustTitle": "Trusted by university clubs, tech communities, and regional summits",
        "trustLogos": [
          {"name": "Fast National Univ", "icon": "school", "href": ""},
          {"name": "NUST Computing", "icon": "hub", "href": ""},
          {"name": "GDG Pakistan", "icon": "terminal", "href": ""},
          {"name": "Lahore Summit Series", "icon": "verified", "href": ""}
        ],
        "imageUrl": "",
        "imageAlt": "",
        "primaryCta": {"label": "Get started free", "href": "/auth/signup"},
        "secondaryCta": {"label": "See plans", "href": "/plans"},
        "tertiaryCta": {"label": "Browse events", "href": "/events"},
        "command": {
          "title": "Live Event Command",
          "eventName": "Web 3.0 Conference 2026",
          "badge": "ACTIVE GATE",
          "stats": [
            {"label": "Registrations", "value": "1,240", "hint": "+18 today"},
            {"label": "QR Scanned", "value": "92%", "hint": "1,141 in"},
            {"label": "Revenue", "value": "PKR 385k", "hint": "98% paid"},
            {"label": "Certificates", "value": "850", "hint": "Ready"}
          ],
          "capacityLabel": "Gate Capacity (Main Hall A)",
          "capacityValue": "1,141 / 1,240 Check-ins",
          "capacityPercent": 92,
          "activity": [
            {"text": "Hamza Tariq (VIP Pass)", "time": "Just now", "kind": "scan"},
            {"text": "Bank slip verified PKR 2,500", "time": "2m ago", "kind": "payment"}
          ],
          "footerNote": "Organizer Operations Hub — Live Event Command",
          "alertLabel": "Send Alert",
          "exportLabel": "Export CSV"
        }
      }$hero$::jsonb
    ),
    (
      'stats_strip',
      20,
      $stats${
        "title": "Organizer Operations Hub — Live Event Command",
        "items": [
          {"key": "events_count", "label": "Events Hosted", "value": ""},
          {"key": "registrations_count", "label": "Registrations", "value": ""},
          {"key": "active_organizers_count", "label": "Organizers", "value": ""},
          {"key": "institutions_count", "label": "Institutions", "value": ""},
          {"key": "certificates_count", "label": "Certificates", "value": ""}
        ]
      }$stats$::jsonb
    ),
    (
      'logo_wall',
      30,
      '{"title": "", "items": []}'::jsonb
    ),
    (
      'steps',
      40,
      $steps${
        "title": "How it works",
        "body": "From inception to the post-event wrap-up, take complete command of your attendee journeys with zero friction.",
        "items": [
          {
            "title": "Create your event",
            "body": "Set schedules, custom forms, paid or free ticket tiers, and granular attendee approval rules with a clean visual editor.",
            "icon": "01"
          },
          {
            "title": "Open registration",
            "body": "Share branded registration links, collect ticket payments with instant bank transfer slip uploads, or process team RSVPs.",
            "icon": "02"
          },
          {
            "title": "Run event day",
            "body": "Ultra-fast camera QR scanner on any mobile device. Live attendee check-in counters and segregated volunteer staff access.",
            "icon": "03"
          },
          {
            "title": "Follow up & certify",
            "body": "Bulk-issue tamper-proof verifiable digital certificates, export attendance records, and collect instant attendee sentiment.",
            "icon": "04"
          }
        ]
      }$steps$::jsonb
    ),
    (
      'feature_grid',
      50,
      $features${
        "title": "Tools for every stage of your event",
        "body": "Purpose-built modules configured specifically for university competitions, massive conferences, and boutique workshops.",
        "items": [
          {
            "title": "Events & Ticketing",
            "body": "Run free gatherings or high-stakes summits. Configure multiple ticket tiers, manage bank transfer payment slip approvals, issue discount codes, and validate credentials at the door.",
            "icon": "tickets",
            "imageUrl": ""
          },
          {
            "title": "Hackathons & CTFs",
            "body": "Multi-phase project tracks, live scoreboards, multi-judge rubrics, team formation tools, and rapid blind submission screening.",
            "icon": "terminal",
            "imageUrl": ""
          },
          {
            "title": "Clubs & Departments",
            "body": "Institutional governance made easy. One central place for university societies, executive tenures, member rolls, and budget approvals.",
            "icon": "clubs",
            "imageUrl": ""
          },
          {
            "title": "Vendor Marketplace",
            "body": "Discover verified audio/visual technicians, caterers, stage fabricators, and sponsors. Compare quotes and confirm contracts in one hub.",
            "icon": "store",
            "imageUrl": ""
          },
          {
            "title": "Verifiable Certificates",
            "body": "Cryptographically signed proof of attendance and merit. Attendees can verify authentic credentials publicly and share with one click.",
            "icon": "cert",
            "imageUrl": ""
          },
          {
            "title": "AI Operations & Intelligent Forecasting",
            "body": "Automatically generate session runs, predict no-show rates based on historical data, and optimize sponsor floor plans for maximum foot traffic.",
            "icon": "ai",
            "imageUrl": ""
          }
        ]
      }$features$::jsonb
    ),
    (
      'audience_tabs',
      60,
      $audience${
        "title": "A workspace for every team",
        "body": "Whether you are staging a 2,000-person summit or managing a student club treasury, Avoeline adapts to your exact role.",
        "tabs": [
          {
            "title": "Organizers",
            "body": "Create events, sell tickets, verify payments, staff the day, manage access gates, and deliver automated follow-up digests.",
            "icon": "organizer"
          },
          {
            "title": "Universities & Clubs",
            "body": "Centralized oversight across campus societies, officer elections, budget requisitions, and historical continuity records.",
            "icon": "university"
          },
          {
            "title": "Vendors & Partners",
            "body": "List high-end sound, stage, catering, or photography packages. Send bindable quotes and manage milestone payouts safely.",
            "icon": "vendor"
          },
          {
            "title": "Attendees",
            "body": "Discover vetted tech summits, purchase tickets in seconds, access dynamic offline QR entry passes, and safeguard verified certificates.",
            "icon": "attendee"
          }
        ]
      }$audience$::jsonb
    ),
    (
      'event_showcase',
      70,
      $events${
        "title": "Upcoming public events",
        "body": "Explore curated tech summits, coding hackathons, and leadership symposiums.",
        "items": []
      }$events$::jsonb
    ),
    (
      'pricing_teaser',
      80,
      $pricing${
        "title": "Plans that scale with your community",
        "body": "Start free. Upgrade when you need more. Transparent modules with bank invoice settlement available for institutional procurement.",
        "ctaLabel": "Compare all features on Plans page",
        "ctaHref": "/plans",
        "showRecommended": true,
        "items": []
      }$pricing$::jsonb
    ),
    (
      'testimonials',
      90,
      '{"title": "", "items": []}'::jsonb
    ),
    (
      'faq',
      100,
      $faq${
        "title": "Frequently asked questions",
        "items": [
          {
            "question": "What does it cost?",
            "answer": "There is a generous free organizer tier and paid plans for growing conferences. Free tiers include unlimited RSVP check-ins and 200 emails daily. See our Plans page for current prices — we never invent numbers or hide transactional surcharges."
          },
          {
            "question": "Do attendees need an account?",
            "answer": "No. Attendees can register for events instantly using just the specific details requested by the organizer. Creating an optional attendee account simply allows them to manage multi-event QR wallets and store digital certificates securely online."
          },
          {
            "question": "How does bank proof payment work?",
            "answer": "Organizers can provide bank transfer instructions. When purchasing tickets, attendees upload their transaction receipt screenshot or reference code. Organizers view incoming payments in a dedicated approval queue and approve tickets with one click."
          },
          {
            "question": "Can universities manage many clubs?",
            "answer": "Yes. Departments, student affairs, and councils can oversee all campus societies, teams, annual tenures, and budgetary records under a single unified institutional account."
          },
          {
            "question": "Can I send emails from my own address?",
            "answer": "Yes. Organizers can connect Google Workspace for outbound invitations, confirmation tickets, and broadcast reminders so emails originate from your organization’s domain."
          },
          {
            "question": "Who owns the attendee data?",
            "answer": "You do. For all registration records, the event organizer is the data controller and Avoeline acts strictly as the technical processor. You can export complete CSVs at any moment, and we never cross-sell attendee lists."
          }
        ]
      }$faq$::jsonb
    ),
    (
      'cta',
      110,
      $cta${
        "headline": "Ready to run your next event seamlessly?",
        "body": "Create a free account in under 60 seconds and experience the modern operating platform built for people who actually organize.",
        "primaryCta": {"label": "Get started free", "href": "/auth/signup"},
        "secondaryCta": {"label": "See plans", "href": "/plans"}
      }$cta$::jsonb
    )
) as b(type, sort, payload)
where p.slug = 'home';

-- ---------------------------------------------------------------------------
-- site_blocks — about
-- ---------------------------------------------------------------------------
insert into public.site_blocks (page_id, type, sort, visible, draft, published, updated_at)
select p.id, b.type, b.sort, true, b.payload, b.payload, now()
from public.site_pages p
cross join lateral (
  values
    (
      'rich_text'::text,
      10,
      $about${
        "title": "About Avoeline",
        "markdown": "Avoeline is the event operations platform for organizers, university societies, departments, and vendors.\n\nPublish events, open registration, check guests in with QR codes, run hackathons, and issue verified digital certificates — from one calm workspace.\n\nAvoeline is built by **Aroxes**, a group of companies making practical software for local businesses and people. Sister products include **Distroline**."
      }$about$::jsonb
    ),
    (
      'timeline',
      20,
      $timeline${
        "title": "Built for real operations",
        "body": "From campus clubs to regional summits.",
        "items": [
          {"title": "Organizers first", "body": "Ticket tiers, bank-slip approvals, staff gates, and certificates without juggling five tools.", "date": ""},
          {"title": "Institutions ready", "body": "Departments and clubs share one place for societies, teams, tenures, and budgets.", "date": ""},
          {"title": "Vendor marketplace", "body": "Quotes, bookings, and verified service providers alongside your event stack.", "date": ""},
          {"title": "An Aroxes product", "body": "Practical software from Aroxes — Distroline and Avoeline.", "date": ""}
        ]
      }$timeline$::jsonb
    ),
    (
      'cta',
      30,
      $aboutcta${
        "headline": "Ready to run your next event?",
        "body": "Create a free account and set up your first event in minutes.",
        "primaryCta": {"label": "Get started free", "href": "/auth/signup"},
        "secondaryCta": {"label": "Contact us", "href": "/contact"}
      }$aboutcta$::jsonb
    )
) as b(type, sort, payload)
where p.slug = 'about';

-- ---------------------------------------------------------------------------
-- site_blocks — partners
-- ---------------------------------------------------------------------------
insert into public.site_blocks (page_id, type, sort, visible, draft, published, updated_at)
select p.id, b.type, b.sort, true, b.payload, b.payload, now()
from public.site_pages p
cross join lateral (
  values
    (
      'rich_text'::text,
      5,
      $partnersintro${
        "title": "Partners & Vendors",
        "markdown": "Avoeline connects organizers with institutions, sponsors, and verified vendors. Logos appear on this page only when consent is granted."
      }$partnersintro$::jsonb
    ),
    (
      'logo_wall',
      10,
      '{"title": "Organizers and institutions on Avoeline", "items": []}'::jsonb
    ),
    (
      'logo_wall',
      20,
      '{"title": "Sponsors and partners", "items": []}'::jsonb
    ),
    (
      'logo_wall',
      30,
      '{"title": "Vendors", "items": []}'::jsonb
    ),
    (
      'logo_wall',
      40,
      '{"title": "Technology", "items": []}'::jsonb
    ),
    (
      'cta',
      50,
      $partnercta${
        "headline": "Become a partner",
        "body": "Tell us about your organization. Logos appear only with granted consent.",
        "primaryCta": {"label": "Contact us", "href": "/contact"},
        "secondaryCta": {"label": "Browse events", "href": "/events"}
      }$partnercta$::jsonb
    )
) as b(type, sort, payload)
where p.slug = 'partners';

-- ---------------------------------------------------------------------------
-- site_blocks — contact
-- ---------------------------------------------------------------------------
insert into public.site_blocks (page_id, type, sort, visible, draft, published, updated_at)
select p.id, b.type, b.sort, true, b.payload, b.payload, now()
from public.site_pages p
cross join lateral (
  values
    (
      'rich_text'::text,
      5,
      $contactintro${
        "title": "Contact Avoeline",
        "markdown": "Questions about plans, partnerships, or onboarding? Send a message and we will get back to you."
      }$contactintro$::jsonb
    ),
    (
      'contact_info',
      10,
      $contactinfo${
        "title": "Reach the team",
        "email": "info@aroxes.com",
        "phone": "",
        "whatsapp": "",
        "address": "",
        "responseTime": "We typically reply within one business day."
      }$contactinfo$::jsonb
    )
) as b(type, sort, payload)
where p.slug = 'contact';

-- ---------------------------------------------------------------------------
-- Live stats labels (values still hydrated; Stitch naming)
-- ---------------------------------------------------------------------------
update public.site_stats_settings set label = 'Events Hosted' where key = 'events_count';
update public.site_stats_settings set label = 'Registrations' where key = 'registrations_count';
update public.site_stats_settings set label = 'Organizers' where key = 'active_organizers_count';
update public.site_stats_settings set label = 'Institutions' where key = 'institutions_count';
update public.site_stats_settings set label = 'Certificates' where key = 'certificates_count';
