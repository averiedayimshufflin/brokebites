create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  item_key text not null,
  category text default 'Other',
  created_at timestamptz default now(),
  unique (user_id, item_key)
);

alter table public.pantry_items enable row level security;

grant select, insert, update, delete on public.pantry_items to authenticated;

drop policy if exists "Pantry items are user-owned" on public.pantry_items;
create policy "Pantry items are user-owned"
on public.pantry_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
