-- EcoModel Phase 4: initial Postgres schema, RLS, and audit log.
-- Single-practitioner app: every data table carries owner_id even though there is
-- currently only ever one owner, as cheap defense-in-depth and to keep the door
-- open for multi-practitioner use later without a rebuild (see CLAUDE.md Section 13).
--
-- Archive-not-delete is enforced at the database level, not just by app convention:
-- no DELETE RLS policy is created on any data table, and DELETE is explicitly
-- revoked from the authenticated role below.

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  display_name text not null,
  dob_or_age_band text not null default '',
  case_reference text not null default '',
  assigned_practitioner text not null default '',
  status text not null default 'active' check (status in ('active', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_owner_status_idx on clients (owner_id, status);
create index clients_case_reference_idx on clients (case_reference);

-- ---------------------------------------------------------------------------
-- ecomap_versions
-- ---------------------------------------------------------------------------
create table ecomap_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  client_id uuid not null references clients(id),
  date_of_assessment date,
  version_label text not null default '',
  summary_notes text not null default '',
  status text not null default 'draft' check (status in ('draft', 'finalised', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ecomap_versions_client_status_idx on ecomap_versions (client_id, status);

-- ---------------------------------------------------------------------------
-- categories (must exist before nodes, which reference it)
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_owner_status_idx on categories (owner_id, status);

-- ---------------------------------------------------------------------------
-- flags (colour flags; must exist before nodes)
-- ---------------------------------------------------------------------------
create table flags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  colour text not null,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index flags_owner_status_idx on flags (owner_id, status);

-- ---------------------------------------------------------------------------
-- nodes
-- ---------------------------------------------------------------------------
create table nodes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  ecomap_version_id uuid not null references ecomap_versions(id),
  label text not null default '',
  category_id uuid references categories(id),
  flag_id uuid references flags(id),
  x double precision not null default 0,
  y double precision not null default 0,
  notes text not null default '',
  is_central boolean not null default false,
  is_household_member boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nodes_version_status_idx on nodes (ecomap_version_id, status);

-- ---------------------------------------------------------------------------
-- edges
-- ---------------------------------------------------------------------------
create table edges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  ecomap_version_id uuid not null references ecomap_versions(id),
  from_node_id uuid not null references nodes(id),
  to_node_id uuid not null references nodes(id),
  relationship_type text not null default 'strong' check (relationship_type in ('strong', 'weak', 'stressful', 'absent')),
  direction text not null default 'none' check (direction in ('none', 'oneWayAToB', 'oneWayBToA', 'bidirectional')),
  label text not null default '',
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index edges_version_status_idx on edges (ecomap_version_id, status);

-- ---------------------------------------------------------------------------
-- relationship_colours: fixed set of 4 rows, one per RelationshipType.
-- No id/status column, matching the current Dexie design where relationshipType
-- itself is the primary key and the set is structural, not user-addable/retireable.
-- ---------------------------------------------------------------------------
create table relationship_colours (
  relationship_type text primary key check (relationship_type in ('strong', 'weak', 'stressful', 'absent')),
  owner_id uuid not null default auth.uid() references auth.users(id),
  colour text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: every data table is owner-scoped. No DELETE policy is
-- ever created — combined with the explicit revoke below, this makes
-- archive-not-delete a database-enforced fact, not just an app convention.
-- ---------------------------------------------------------------------------
alter table clients enable row level security;
alter table ecomap_versions enable row level security;
alter table nodes enable row level security;
alter table edges enable row level security;
alter table categories enable row level security;
alter table flags enable row level security;
alter table relationship_colours enable row level security;

create policy "select own" on clients for select using (owner_id = auth.uid());
create policy "insert own" on clients for insert with check (owner_id = auth.uid());
create policy "update own" on clients for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "select own" on ecomap_versions for select using (owner_id = auth.uid());
create policy "insert own" on ecomap_versions for insert with check (owner_id = auth.uid());
create policy "update own" on ecomap_versions for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "select own" on nodes for select using (owner_id = auth.uid());
create policy "insert own" on nodes for insert with check (owner_id = auth.uid());
create policy "update own" on nodes for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "select own" on edges for select using (owner_id = auth.uid());
create policy "insert own" on edges for insert with check (owner_id = auth.uid());
create policy "update own" on edges for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "select own" on categories for select using (owner_id = auth.uid());
create policy "insert own" on categories for insert with check (owner_id = auth.uid());
create policy "update own" on categories for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "select own" on flags for select using (owner_id = auth.uid());
create policy "insert own" on flags for insert with check (owner_id = auth.uid());
create policy "update own" on flags for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "select own" on relationship_colours for select using (owner_id = auth.uid());
create policy "insert own" on relationship_colours for insert with check (owner_id = auth.uid());
create policy "update own" on relationship_colours for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Belt-and-braces: revoke DELETE outright so it can never be granted back to
-- the authenticated role by an accidental future policy change.
revoke delete on clients, ecomap_versions, nodes, edges, categories, flags, relationship_colours
  from authenticated;

-- ---------------------------------------------------------------------------
-- Finalised-version lock, enforced at the DB level in addition to the existing
-- app-level assertVersionEditable() guard in src/db/repositories/ecomapVersions.ts.
-- Mirrors that guard: once an ecomap_versions row is 'finalised', its nodes and
-- edges become fully read-only, no exceptions.
-- ---------------------------------------------------------------------------
create or replace function fn_reject_write_if_version_finalised()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  version_status text;
begin
  select status into version_status from ecomap_versions where id = coalesce(new.ecomap_version_id, old.ecomap_version_id);
  if version_status = 'finalised' then
    raise exception 'ecomap version is finalised and read-only';
  end if;
  return new;
end;
$$;

create trigger trg_nodes_finalised_lock
  before insert or update on nodes
  for each row execute function fn_reject_write_if_version_finalised();

create trigger trg_edges_finalised_lock
  before insert or update on edges
  for each row execute function fn_reject_write_if_version_finalised();

-- ---------------------------------------------------------------------------
-- Audit log: server-side, tamper-resistant (writes only via SECURITY DEFINER
-- functions; the authenticated role has no direct insert/update/delete grant).
-- Covers all 7 data tables per the confirmed Phase 4 scope decision.
-- ---------------------------------------------------------------------------
create table audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid not null default auth.uid() references auth.users(id),
  action text not null check (action in ('create', 'update', 'archive', 'finalise', 'view', 'export')),
  entity_table text not null,
  -- text, not uuid: relationship_colours' primary key (relationship_type) is
  -- not a UUID, so this column has to accommodate both id shapes.
  entity_id text not null,
  client_id uuid,
  metadata jsonb
);

create index audit_log_actor_idx on audit_log (actor_id, occurred_at desc);
create index audit_log_client_idx on audit_log (client_id, occurred_at desc);

alter table audit_log enable row level security;
create policy "select own" on audit_log for select using (actor_id = auth.uid());
revoke insert, update, delete on audit_log from authenticated;

-- Classifies create/update/archive/finalise from the row transition itself,
-- so it can't be skipped by an app code path forgetting to log it. Postgres
-- has no SELECT trigger, so "view" events are NOT covered here — they need an
-- explicit RPC (see log_view_event below), which is inherently weaker since a
-- client that doesn't call it simply doesn't log a view.
--
-- Important: this one function is attached to all 7 data tables, which don't
-- share an identical column set (relationship_colours has no id/status
-- column — its key is relationship_type). A field reference like NEW.status
-- must therefore only ever appear inside a PL/pgSQL statement that is itself
-- guarded by a TG_TABLE_NAME check for a table known to have that column —
-- PL/pgSQL only validates a statement's field references when that statement
-- actually executes, so an unreached branch's field access is never checked.
-- Folding the same logic into a single SQL expression (e.g. a bare CASE) does
-- NOT get this laziness: the whole expression is planned against the
-- concrete NEW row type up front, so any referenced field must exist on
-- every table the trigger fires on, even in a branch that wouldn't be taken.
create or replace function fn_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  computed_action text := 'update';
  computed_client_id uuid := null;
  computed_entity_id text;
begin
  if TG_OP = 'INSERT' then
    computed_action := 'create';
  elsif TG_TABLE_NAME = 'ecomap_versions' then
    if NEW.status = 'finalised' and OLD.status is distinct from 'finalised' then
      computed_action := 'finalise';
    elsif NEW.status = 'archived' and OLD.status is distinct from 'archived' then
      computed_action := 'archive';
    end if;
  elsif TG_TABLE_NAME in ('clients', 'nodes', 'edges', 'categories', 'flags') then
    if NEW.status = 'archived' and OLD.status is distinct from 'archived' then
      computed_action := 'archive';
    end if;
  end if;
  -- relationship_colours has no status column: only 'create'/'update' ever
  -- apply to it, both handled by the defaults above.

  if TG_TABLE_NAME = 'clients' then
    computed_client_id := NEW.id;
  elsif TG_TABLE_NAME = 'ecomap_versions' then
    computed_client_id := NEW.client_id;
  end if;

  if TG_TABLE_NAME = 'relationship_colours' then
    computed_entity_id := NEW.relationship_type;
  else
    computed_entity_id := NEW.id::text;
  end if;

  insert into audit_log (actor_id, action, entity_table, entity_id, client_id)
  values (auth.uid(), computed_action, TG_TABLE_NAME, computed_entity_id, computed_client_id);

  return NEW;
end;
$$;

create trigger trg_audit_clients after insert or update on clients
  for each row execute function fn_audit_log();
create trigger trg_audit_ecomap_versions after insert or update on ecomap_versions
  for each row execute function fn_audit_log();
create trigger trg_audit_nodes after insert or update on nodes
  for each row execute function fn_audit_log();
create trigger trg_audit_edges after insert or update on edges
  for each row execute function fn_audit_log();
create trigger trg_audit_categories after insert or update on categories
  for each row execute function fn_audit_log();
create trigger trg_audit_flags after insert or update on flags
  for each row execute function fn_audit_log();
create trigger trg_audit_relationship_colours after insert or update on relationship_colours
  for each row execute function fn_audit_log();

-- Explicit RPC for view/export events, called from the app at page-load /
-- export time. security definer so the authenticated role needs only EXECUTE,
-- never direct INSERT on audit_log.
create or replace function log_view_event(p_entity_table text, p_entity_id text, p_client_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into audit_log (actor_id, action, entity_table, entity_id, client_id)
  values (auth.uid(), 'view', p_entity_table, p_entity_id, p_client_id);
end;
$$;

create or replace function log_export_event()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into audit_log (actor_id, action, entity_table, entity_id, client_id)
  values (auth.uid(), 'export', 'database', auth.uid()::text, null);
end;
$$;

grant execute on function log_view_event(text, text, uuid) to authenticated;
grant execute on function log_export_event() to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: broadcast changes on the 7 data tables (not audit_log, which has
-- no UI reason to be realtime). replica identity full ensures non-PK columns
-- (e.g. ecomap_version_id) are present in UPDATE/DELETE change payloads, which
-- src/lib/useRealtimeQuery.ts filters can rely on.
-- ---------------------------------------------------------------------------
alter table clients replica identity full;
alter table ecomap_versions replica identity full;
alter table nodes replica identity full;
alter table edges replica identity full;
alter table categories replica identity full;
alter table flags replica identity full;
alter table relationship_colours replica identity full;

alter publication supabase_realtime add table
  clients, ecomap_versions, nodes, edges, categories, flags, relationship_colours;
