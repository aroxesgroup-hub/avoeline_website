-- Demo partners + richer partners CMS copy (gateways, perks, trust panel).
-- Editable under /admin/website Pages + Partners tabs.

delete from public.site_partners
where organizer_id is null
  and name in (
    'FAST National University',
    'FAST Computing Society',
    'GDG Pakistan',
    'Lahore Gawali Series',
    'AWS Community PK',
    'TechJuice'
  );

insert into public.site_partners (
  name, url, category, description, consent_status, visible, featured, sort, consent_source, consent_at
)
values
  ('FAST National University', 'https://nu.edu.pk', 'academy', 'Academy · 4 chapters on Avoeline', 'granted', true, true, 10, 'admin', now()),
  ('FAST Computing Society', null, 'society', 'Society · Center Wing', 'granted', true, true, 20, 'admin', now()),
  ('GDG Pakistan', 'https://gdg.community.dev', 'developer', 'Network · National chapters', 'granted', true, false, 30, 'admin', now()),
  ('Lahore Gawali Series', null, 'sponsor', 'Corporate · Event associates', 'granted', true, false, 40, 'admin', now()),
  ('AWS Community PK', null, 'community', 'Community · Cloud Days', 'granted', true, false, 50, 'admin', now()),
  ('TechJuice', 'https://www.techjuice.pk', 'media', 'Media · Media partner', 'granted', true, false, 60, 'admin', now());

delete from public.site_blocks
where page_id = (select id from public.site_pages where slug = 'partners');

insert into public.site_blocks (page_id, type, sort, visible, draft, published, updated_at)
select p.id, b.type, b.sort, true, b.payload::jsonb, b.payload::jsonb, now()
from public.site_pages p
cross join lateral (
  values
    (
      'hero',
      10,
      '{"headline":"Partner with Avoeline to power premier events & campus communities.","subheadline":"We collaborate with universities, tech communities, caterers, and campus engineers across Pakistan — one network for sponsorships, RFQs, and day-of execution.","eyebrow":"Partner network","statusLine":"Estimated network response: 24–48 hours","trustLine":"","trustTitle":"","trustLogos":[],"imageUrl":"","imageAlt":"","primaryCta":{"label":"Apply for Partnership →","href":"#partner-apply"},"secondaryCta":{"label":"","href":""},"tertiaryCta":{"label":"","href":""}}'
    ),
    (
      'stats_strip',
      20,
      '{"title":"","items":[{"key":"campus","label":"Active Campus Societies","value":"140+"},{"key":"capital","label":"Capital Disbursed","value":"PKR 82M+"},{"key":"checkins","label":"Attendees Checked-in","value":"320,000"},{"key":"satisfaction","label":"Partner Satisfaction","value":"99.4%"}]}'
    ),
    (
      'logo_wall',
      30,
      '{"title":"Verified Partners & Campus Ecosystem","body":"Granted partners appear here with logos from the Website Partners tab. Categories and descriptions are owner-editable.","category":"","items":[]}'
    ),
    (
      'audience_tabs',
      40,
      '{"title":"Dual Gateways to Scalable Collaboration","body":"Two paths into the Avoeline network — campus chapters and certified vendors.","tabs":[{"title":"For Campus Societies & Universities","body":"Centralize chapters, sponsorships, and multi-event operations under one department tree.","icon":"UN","bullets":["Centralized Sponsorship Pool","Automated Variable Keeping","Full-Stack Execution Portal"],"imageUrl":"https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80","ctaLabel":"Register Campus Chapter ↗","ctaHref":"#partner-apply"},{"title":"For Vendors & Service Providers","body":"Get matched to organizer RFQs with clear scopes and priority bidding on Pro events.","icon":"VN","bullets":["Direct Escrow Protection","Automated RFQ Matching","Priority Tier Badging"],"imageUrl":"https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1200&q=80","ctaLabel":"List as Certified Vendor ↗","ctaHref":"/auth/signup?plan=vendor_free"}]}'
    ),
    (
      'feature_grid',
      50,
      '{"title":"Partnership Perks & Network Yield","body":"What partners unlock when they join the Avoeline network — edit any card in Website → Pages.","items":[{"title":"Priority Vendor Matchmaking","body":"Surface certified vendors to organizers when RFQs open — aim for 24-hour bid turnover.","icon":"Match","imageUrl":"","tags":["Vendors"],"span":""},{"title":"Co-branded Certificates","body":"High-fidelity, verifiable PDFs with partner marks where organizers enable branding.","icon":"Certs","imageUrl":"","tags":["Verifiable"],"span":""},{"title":"University Outreach Engine","body":"Reach societies and student councils already running live events on Avoeline.","icon":"Campus","imageUrl":"","tags":["Societies"],"span":""},{"title":"Enterprise Sponsorships","body":"Unified engagement reporting across multi-event packages organizers already trust.","icon":"ROI","imageUrl":"","tags":["Sponsors"],"span":""}]}'
    ),
    (
      'steps',
      60,
      '{"title":"The Avoeline Trust Protocol for Campus Events","body":"How campus organizers keep sponsor commitments, hand-offs, and settlements checkable. The right panel is an editable CMS example — not live ledger data.","items":[{"title":"Escrow-backed society plans","body":"Commitments stay visible to the right roles with a checkable vault trail.","icon":"","linkLabel":"","href":""},{"title":"Hand-off confirmation","body":"Execution milestones confirm before the next disbursement step.","icon":"","linkLabel":"","href":""},{"title":"Automated disbursement clarity","body":"Sponsors and organizers see remaining balance and settlement status.","icon":"","linkLabel":"Apply to partner","href":"#partner-apply"}],"panel":{"title":"Live Escrow Telemetry Example","badge":"Verified Transaction","progressLabel":"Settlement progress","progressPercent":85,"footer":"Automated stake-based settlement engine running (demo).","rows":[{"label":"Disbursed Amount","value":"PKR 450,000","hint":"Sponsor: De-Pulse PK"},{"label":"Retention Trust","value":"PKR 150,000","hint":"XY & Truss Plugins"},{"label":"Final Settlement","value":"PKR 270,000","hint":"Pending hand-off"}]}}'
    )
) as b(type, sort, payload)
where p.slug = 'partners';
