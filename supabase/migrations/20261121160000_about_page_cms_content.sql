-- About page mock: CMS-editable sections matching the Avoeline About layout.
-- Blocks: hero → stats_strip → comparison → feature_grid → lineage → team → cta(buttons).

insert into public.site_pages (slug, title, status, seo)
values (
  'about',
  'About',
  'published',
  '{"title":"About — Avoeline","description":"Avoeline empowers the people who run campus and community events — part of the Aroxes lineage."}'::jsonb
)
on conflict (slug) do update set
  title = excluded.title,
  status = 'published',
  seo = excluded.seo,
  updated_at = now();

delete from public.site_blocks
where page_id = (select id from public.site_pages where slug = 'about');

insert into public.site_blocks (page_id, type, sort, visible, draft, published, updated_at)
select p.id, b.type, b.sort, true, b.payload, b.payload, now()
from public.site_pages p
cross join lateral (
  values
    (
      'hero'::text,
      10,
      $hero${
        "headline": "Empowering the people who actually run events.",
        "subheadline": "Engineered exclusively for university departments, non-profit institutions, and tech societies that need audit-ready operations — not another consumer ticketing gadget.",
        "eyebrow": "",
        "statusLine": "",
        "trustLine": "",
        "trustTitle": "",
        "trustLogos": [],
        "imageUrl": "",
        "imageAlt": "",
        "primaryCta": {"label": "Join our campus network", "href": "/auth/signup"},
        "secondaryCta": {"label": "Explore public events", "href": "/events"},
        "tertiaryCta": {"label": "", "href": ""}
      }$hero$::jsonb
    ),
    (
      'stats_strip',
      20,
      $stats${
        "title": "",
        "items": [
          {"key": "", "label": "Campus Reach", "value": "12+"},
          {"key": "", "label": "Current Gate", "value": "3,420+"},
          {"key": "", "label": "Certificates Issued", "value": "2,180+"}
        ]
      }$stats$::jsonb
    ),
    (
      'comparison',
      30,
      $comparison${
        "title": "Organizers were juggling seven disconnected tools to survive one weekend.",
        "body": "Spreadsheets, WhatsApp threads, bank apps, and door lists do not add up to an operations fabric. Avoeline replaces the patchwork.",
        "left": {
          "label": "Before",
          "title": "Legacy Framework",
          "items": [
            "Manual bank-slip chasing across chats",
            "Door lists that go stale mid-event",
            "No single source for certificates or audits",
            "Vendor quotes buried in inboxes"
          ]
        },
        "right": {
          "label": "After",
          "title": "The Avoeline Operational Fabric",
          "items": [
            "One registration-to-gate pipeline",
            "Live check-in with staff roles",
            "Verified certificates after participation",
            "Campus-ready oversight for departments"
          ]
        }
      }$comparison$::jsonb
    ),
    (
      'feature_grid',
      40,
      $features${
        "eyebrow": "Platform foundations",
        "anchorId": "",
        "title": "",
        "body": "",
        "items": [
          {
            "title": "Operational Resilience",
            "body": "Audit-ready logs for every registration, payment decision, and gate scan — exportable when councils ask.",
            "icon": "resilience",
            "imageUrl": "",
            "tags": [],
            "span": "normal"
          },
          {
            "title": "Cryptographic Integrity",
            "body": "Proof-of-participation credentials hashed with SHA-256 so certificates stay publicly verifiable.",
            "icon": "integrity",
            "imageUrl": "",
            "tags": [],
            "span": "normal"
          },
          {
            "title": "Localized Fintech Integration",
            "body": "Direct bank and fiat settlement flows that match how campus organizers actually get paid.",
            "icon": "fintech",
            "imageUrl": "",
            "tags": [],
            "span": "normal"
          },
          {
            "title": "Radical Club Transparency",
            "body": "Downloadable ledgers for university patrons — clear tenure, budgets, and event outcomes.",
            "icon": "transparency",
            "imageUrl": "",
            "tags": [],
            "span": "normal"
          }
        ]
      }$features$::jsonb
    ),
    (
      'lineage',
      50,
      $lineage${
        "eyebrow": "Aroxes family",
        "title": "Part of the Aroxes distributed computing and logistics lineage.",
        "body": "Avoeline ships alongside sister products from Aroxes — practical software for local businesses and people.",
        "products": [
          {
            "name": "Avoeline",
            "status": "Active",
            "description": "Event operating system for organizers, clubs, departments, and vendors."
          },
          {
            "name": "Distroline",
            "status": "In pipeline",
            "description": "Logistics and merchandise deployment for campus and community networks."
          }
        ],
        "highlights": [
          "360° Compliance",
          "High-Availability Edge",
          "Encrypted Credentials"
        ]
      }$lineage$::jsonb
    ),
    (
      'team',
      60,
      $team${
        "title": "Guided by veteran organizers and university leadership.",
        "body": "Advisory voices who have run societies, councils, and payment programs on campus.",
        "members": [
          {
            "name": "Zubair Arshad",
            "role": "Founding Product Lead",
            "bio": "Ships organizer workflows that survive real weekends — gates, slips, and certificates included.",
            "photoUrl": ""
          },
          {
            "name": "Dr. Naila Qureshi",
            "role": "Academic Council Member",
            "bio": "Advises on department oversight, society tenures, and audit expectations from university leadership.",
            "photoUrl": ""
          },
          {
            "name": "Hamza Baig",
            "role": "FinTech Policy Advisor",
            "bio": "Guides localized settlement patterns so campus organizers can collect and reconcile without friction.",
            "photoUrl": ""
          }
        ]
      }$team$::jsonb
    ),
    (
      'cta',
      70,
      $cta${
        "variant": "buttons",
        "kicker": "",
        "headline": "Ready to run frictionless events at your university or tech society?",
        "body": "Join the campus network or browse what organizers are already publishing.",
        "emailPlaceholder": "",
        "primaryCta": {"label": "Join our campus network", "href": "/auth/signup"},
        "secondaryCta": {"label": "Explore public events", "href": "/events"}
      }$cta$::jsonb
    )
) as b(type, sort, payload)
where p.slug = 'about';

-- Keep Features nav (#product) working on Home after FeatureGrid stopped hard-coding the id.
update public.site_blocks sb
set
  draft = coalesce(sb.draft, '{}'::jsonb) || '{"anchorId":"product"}'::jsonb,
  published = coalesce(sb.published, '{}'::jsonb) || '{"anchorId":"product"}'::jsonb,
  updated_at = now()
from public.site_pages p
where sb.page_id = p.id
  and p.slug = 'home'
  and sb.type = 'feature_grid';
