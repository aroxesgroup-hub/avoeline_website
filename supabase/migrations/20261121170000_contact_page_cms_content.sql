-- Contact desk mock: organization/expedited on messages + CMS sections.

alter table public.contact_messages
  add column if not exists organization text,
  add column if not exists expedited boolean not null default false;

insert into public.site_pages (slug, title, status, seo)
values (
  'contact',
  'Contact',
  'published',
  '{"title":"Contact — Avoeline","description":"Get in touch with the Avoeline team for campus partnerships, enterprise billing, or general support."}'::jsonb
)
on conflict (slug) do update set
  title = excluded.title,
  status = 'published',
  seo = excluded.seo,
  updated_at = now();

delete from public.site_blocks
where page_id = (select id from public.site_pages where slug = 'contact');

insert into public.site_blocks (page_id, type, sort, visible, draft, published, updated_at)
select p.id, b.type, b.sort, true, b.payload, b.payload, now()
from public.site_pages p
cross join lateral (
  values
    (
      'hero'::text,
      10,
      $hero${
        "headline": "Get in touch with the Avoeline team.",
        "subheadline": "Whether you run a 2,000-person summit, need enterprise campus multi-society billing, or want vendor marketplace access.",
        "eyebrow": "Editorial desk & concierge",
        "statusLine": "",
        "trustLine": "",
        "trustTitle": "",
        "trustLogos": [],
        "imageUrl": "",
        "imageAlt": "",
        "primaryCta": {"label": "", "href": ""},
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
          {"key": "", "label": "Live response SLA", "value": "< 120 mins"},
          {"key": "", "label": "Global coverage", "value": "PKT / GMT+5 · 24/7 Ops"}
        ]
      }$stats$::jsonb
    ),
    (
      'support_tiers',
      30,
      $tiers${
        "title": "",
        "body": "",
        "items": [
          {
            "badge": "Priority routing / Fast track",
            "title": "Campus & University Partnerships",
            "body": "Societies, departments, and multi-chapter rollouts with dedicated campus routing.",
            "email": "campus@aroxes.com",
            "topicKey": "sales",
            "ctaLabel": "Select topic →",
            "icon": "UN"
          },
          {
            "badge": "Finance & scale / FBR ready",
            "title": "Enterprise & Custom Invoicing",
            "body": "Custom contracts, invoicing, and multi-society billing for large institutions.",
            "email": "enterprise@aroxes.com",
            "topicKey": "sales",
            "ctaLabel": "Select topic →",
            "icon": "EN"
          },
          {
            "badge": "Always on",
            "title": "General Support & Help Desk",
            "body": "Product questions, account help, and day-of operational escalations.",
            "email": "info@aroxes.com",
            "topicKey": "support",
            "ctaLabel": "Select topic →",
            "icon": "HD"
          }
        ]
      }$tiers$::jsonb
    ),
    (
      'contact_hub',
      40,
      $hub${
        "title": "Lahore Hub",
        "mapImageUrl": "",
        "mapEmbedUrl": "",
        "address": "Aroxes / Avoeline Technologies\nMain Boulevard, Gulberg III\nLahore, Punjab 54000, Pakistan",
        "hours": "Mon–Sat · 09:00 – 20:00 PKT",
        "emergencyLine": "Emergency: 24/7 priority channel",
        "emergencyTitle": "Live Event Emergency SLA",
        "emergencyBody": "Under 120-minute response for production blockages during live campus and summit events.",
        "emergencyCtaLabel": "Direct live dispatch →",
        "emergencyCtaHref": "mailto:info@aroxes.com?subject=Live%20Event%20Emergency",
        "communityLabel": "Organizer Community: Join server →",
        "communityHref": "https://discord.gg/"
      }$hub$::jsonb
    )
) as b(type, sort, payload)
where p.slug = 'contact';
