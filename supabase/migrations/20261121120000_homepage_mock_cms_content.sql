-- Homepage mock alignment: CMS-editable copy + Live Event Dashboard hero.
-- Events/plans still hydrate from live tables; empty CMS values fill from DB.

delete from public.site_blocks
where page_id = (select id from public.site_pages where slug = 'home');

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
        "eyebrow": "",
        "statusLine": "",
        "trustLine": "",
        "trustTitle": "",
        "trustLogos": [
          {"name": "Fast Registration", "icon": "zap", "href": ""},
          {"name": "NFC Ticketing", "icon": "nfc", "href": ""},
          {"name": "RFID Tracking", "icon": "rfid", "href": ""},
          {"name": "Lifetime Digital Partner", "icon": "partner", "href": ""}
        ],
        "imageUrl": "",
        "imageAlt": "",
        "primaryCta": {"label": "Get started free", "href": "/auth/signup"},
        "secondaryCta": {"label": "View live demo", "href": "/events"},
        "tertiaryCta": {"label": "", "href": ""},
        "command": {
          "title": "Live Event Dashboard",
          "eventName": "Web 3.0 Conference",
          "badge": "LIVE",
          "stats": [
            {"label": "Registrations", "value": "1,260", "hint": "+32 today"},
            {"label": "Check-ins", "value": "870", "hint": "78%"},
            {"label": "Revenue", "value": "PKR 1.2M", "hint": ""},
            {"label": "Remaining", "value": "390", "hint": ""}
          ],
          "capacityLabel": "",
          "capacityValue": "",
          "capacityPercent": 0,
          "activity": [
            {"text": "Kamran Ali joined from UAE", "time": "Just now", "kind": "join"},
            {"text": "Bank slip verified PKR 2,500", "time": "2m ago", "kind": "payment"},
            {"text": "Sara Khan checked in at Gate A", "time": "5m ago", "kind": "scan"}
          ],
          "footerNote": "",
          "alertLabel": "",
          "exportLabel": ""
        }
      }$hero$::jsonb
    ),
    (
      'stats_strip',
      20,
      $stats${
        "title": "",
        "items": [
          {"key": "countries", "label": "Countries", "value": "8+"},
          {"key": "events_count", "label": "Events Hosted", "value": ""},
          {"key": "active_organizers_count", "label": "Network Partners", "value": ""},
          {"key": "institutions_count", "label": "University Clients", "value": ""},
          {"key": "certificates_count", "label": "Digital Certificates", "value": ""}
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
        "body": "From first publish to post-event certificates — four clear stages.",
        "items": [
          {
            "title": "Create your event",
            "body": "Set schedules, ticket tiers, custom forms, and approval rules in minutes.",
            "icon": "01",
            "linkLabel": "View detailed guide",
            "href": "/#product"
          },
          {
            "title": "Manage Tickets",
            "body": "Share registration links, collect bank-slip proofs, and confirm attendees.",
            "icon": "02",
            "linkLabel": "View detailed guide",
            "href": "/plans"
          },
          {
            "title": "Run smoothly",
            "body": "QR check-in on any phone, live counters, and staff access at the door.",
            "icon": "03",
            "linkLabel": "View detailed guide",
            "href": "/events"
          },
          {
            "title": "Deliver digital certs",
            "body": "Issue verifiable certificates and export attendance after the event.",
            "icon": "04",
            "linkLabel": "View detailed guide",
            "href": "/about"
          }
        ]
      }$steps$::jsonb
    ),
    (
      'feature_grid',
      50,
      $features${
        "title": "Tools for every stage",
        "body": "Purpose-built modules for conferences, campus societies, hackathons, and workshops.",
        "eyebrow": "Comprehensive capabilities",
        "anchorId": "product",
        "items": [
          {
            "title": "Events & Ticketing",
            "body": "Free or paid events, tiers, promos, and door validation in one flow.",
            "icon": "tickets",
            "imageUrl": "",
            "tags": ["Check-in App", "Scanner"],
            "span": "large"
          },
          {
            "title": "Registrations & CRM",
            "body": "Custom fields, approvals, and attendee history without spreadsheets.",
            "icon": "crm",
            "imageUrl": "",
            "tags": [],
            "span": "normal"
          },
          {
            "title": "Clubs & Departments",
            "body": "Societies, tenures, budgets, and department oversight in one workspace.",
            "icon": "clubs",
            "imageUrl": "",
            "tags": [],
            "span": "normal"
          },
          {
            "title": "Vendor Marketplace",
            "body": "Find verified vendors, compare quotes, and manage bookings.",
            "icon": "store",
            "imageUrl": "",
            "tags": [],
            "span": "normal"
          },
          {
            "title": "Real-Time Certificates",
            "body": "Branded, publicly verifiable credentials after check-in or completion.",
            "icon": "cert",
            "imageUrl": "",
            "tags": [],
            "span": "normal"
          },
          {
            "title": "AI Operations",
            "body": "Forecasting, session planning, and operational insights for growing teams.",
            "icon": "ai",
            "imageUrl": "",
            "tags": ["Forecasting"],
            "span": "wide"
          }
        ]
      }$features$::jsonb
    ),
    (
      'audience_tabs',
      60,
      $audience${
        "title": "A workspace for every team",
        "body": "Whether you stage a summit or run a student club, Avoeline adapts to your role.",
        "tabs": [
          {
            "title": "Organizers",
            "body": "Create events, sell tickets, staff the day, and follow up.",
            "icon": "OR",
            "bullets": ["Multi-tier tickets", "Live QR gates", "Payment approvals"]
          },
          {
            "title": "Universities & Clubs",
            "body": "Campus societies, officers, and budgets in one place.",
            "icon": "UN",
            "bullets": ["Department oversight", "Tenure records", "Club dashboards"]
          },
          {
            "title": "Vendors & Partners",
            "body": "List services, send quotes, and manage bookings.",
            "icon": "VN",
            "bullets": ["Verified listings", "Quote workflows", "Booking contracts"]
          },
          {
            "title": "Attendees",
            "body": "Discover events, register fast, and keep certificates safe.",
            "icon": "AT",
            "bullets": ["QR wallet", "Digital certs", "Event discovery"]
          }
        ]
      }$audience$::jsonb
    ),
    (
      'event_showcase',
      70,
      $events${
        "title": "Upcoming public events",
        "body": "Live events from the platform — featured first, then soonest start date.",
        "viewAllLabel": "View all upcoming events",
        "viewAllHref": "/events",
        "items": []
      }$events$::jsonb
    ),
    (
      'pricing_teaser',
      80,
      $pricing${
        "title": "Plans that scale with your community",
        "body": "Prices and feature highlights come from the Plans tab in the owner dashboard.",
        "ctaLabel": "Compare all features",
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
            "answer": "There is a free organizer tier and paid plans. See Plans for live prices and what each includes."
          },
          {
            "question": "Do attendees need an account?",
            "answer": "No. Attendees can register with the details the organizer asks for. An optional account helps manage tickets and certificates."
          },
          {
            "question": "How does bank proof payment work?",
            "answer": "Organizers share transfer instructions. Attendees upload a receipt; organizers approve in a dedicated queue."
          },
          {
            "question": "Can organizations manage many clubs?",
            "answer": "Yes. Departments and councils can oversee societies, teams, tenures, and budgets under one institutional account."
          },
          {
            "question": "Can I send emails from my own address?",
            "answer": "Yes. Connect Google Workspace for outbound invitations and confirmations from your domain."
          },
          {
            "question": "Who owns the attendee data?",
            "answer": "You do. The organizer is the controller; Avoeline is the processor. Export anytime — we do not sell attendee lists."
          }
        ]
      }$faq$::jsonb
    ),
    (
      'cta',
      110,
      $cta${
        "headline": "Ready to run your next event seamlessly?",
        "body": "Create a free account and set up your first event in minutes.",
        "emailPlaceholder": "Enter your work email",
        "primaryCta": {"label": "Get started", "href": "/auth/signup"},
        "secondaryCta": {"label": "See plans", "href": "/plans"}
      }$cta$::jsonb
    )
) as b(type, sort, payload)
where p.slug = 'home';

update public.site_pages
set seo = jsonb_build_object(
  'title', 'Avoeline — Run every event from one place',
  'description', 'Publish events, open registration, QR check-in, and verified certificates. Built for organizers, university societies, and departments.'
),
updated_at = now()
where slug = 'home';
