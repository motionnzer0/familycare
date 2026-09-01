// Family Care Command Center — Core Domain Types
// Reference: /docs/DATABASE.md and /docs/PERMISSIONS.md

export type Role = "owner" | "coordinator" | "contributor" | "viewer";
export type MemberStatus = "active" | "removed";
export type InvitationStatus = "pending" | "accepted" | "cancelled" | "expired";
export type TaskStatus = "open" | "completed";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled";
export type MedicationStatus = "active" | "paused" | "discontinued" | "archived";
export type DocumentCategory =
  | "Insurance"
  | "Medical"
  | "Legal"
  | "Financial"
  | "Identification"
  | "Other"
  | "medical_insurance"
  | "legal_financial"
  | "care_plan"
  | "other";

export type DocumentAvailability = "processing" | "available" | "unavailable" | "error";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "complete"
  | "assign"
  | "invite"
  | "upload"
  | "archive"
  | "review";

export type Resource =
  | "task"
  | "appointment"
  | "medication"
  | "document"
  | "note"
  | "emergency"
  | "member"
  | "workspace"
  | "care_recipient";

export interface Workspace {
  id: string;
  name: string;
  timezone: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: Role;
  relationship_label?: string | null;
  display_name: string | null;
  status: MemberStatus;
  joined_at: string;
  removed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: Role;
  invited_by: string;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
  accepted_at?: string | null;
}

export interface CareRecipient {
  id: string;
  workspace_id: string;
  preferred_name: string;
  legal_name?: string | null;
  photo_path?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  care_context?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  due_date: string | null;
  due_time: string | null;
  status: TaskStatus;
  completed_by: string | null;
  completed_at: string | null;
  created_by: string;
  related_appointment_id: string | null;
  related_document_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Appointment {
  id: string;
  workspace_id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  provider_contact: string | null;
  attendees: string | null;
  details: string | null;
  status: AppointmentStatus;
  related_task_id: string | null;
  related_document_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Medication {
  id: string;
  workspace_id: string;
  name: string;
  dosage?: string | null;
  form_strength?: string | null;
  instructions?: string | null;
  frequency?: string | null;
  schedule?: string | null;
  prescribing_provider?: string | null;
  prescriber_pharmacy?: string | null;
  notes?: string | null;
  note?: string | null;
  status: MedicationStatus;
  start_date?: string | null;
  end_date?: string | null;
  last_reviewed_at?: string | null;
  last_reviewed_by?: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Document {
  id: string;
  workspace_id: string;
  title: string;
  file_path: string;
  file_name?: string;
  file_size: number;
  mime_type: string;
  category: string;
  is_emergency_access?: boolean;
  notes?: string | null;
  note?: string | null;
  document_date?: string | null;
  availability?: DocumentAvailability;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Note {
  id: string;
  workspace_id: string;
  title: string | null;
  body: string;
  category?: string;
  related_appointment_id?: string | null;
  related_task_id?: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EmergencyInfo {
  id: string;
  workspace_id: string;
  preferred_hospital: string | null;
  allergies_conditions: string | null;
  insurance_info: string | null;
  additional_notes: string | null;
  last_reviewed_at: string | null;
  last_reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  emergency_info_id: string;
  workspace_id: string;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  workspace_id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  target_title: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
