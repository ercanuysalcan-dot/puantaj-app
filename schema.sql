-- ====================================================================
-- PUANTAJ UYGULAMASI - Supabase Veritabanı Şeması
-- Bu dosyayı Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın.
-- ====================================================================

-- 1) PROFİLLER TABLOSU (auth.users tablosunu genişletir)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null default 'employee' check (role in ('employee', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Herkes kendi profilini görebilir; adminler herkesi görebilir
create policy "Kullanıcılar kendi profilini görebilir"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Adminler tüm profilleri görebilir"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 2) YENİ KULLANICI KAYDINDA OTOMATİK PROFİL OLUŞTURMA
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'employee'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) MESAİ (ATTENDANCE) TABLOSU
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  check_in timestamptz not null default now(),
  check_in_lat double precision,
  check_in_lng double precision,
  check_out timestamptz,
  check_out_lat double precision,
  check_out_lng double precision,
  created_at timestamptz not null default now()
);

alter table public.attendance enable row level security;

-- Çalışanlar sadece kendi kayıtlarını görebilir/ekleyebilir/güncelleyebilir
create policy "Kullanıcılar kendi mesai kayıtlarını görebilir"
  on public.attendance for select
  using (auth.uid() = user_id);

create policy "Kullanıcılar kendi mesai kaydını oluşturabilir"
  on public.attendance for insert
  with check (auth.uid() = user_id);

create policy "Kullanıcılar kendi açık kaydını güncelleyebilir"
  on public.attendance for update
  using (auth.uid() = user_id);

-- Adminler tüm kayıtları görebilir (raporlama için)
create policy "Adminler tüm mesai kayıtlarını görebilir"
  on public.attendance for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 4) İNDEKSLER (performans için)
create index if not exists attendance_user_id_idx on public.attendance(user_id);
create index if not exists attendance_check_in_idx on public.attendance(check_in);

-- ====================================================================
-- Bir kullanıcıyı admin yapmak için (SQL Editor'de manuel çalıştırın):
-- update public.profiles set role = 'admin' where id = '<kullanicinin-user-id-si>';
-- ====================================================================
