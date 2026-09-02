-- Migration: 20260902150000_fix_workspaces_select_policy.sql
-- Description: Allow workspace owners and active members to select their workspace
-- Fixes chicken-and-egg RLS condition during workspace onboarding when .select() is chained.

DROP POLICY IF EXISTS "workspaces_select" ON workspaces;

CREATE POLICY "workspaces_select" ON workspaces
    FOR SELECT USING (
        (owner_id = auth.uid() OR is_workspace_member(id))
        AND deleted_at IS NULL
    );
