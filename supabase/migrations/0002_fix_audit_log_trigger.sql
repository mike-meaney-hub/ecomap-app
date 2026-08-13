-- Fixes fn_audit_log(): it referenced NEW.status/NEW.id/NEW.client_id
-- unconditionally in single SQL expressions, which Postgres validates against
-- the concrete row type of every table the trigger fires on — including
-- relationship_colours, which has neither an id nor a status column (its key
-- is relationship_type). This broke every insert/update on categories,
-- flags, and relationship_colours (surfaced as "record 'new' has no field
-- 'client_id'" during first-login seeding). Rewritten to guard each field
-- access inside a PL/pgSQL IF branch specific to tables known to have that
-- column, and switches audit_log.entity_id from uuid to text since
-- relationship_type isn't a UUID.

alter table audit_log alter column entity_id type text using entity_id::text;

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

-- Signature changed (p_entity_id uuid -> text), so drop the old overload
-- explicitly rather than leaving it stranded alongside the new one.
drop function if exists log_view_event(text, uuid, uuid);

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
