-- Partners page mock: CMS-editable sections. Logos hydrate from site_partners by category.

insert into public.site_pages (slug, title, status, seo)
values (
  'partners',
  'Partners',
  'published',
  '{"title":"Partners — Avoeline","description":"Partner with Avoeline for campus societies, vendors, and event networks."}'::jsonb
)
on conflict (slug) do update set
  title = excluded.title,
  status = 'published',
  seo = excluded.seo,
  updated_at = now();

delete from public.site_blocks
where page_id = (select id from public.site_pages where slug = 'partners');

insert into public.site_blocks (page_id, type, sort, visible, draft, published, updated_at)
select p.id, b.type, b.sort, true, b.payload, b.payload, now()
from public.site_pages p
cross join lateral (
  values
    (
      'hero'::text,
      10,
      $hero${
        "headline": "Partner with Avoeline to power premier events & campus communities.",
        "subheadline": "We collaborate with universities, societies, tech communities, and certified vendors across Pakistan — one network for sponsorships, RFQs, and day-of execution.",
        "eyebrow": "Partner network",
        "statusLine": "Unified review in 24–48 hours",
        "trustLine": "",
        "trustTitle": "",
        "trustLogos": [],
        "imageUrl": "",
        "imageAlt": "",
        "primaryCta": {"label": "Apply for Partnership →", "href": "#partner-apply"},
        "secondaryCta": {"label": "", "href": ""},
        "tertiaryCta": {"label": "", "href": ""}
      }$hero$::jsonb
    ),
    (
      'stats_strip',
      20,
      $stats${
        "title": "",
        "items": [
          {"key": "institutions_count", "label": "Active Campus Societies", "value": ""},
          {"key": "events_count", "label": "Events on Platform", "value": ""},
          {"key": "certificates_count", "label": "Certificates Issued", "value": ""},
          {"key": "active_organizers_count", "label": "Network Partners", "value": ""}
        ]
      }$stats$::jsonb
    ),
    (
      'logo_wall',
      30,
      '{"title": "Verified partners & campus ecosystem", "category": "", "items": []}'::jsonb
    ),

    (
      'audience_tabs',
      40,
      $gateways${
        "title": "Dual gateways to scalable collaboration",
        "body": "Choose the path that matches how you work with campus events.",
        "tabs": [
          {
            "title": "For campus societies & universities",
            "body": "Centralize chapters, sponsorships, and multi-event operations under one department tree.",
            "icon": "UN",
            "bullets": [
              "Centralized sponsorship visibility",
              "Club and department hierarchy",
              "Full-stack event execution portal"
            ],
            "imageUrl": "",
            "ctaLabel": "Register Campus Chapter ↗",
            "ctaHref": "#partner-apply"
          },
          {
            "title": "For vendors & service providers",
            "body": "Get matched to organizer RFQs with clear scopes and priority bidding on Pro events.",
            "icon": "VN",
            "bullets": [
              "Direct secure promoter introductions",
              "Automated RFQ matching",
              "Priority tier bidding"
            ],
            "imageUrl": "",
            "ctaLabel": "List as Certified Vendor ↗",
            "ctaHref": "/auth/signup?plan=vendor_free"
          }
        ]
      }$gateways$::jsonb
    ),
    (
      'feature_grid',
      50,
      $perks${
        "title": "Partnership perks & network yield",
        "body": "What partners unlock when they join the Avoeline network.",
        "items": [
          {
            "title": "Priority vendor matchmaking",
            "body": "Surface certified vendors to organizers when RFQs open — less cold outreach.",
            "icon": "Match",
            "imageUrl": "",
            "tags": ["Vendors"],
            "span": ""
          },
          {
            "title": "Co-branded certificates",
            "body": "Issue verifiable PDFs with partner marks where organizers enable sponsor branding.",
            "icon": "Certs",
            "imageUrl": "",
            "tags": ["100% verifiable"],
            "span": ""
          },
          {
            "title": "University outreach engine",
            "body": "Reach societies and departments already running live events on Avoeline.",
            "icon": "Campus",
            "imageUrl": "",
            "tags": ["Societies"],
            "span": ""
          },
          {
            "title": "Enterprise sponsorships",
            "body": "Package multi-event visibility with attendance and check-in analytics organizers already trust.",
            "icon": "ROI",
            "imageUrl": "",
            "tags": ["Sponsors"],
            "span": ""
          }
        ]
      }$perks$::jsonb
    ),
    (
      'steps',
      60,
      $trust${
        "title": "The Avoeline Trust Protocol for campus events",
        "body": "Illustrative example of how organizers track sponsor commitments and execution payouts — editable CMS copy, not live ledger data.",
        "items": [
          {
            "title": "Checkable commitments",
            "body": "Society plans and sponsor asks stay visible to the right roles.",
            "icon": "1",
            "linkLabel": "",
            "href": ""
          },
          {
            "title": "Verified transactions",
            "body": "Bank-transfer style confirmations and organizer approval trails.",
            "icon": "2",
            "linkLabel": "",
            "href": ""
          },
          {
            "title": "Remaining balance clarity",
            "body": "Example treasury view: sponsor amount, execution payout, remaining balance.",
            "icon": "3",
            "linkLabel": "Apply to partner",
            "href": "#partner-apply"
          }
        ]
      }$trust$::jsonb
    ),
    (
      'rich_text',
      70,
      $note${
        "title": "Live Event Treasury example",
        "markdown": "Example panel (CMS-editable):\n\nSponsor amount — PKR 850,000\nExecution payout — PKR 722,500\nRemaining balance — PKR 127,500\nProgress — 85% committed\n\nThis is demo narrative for the public site. Real event finances stay inside organizer dashboards."
      }$note$::jsonb
    )
) as b(type, sort, payload)
where p.slug = 'partners';
