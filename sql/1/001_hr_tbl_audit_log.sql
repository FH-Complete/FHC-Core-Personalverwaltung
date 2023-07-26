CREATE TABLE IF NOT EXISTS hr.tbl_audit_log (
  audit_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mtime timestamptz not null default now(),
  action char not null check (action in ('I', 'U', 'D')),
  username text not null,
  table_name text not null,
  diff_data jsonb not null,
  row_data jsonb not null
);

CREATE INDEX IF NOT EXISTS idx_tbl_audit_log_mtime ON hr.tbl_audit_log USING brin (mtime);
-- CREATE INDEX ON hr.tbl_audit_log ((row_data->>'my_pk')) WHERE row_data->>'my_pk' IS NOT NULL;  
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE INDEX IF NOT EXISTS idx_tbl_audit_log_table_name ON hr.tbl_audit_log USING gin (table_name);  -- GiN is better for lots of repeating values

CREATE OR REPLACE FUNCTION hr.generic_log_diffed()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  r record;
  old_row jsonb;
  changed_cols jsonb := jsonb_build_object();
BEGIN
  
  IF TG_OP = 'DELETE' THEN    
    INSERT INTO hr.tbl_audit_log (mtime, action, username, table_name, diff_data, row_data) VALUES (now(), 'D', session_user, TG_TABLE_NAME, to_jsonb(row()), to_jsonb(OLD));
  
  ELSIF TG_OP = 'UPDATE' THEN
    old_row := to_jsonb(OLD);

    FOR r IN SELECT * FROM jsonb_each(to_jsonb(NEW))
    LOOP
      IF r.key<>'updatevon' AND r.key<>'updateamum' AND r.value IS DISTINCT FROM jsonb_extract_path(old_row, r.key) THEN
        -- RAISE NOTICE 'Change in %.% - OLD: %s, NEW: %s', TG_TABLE_NAME, r.key, jsonb_extract_path(old_row, r.key), r.value;
        changed_cols := jsonb_set(changed_cols, array[r.key], r.value);
      END IF;
    END LOOP;
    
    -- any cols changed?
    IF changed_cols != jsonb_build_object() THEN
      INSERT INTO hr.tbl_audit_log (mtime, action, username, table_name, diff_data, row_data) VALUES (now(), 'U', session_user, TG_TABLE_NAME, to_jsonb(changed_cols), to_jsonb(OLD));
    ELSE
      NULL;
      -- RAISE WARNING 'No changes detected for tbl %, OLD: %s, NEW: %s', TG_TABLE_NAME, OLD, NEW;
      -- FYI - if this happens a lot, then declaring CREATE TRIGGER ... WHEN OLD IS DISTINCT FROM NEW could give a small performance boost...
    END IF;
  
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO hr.tbl_audit_log (mtime, action, username, table_name, diff_data, row_data) VALUES (now(), 'I' , session_user, TG_TABLE_NAME, to_jsonb(NEW), to_jsonb(row()));
  END IF;

  RETURN NULL;
END;
$function$;

GRANT SELECT, UPDATE, INSERT, DELETE ON hr.tbl_audit_log TO vilesci;

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_dienstverhaeltnis;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_dienstverhaeltnis FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_vertragsbestandteil;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_vertragsbestandteil FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_vertragsbestandteil_freitext;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_vertragsbestandteil_freitext FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_vertragsbestandteil_funktion;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_vertragsbestandteil_funktion FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_vertragsbestandteil_karenz;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_vertragsbestandteil_karenz FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_vertragsbestandteil_kuendigungsfrist;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_vertragsbestandteil_kuendigungsfrist FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_vertragsbestandteil_stunden;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_vertragsbestandteil_stunden FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_vertragsbestandteil_urlaubsanspruch;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_vertragsbestandteil_urlaubsanspruch FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_vertragsbestandteil_zeitaufzeichnung;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_vertragsbestandteil_zeitaufzeichnung FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();

DROP TRIGGER IF EXISTS log_generic ON hr.tbl_gehaltsbestandteil;
CREATE TRIGGER log_generic AFTER INSERT OR UPDATE OR DELETE ON hr.tbl_gehaltsbestandteil FOR EACH ROW EXECUTE FUNCTION hr.generic_log_diffed();
