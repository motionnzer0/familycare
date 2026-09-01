-- Family Care Command Center — Initial Database Migration
-- Architecture reference: /docs/DATABASE.md
-- Decisions: D-02 (1 recipient/workspace), D-17 (Role permissions), D-21 (Data lifecycle), D-23 (Emergency info)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. WORKSPACES
-- ============================================================================
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- 2. WORKSPACE MEMBERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'coordinator', 'contributor', 'viewer')),
    relationship_label TEXT,
    display_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    removed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_active_workspace_user UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- ============================================================================
-- 3. INVITATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('coordinator', 'contributor', 'viewer')),
    name TEXT,
    relationship_label TEXT,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_workspace_status ON invitations(workspace_id, status);

-- ============================================================================
-- 4. CARE RECIPIENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS care_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    preferred_name TEXT NOT NULL,
    legal_name TEXT,
    photo_path TEXT,
    birth_date DATE,
    phone TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    care_context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. TASKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date DATE,
    due_time TIME,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
    completed_by UUID REFERENCES auth.users(id),
    completed_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    related_appointment_id UUID,
    related_document_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_dashboard ON tasks(workspace_id, status, due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(workspace_id, assignee_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 6. APPOINTMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    provider_contact TEXT,
    attendees TEXT,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    related_document_id UUID,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Add foreign key back to appointment from tasks
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_related_appointment FOREIGN KEY (related_appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(workspace_id, date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(workspace_id, status) WHERE deleted_at IS NULL;

-- ============================================================================
-- 7. MEDICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    form_strength TEXT,
    instructions TEXT,
    prescriber_pharmacy TEXT,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    last_reviewed_at TIMESTAMPTZ,
    last_reviewed_by UUID REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_medications_workspace_status ON medications(workspace_id, status) WHERE deleted_at IS NULL;

-- ============================================================================
-- 8. DOCUMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    category TEXT CHECK (category IN ('medical_insurance', 'legal_financial', 'care_plan', 'identification', 'other')),
    document_date DATE,
    note TEXT,
    availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('processing', 'available', 'unavailable', 'error')),
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(workspace_id, category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(workspace_id, created_at DESC) WHERE deleted_at IS NULL;

-- Add document FKs back to tasks and appointments
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_related_document FOREIGN KEY (related_document_id) REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_related_document FOREIGN KEY (related_document_id) REFERENCES documents(id) ON DELETE SET NULL;

-- ============================================================================
-- 9. NOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT,
    body TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(workspace_id, created_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- 10. EMERGENCY INFORMATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    preferred_hospital TEXT,
    allergies_conditions TEXT,
    insurance_info TEXT,
    additional_notes TEXT,
    last_reviewed_at TIMESTAMPTZ,
    last_reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 11. EMERGENCY CONTACTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_info_id UUID NOT NULL REFERENCES emergency_info(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_workspace ON emergency_contacts(workspace_id);

-- ============================================================================
-- 12. EMERGENCY DOCUMENT LINKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_document_links (
    emergency_info_id UUID NOT NULL REFERENCES emergency_info(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (emergency_info_id, document_id)
);

-- ============================================================================
-- 13. TIMELINE EVENTS (Immutable Audit Log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    target_title TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_workspace ON timeline_events(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_filter ON timeline_events(workspace_id, target_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_actor ON timeline_events(workspace_id, actor_id, created_at DESC);

-- ============================================================================
-- 14. USER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id
        AND user_id = auth.uid()
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_workspace_role(ws_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM workspace_members
    WHERE workspace_id = ws_id
    AND user_id = auth.uid()
    AND status = 'active';
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_document_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Workspaces Policies
CREATE POLICY "workspaces_select" ON workspaces
    FOR SELECT USING (is_workspace_member(id) AND deleted_at IS NULL);

CREATE POLICY "workspaces_insert" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspaces_update" ON workspaces
    FOR UPDATE USING (get_workspace_role(id) = 'owner');

-- Workspace Members Policies
CREATE POLICY "workspace_members_select" ON workspace_members
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_insert" ON workspace_members
    FOR INSERT WITH CHECK (
        get_workspace_role(workspace_id) IN ('owner', 'coordinator')
        OR auth.uid() = user_id
    );

CREATE POLICY "workspace_members_update" ON workspace_members
    FOR UPDATE USING (get_workspace_role(workspace_id) = 'owner');

-- Invitations Policies
CREATE POLICY "invitations_select" ON invitations
    FOR SELECT USING (is_workspace_member(workspace_id) OR email = auth.jwt() ->> 'email');

CREATE POLICY "invitations_insert" ON invitations
    FOR INSERT WITH CHECK (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

CREATE POLICY "invitations_update" ON invitations
    FOR UPDATE USING (get_workspace_role(workspace_id) IN ('owner', 'coordinator') OR email = auth.jwt() ->> 'email');

-- Care Recipients Policies
CREATE POLICY "care_recipients_select" ON care_recipients
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "care_recipients_insert" ON care_recipients
    FOR INSERT WITH CHECK (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

CREATE POLICY "care_recipients_update" ON care_recipients
    FOR UPDATE USING (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

-- Tasks Policies
CREATE POLICY "tasks_select" ON tasks
    FOR SELECT USING (is_workspace_member(workspace_id) AND deleted_at IS NULL);

CREATE POLICY "tasks_insert" ON tasks
    FOR INSERT WITH CHECK (
        is_workspace_member(workspace_id)
        AND get_workspace_role(workspace_id) IN ('owner', 'coordinator', 'contributor')
    );

CREATE POLICY "tasks_update" ON tasks
    FOR UPDATE USING (
        is_workspace_member(workspace_id)
        AND (
            get_workspace_role(workspace_id) IN ('owner', 'coordinator')
            OR (get_workspace_role(workspace_id) = 'contributor' AND (created_by = auth.uid() OR assignee_id = auth.uid() OR assignee_id IS NULL))
        )
    );

-- Appointments Policies
CREATE POLICY "appointments_select" ON appointments
    FOR SELECT USING (is_workspace_member(workspace_id) AND deleted_at IS NULL);

CREATE POLICY "appointments_insert" ON appointments
    FOR INSERT WITH CHECK (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

CREATE POLICY "appointments_update" ON appointments
    FOR UPDATE USING (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

-- Medications Policies (D-17: All roles can read, Owner/Coordinator can write)
CREATE POLICY "medications_select" ON medications
    FOR SELECT USING (is_workspace_member(workspace_id) AND deleted_at IS NULL);

CREATE POLICY "medications_insert" ON medications
    FOR INSERT WITH CHECK (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

CREATE POLICY "medications_update" ON medications
    FOR UPDATE USING (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

-- Documents Policies
CREATE POLICY "documents_select" ON documents
    FOR SELECT USING (is_workspace_member(workspace_id) AND deleted_at IS NULL);

CREATE POLICY "documents_insert" ON documents
    FOR INSERT WITH CHECK (
        is_workspace_member(workspace_id)
        AND get_workspace_role(workspace_id) IN ('owner', 'coordinator', 'contributor')
    );

CREATE POLICY "documents_update" ON documents
    FOR UPDATE USING (
        get_workspace_role(workspace_id) IN ('owner', 'coordinator')
        OR (get_workspace_role(workspace_id) = 'contributor' AND uploaded_by = auth.uid())
    );

-- Notes Policies
CREATE POLICY "notes_select" ON notes
    FOR SELECT USING (is_workspace_member(workspace_id) AND deleted_at IS NULL);

CREATE POLICY "notes_insert" ON notes
    FOR INSERT WITH CHECK (
        is_workspace_member(workspace_id)
        AND get_workspace_role(workspace_id) IN ('owner', 'coordinator', 'contributor')
    );

CREATE POLICY "notes_update" ON notes
    FOR UPDATE USING (
        get_workspace_role(workspace_id) IN ('owner', 'coordinator')
        OR (get_workspace_role(workspace_id) = 'contributor' AND author_id = auth.uid())
    );

-- Emergency Info Policies
CREATE POLICY "emergency_info_select" ON emergency_info
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "emergency_info_insert" ON emergency_info
    FOR INSERT WITH CHECK (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

CREATE POLICY "emergency_info_update" ON emergency_info
    FOR UPDATE USING (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

-- Emergency Contacts Policies
CREATE POLICY "emergency_contacts_select" ON emergency_contacts
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "emergency_contacts_insert" ON emergency_contacts
    FOR INSERT WITH CHECK (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

CREATE POLICY "emergency_contacts_update" ON emergency_contacts
    FOR UPDATE USING (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

CREATE POLICY "emergency_contacts_delete" ON emergency_contacts
    FOR DELETE USING (get_workspace_role(workspace_id) IN ('owner', 'coordinator'));

-- Emergency Document Links Policies
CREATE POLICY "emergency_doc_links_select" ON emergency_document_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM emergency_info ei
            WHERE ei.id = emergency_info_id
            AND is_workspace_member(ei.workspace_id)
        )
    );

CREATE POLICY "emergency_doc_links_insert" ON emergency_document_links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM emergency_info ei
            WHERE ei.id = emergency_info_id
            AND get_workspace_role(ei.workspace_id) IN ('owner', 'coordinator')
        )
    );

CREATE POLICY "emergency_doc_links_delete" ON emergency_document_links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM emergency_info ei
            WHERE ei.id = emergency_info_id
            AND get_workspace_role(ei.workspace_id) IN ('owner', 'coordinator')
        )
    );

-- Timeline Events Policies (Append-only by service role, read-only by members)
CREATE POLICY "timeline_events_select" ON timeline_events
    FOR SELECT USING (is_workspace_member(workspace_id));

-- User Profiles Policies
CREATE POLICY "user_profiles_select" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "user_profiles_insert" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
