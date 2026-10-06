-- Run once in Supabase Dashboard > SQL Editor (after profiles.sql).
-- folders / sites 가 directory 의 Source of Truth.
-- 읽기: 로그인 사용자 전체 / 쓰기(INSERT, UPDATE, DELETE): profiles.role = 'admin' 만 (RLS).
-- 이전 site_order 는 sites.sort_order 로 대체된다.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
    check (slug not in ('home', 'auth', 'api', 'login')),
  headline text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.folders (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  url text not null check (url ~* '^https?://'),
  description text not null default '',
  image_url text not null default '',
  tag text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sites_folder_order_idx on public.sites (folder_id, sort_order);

alter table public.folders enable row level security;
alter table public.sites enable row level security;

drop policy if exists "folders_select" on public.folders;
create policy "folders_select" on public.folders
  for select to authenticated using (true);
drop policy if exists "folders_admin_insert" on public.folders;
create policy "folders_admin_insert" on public.folders
  for insert to authenticated with check (public.is_admin());
drop policy if exists "folders_admin_update" on public.folders;
create policy "folders_admin_update" on public.folders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "folders_admin_delete" on public.folders;
create policy "folders_admin_delete" on public.folders
  for delete to authenticated using (public.is_admin());

drop policy if exists "sites_select" on public.sites;
create policy "sites_select" on public.sites
  for select to authenticated using (true);
drop policy if exists "sites_admin_insert" on public.sites;
create policy "sites_admin_insert" on public.sites
  for insert to authenticated with check (public.is_admin());
drop policy if exists "sites_admin_update" on public.sites;
create policy "sites_admin_update" on public.sites
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "sites_admin_delete" on public.sites;
create policy "sites_admin_delete" on public.sites
  for delete to authenticated using (public.is_admin());

-- 기존 DATA / DESIGN / TOOLS 초기 데이터 (비어 있을 때만)
insert into public.folders (name, slug, headline, sort_order)
select * from (values
  ('DATA', 'data', 'DATA SOURCES FOR RESEARCH & DECISIONS.', 1),
  ('DESIGN', 'design', 'DESIGN REFERENCES FOR IDEAS & INTERFACES.', 2),
  ('TOOLS', 'tools', 'DIGITAL TOOLS FOR BUILDING & WORK.', 3)
) as v(name, slug, headline, sort_order)
where not exists (select 1 from public.folders);

insert into public.sites (folder_id, title, url, description, tag, sort_order)
select f.id, v.title, v.url, v.description, v.tag, v.sort_order
from (values
  ('data', 'GOOGLE TRENDS', 'https://trends.google.com', 'Explore search interest over time', 'TREND', 1),
  ('data', 'NAVER DATALAB', 'https://datalab.naver.com', 'Search & shopping data', 'KOREA', 2),
  ('data', 'KOSIS', 'https://kosis.kr', 'Official national statistics', 'STATISTICS', 3),
  ('data', 'DART', 'https://dart.fss.or.kr', 'Corporate disclosure system', 'FINANCE', 4),
  ('data', 'OECD', 'https://www.oecd.org', 'International economic indicators', 'GLOBAL', 5),
  ('data', 'WORLD BANK', 'https://data.worldbank.org', 'Open data on global development', 'GLOBAL', 6),
  ('design', 'BEHANCE', 'https://www.behance.net', 'Creative portfolios and projects', 'PORTFOLIO', 1),
  ('design', 'AWWWARDS', 'https://www.awwwards.com', 'Award-winning websites', 'WEB', 2),
  ('design', 'MOBBIN', 'https://mobbin.com', 'Mobile and web UI patterns', 'UI', 3),
  ('design', 'ARE.NA', 'https://www.are.na', 'Collected references and research', 'REFERENCE', 4),
  ('design', 'DRIBBBLE', 'https://dribbble.com', 'Design shots and visual ideas', 'VISUAL', 5),
  ('design', 'FIGMA COMMUNITY', 'https://www.figma.com/community', 'Shared files and templates', 'TEMPLATE', 6),
  ('tools', 'GITHUB', 'https://github.com', 'Code hosting and collaboration', 'CODE', 1),
  ('tools', 'PAGESPEED', 'https://pagespeed.web.dev', 'Page performance analysis', 'PERFORMANCE', 2),
  ('tools', 'FIGMA', 'https://www.figma.com', 'Collaborative interface design', 'DESIGN', 3),
  ('tools', 'CODEPEN', 'https://codepen.io', 'Front-end playground', 'SANDBOX', 4),
  ('tools', 'NOTION', 'https://www.notion.so', 'Notes, docs and planning', 'WORKSPACE', 5),
  ('tools', 'VERCEL', 'https://vercel.com', 'Deploy and host web projects', 'DEPLOY', 6)
) as v(slug, title, url, description, tag, sort_order)
join public.folders f on f.slug = v.slug
where not exists (select 1 from public.sites);
