-- Migration: 20260907000000_create_workspace_atomic.sql
-- Description: Transactional workspace creation RPC function with atomic rollback.
-- Reference: DB-02 Architecture Recommendation

CREATE OR REPLACE FUNCTION create_workspace_atomic(
  p_workspace_name text,
  p_care_recipient_name text,
  p_timezone text DEFAULT 'America/New_York',
  p_workspace_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
  v_care_recipient_id uuid;
  v_emergency_info_id uuid;
  v_user_email text;
  v_display_name text;
BEGIN
  -- 1. Enforce Authenticated Session
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User session required';
  END IF;

  -- 2. Validate Inputs
  IF length(trim(p_workspace_name)) < 3 OR length(trim(p_workspace_name)) > 50 THEN
    RAISE EXCEPTION 'Workspace name must be between 3 and 50 characters';
  END IF;

  IF length(trim(p_care_recipient_name)) < 1 OR length(trim(p_care_recipient_name)) > 50 THEN
    RAISE EXCEPTION 'Care recipient preferred name must be between 1 and 50 characters';
  END IF;

  -- 3. Idempotency Check (if client provided an explicit UUID)
  IF p_workspace_id IS NOT NULL THEN
    SELECT id INTO v_workspace_id
      FROM workspaces
     WHERE id = p_workspace_id AND owner_id = v_user_id AND deleted_at IS NULL;

    IF v_workspace_id IS NOT NULL THEN
      SELECT id INTO v_care_recipient_id
        FROM care_recipients
       WHERE workspace_id = v_workspace_id;

      RETURN jsonb_build_object(
        'workspace_id', v_workspace_id,
        'care_recipient_id', v_care_recipient_id
      );
    END IF;
  END IF;

  -- 4. Retrieve User Profile Metadata
  SELECT email, raw_user_meta_data->>'full_name'
    INTO v_user_email, v_display_name
    FROM auth.users
   WHERE id = v_user_id;

  v_workspace_id := COALESCE(p_workspace_id, gen_random_uuid());

  -- 5. Insert Workspace
  INSERT INTO workspaces (id, name, timezone, owner_id)
  VALUES (v_workspace_id, trim(p_workspace_name), COALESCE(p_timezone, 'America/New_York'), v_user_id);

  -- 6. Insert Owner Membership
  INSERT INTO workspace_members (workspace_id, user_id, role, display_name, status)
  VALUES (
    v_workspace_id,
    v_user_id,
    'owner',
    COALESCE(v_display_name, split_part(v_user_email, '@', 1), 'Owner'),
    'active'
  );

  -- 7. Insert 1:1 Care Recipient
  INSERT INTO care_recipients (workspace_id, preferred_name)
  VALUES (v_workspace_id, trim(p_care_recipient_name))
  RETURNING id INTO v_care_recipient_id;

  -- 8. Insert 1:1 Emergency Information Container
  INSERT INTO emergency_info (workspace_id)
  VALUES (v_workspace_id)
  RETURNING id INTO v_emergency_info_id;

  -- 9. Insert Creation Audit Log to Timeline
  INSERT INTO timeline_events (workspace_id, actor_id, action, target_type, target_id, target_title)
  VALUES (v_workspace_id, v_user_id, 'created', 'workspace', v_workspace_id, trim(p_workspace_name));

  -- 10. Return Structured Result
  RETURN jsonb_build_object(
    'workspace_id', v_workspace_id,
    'care_recipient_id', v_care_recipient_id,
    'emergency_info_id', v_emergency_info_id
  );
END;
$$;

-- Restrict execution permissions
REVOKE EXECUTE ON FUNCTION create_workspace_atomic FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION create_workspace_atomic FROM anon;
GRANT EXECUTE ON FUNCTION create_workspace_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION create_workspace_atomic TO service_role;
