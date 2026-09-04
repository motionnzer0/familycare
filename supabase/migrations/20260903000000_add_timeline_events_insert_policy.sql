-- Migration: 20260903000000_add_timeline_events_insert_policy.sql
-- Description: Allow active workspace members to append timeline events attributed to themselves.
-- Maintains immutable append-only audit trail (zero UPDATE or DELETE policies for application users).

CREATE POLICY "timeline_events_insert" ON timeline_events
    FOR INSERT WITH CHECK (
        is_workspace_member(workspace_id)
        AND auth.uid() = actor_id
    );
