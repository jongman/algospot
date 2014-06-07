ALTER TABLE guardian_groupobjectpermission ALTER COLUMN object_pk TYPE integer USING (object_pk::integer); 
ALTER TABLE guardian_userobjectpermission ALTER COLUMN object_pk TYPE integer USING (object_pk::integer);
