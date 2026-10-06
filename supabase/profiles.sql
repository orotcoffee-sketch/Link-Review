-- Run once in Supabase Dashboard > SQL Editor.
-- role 은 서버(DB)에서만 결정된다. 클라이언트는 자기 row 를 읽을 수만 있고 쓸 수 없다.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'member' check (role in ('member', 'admin'))
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());
-- insert / update / delete policy 없음 => 일반 사용자는 role 을 바꿀 수 없다.

-- 가입 및 이메일 인증 시 profile 생성/갱신. admin 은 인증 완료된 해당 이메일만.
create or replace function public.sync_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when lower(new.email) = 'orotcoffee@gmail.com'
        and new.email_confirmed_at is not null then 'admin'
      else 'member'
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        role = case
          when lower(excluded.email) = 'orotcoffee@gmail.com'
            and new.email_confirmed_at is not null then 'admin'
          else public.profiles.role
        end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_sync on auth.users;
create trigger on_auth_user_sync
  after insert or update of email, email_confirmed_at on auth.users
  for each row execute function public.sync_profile();

-- 이미 가입된 계정 반영
insert into public.profiles (id, email, role)
select id, email,
  case when lower(email) = 'orotcoffee@gmail.com' and email_confirmed_at is not null
       then 'admin' else 'member' end
from auth.users
on conflict (id) do update set role = excluded.role, email = excluded.email;
