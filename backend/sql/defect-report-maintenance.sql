-- Aplicar em bancos existentes, com o backend parado, antes de iniciar a nova versão.
-- O Hibernate cria as novas colunas no próximo início (ddl-auto=update), mas não
-- amplia a restrição de enum já existente no PostgreSQL.
BEGIN;
DO $$
DECLARE
    status_constraint record;
BEGIN
    IF to_regclass('public.defect_reports') IS NOT NULL THEN
        FOR status_constraint IN
            SELECT conname FROM pg_constraint
            WHERE conrelid = 'public.defect_reports'::regclass
              AND contype = 'c'
              AND pg_get_constraintdef(oid) ~ '\mstatus\M'
        LOOP
            EXECUTE format('ALTER TABLE public.defect_reports DROP CONSTRAINT %I', status_constraint.conname);
        END LOOP;
        ALTER TABLE public.defect_reports ADD CONSTRAINT defect_reports_status_check
            CHECK (status IN ('OPEN', 'WAITING_RETURN', 'IN_MAINTENANCE', 'RESOLVED', 'DISMISSED'));
    END IF;
END $$;
COMMIT;
