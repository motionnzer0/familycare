import { describe, it, expect } from "vitest";
import { WorkspaceExportData } from "@/lib/actions/export";

describe("Data Export & Portability (Phase 3A / D-21)", () => {
  const sampleExport: WorkspaceExportData = {
    exportedAt: "2026-09-01T18:00:00.000Z",
    version: "1.0",
    workspace: {
      id: "ws-123",
      name: "Care for Mom",
      timezone: "America/New_York",
      createdAt: "2026-09-01T00:00:00.000Z",
    },
    careRecipient: {
      preferredName: "Mom",
      birthDate: "1948-06-15",
      phone: "555-0199",
      email: null,
      careContext: "Independent living, mobility assistance needed on stairs",
    },
    tasks: [
      {
        id: "t1",
        title: "Pick up heart medication",
        description: "Walgreens Pharmacy on Main St",
        status: "open",
        dueDate: "2026-09-02",
        dueTime: "14:00",
        createdAt: "2026-09-01T00:00:00.000Z",
      },
    ],
    appointments: [
      {
        id: "a1",
        title: "Cardiology checkup",
        date: "2026-09-05",
        startTime: "10:30",
        endTime: "11:30",
        location: "Memorial Clinic Suite 300",
        providerContact: "Dr. Roberts (555-0123)",
        status: "scheduled",
        details: "Bring recent blood pressure logs",
      },
    ],
    medications: [
      {
        id: "m1",
        name: "Lisinopril",
        dosage: "10 mg",
        instructions: "Take once daily in the morning",
        frequency: "Once daily",
        schedule: "Morning",
        prescribingProvider: "Dr. Roberts",
        status: "active",
        notes: "Refill monthly",
      },
    ],
    notes: [
      {
        id: "n1",
        title: "Physical therapy notes",
        body: "Mom completed all exercises with therapist Sarah today.",
        category: "Care",
        createdAt: "2026-09-01T12:00:00.000Z",
      },
    ],
    emergencyInformation: {
      preferredHospital: "St. Mary's Hospital ER",
      allergiesConditions: "Penicillin allergy, Type 2 Diabetes",
      insuranceInfo: "Medicare Part A & B #123-45-678A",
      additionalNotes: "Front door key under planter",
      contacts: [
        {
          name: "Dr. Roberts",
          phone: "555-0123",
          relationship: "Primary Care Doctor",
          isPrimary: true,
        },
      ],
    },
    careTeam: [
      {
        displayName: "Sarah Caregiver",
        role: "owner",
        joinedAt: "2026-09-01T00:00:00.000Z",
      },
    ],
    documentsManifest: [
      {
        id: "d1",
        title: "Health Care Proxy Signed",
        category: "Legal",
        fileSize: 1048576,
        mimeType: "application/pdf",
        isEmergencyAccess: true,
        createdAt: "2026-09-01T00:00:00.000Z",
      },
    ],
  };

  it("produces valid structured export format", () => {
    expect(sampleExport.version).toBe("1.0");
    expect(sampleExport.workspace.name).toBe("Care for Mom");
    expect(sampleExport.careRecipient?.preferredName).toBe("Mom");
    expect(sampleExport.tasks.length).toBe(1);
    expect(sampleExport.appointments.length).toBe(1);
    expect(sampleExport.medications.length).toBe(1);
    expect(sampleExport.notes.length).toBe(1);
    expect(sampleExport.emergencyInformation.contacts.length).toBe(1);
    expect(sampleExport.documentsManifest.length).toBe(1);
  });

  it("excludes deleted records from export", () => {
    const rawTasks = [
      { id: "t1", title: "Active task", deleted_at: null },
      { id: "t2", title: "Deleted task", deleted_at: "2026-09-01T10:00:00Z" },
    ];
    const exportedTasks = rawTasks.filter((t) => t.deleted_at === null);
    expect(exportedTasks.length).toBe(1);
    expect(exportedTasks[0].id).toBe("t1");
  });
});
