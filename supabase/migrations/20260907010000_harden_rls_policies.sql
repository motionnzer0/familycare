-- Migration: 20260907010000_harden_rls_policies.sql
-- Description: Harden workspace_members insert RLS policy (SEC-01) and user_profiles select policy (SEC-06).

-- 1. SEC-01: Remove unrestricted self-insertion on workspace_members
DROP POLICY IF EXISTS "workspace_members_insert" ON workspace_members;

CREATE POLICY "workspace_members_insert" ON workspace_members
    FOR INSERT WITH CHECK (
        -- 1. Existing Owner or Coordinator can add members
        get_workspace_role(workspace_id) IN ('owner', 'coordinator')
        -- 2. Workspace Owner establishing initial membership during workspace creation
        OR EXISTS (
            SELECT 1 FROM workspaces w
            WHERE w.id = workspace_id
            AND w.owner_id = auth.uid()
        )
        -- 3. Accepting a valid, pending invitation sent to the user's verified email
        OR EXISTS (
            SELECT 1 FROM invitations i
            WHERE i.workspace_id = workspace_id
            AND i.email = (auth.jwt() ->> 'email')
            AND i.status = 'pending'
            AND i.expires_at > now()
            AND user_id = auth.uid()
        )
    );

-- 2. SEC-06: Restrict user profile selection to own profile and co-members in shared active workspaces
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;

CREATE POLICY "user_profiles_select" ON user_profiles
    FOR SELECT USING (
        auth.uid() = id
        OR EXISTS (
            SELECT 1 FROM workspace_members m1
            JOIN workspace_members m2 ON m1.workspace_id = m2.workspace_id
            WHERE m1.user_id = auth.uid()
            AND m1.status = 'active'
            AND m2.user_id = user_profiles.id
            AND m2.status = 'active'
        )
    );
