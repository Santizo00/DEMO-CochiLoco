create extension if not exists pgcrypto;

alter table public.usuarios enable row level security;
alter table public.imagenes enable row level security;

revoke all on table public.usuarios from anon, authenticated;
grant select on table public.imagenes to anon, authenticated;

drop policy if exists "Public read imagenes" on public.imagenes;
create policy "Public read imagenes"
on public.imagenes
for select
using (true);

create index if not exists imagenes_fecha_idx on public.imagenes (fecha desc);

comment on table public.usuarios is 'Tabla privada para validar el acceso del unico administrador desde Edge Functions.';
comment on table public.imagenes is 'Tabla publica que expone la galeria visible para todos los visitantes.';
