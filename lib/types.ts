export type Role = "patient" | "admin" | "mainlab";

export type RequestStatus =
  | "pending"       // patient submitted, waiting for admin
  | "forwarded"     // admin forwarded to main lab
  | "report_ready"  // main lab uploaded report, waiting admin release
  | "delivered"     // admin released to patient
  | "rejected";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export interface TestItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string; // e.g. "24h"
}

export interface LabRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  testId: string;
  testName: string;
  price: number;
  status: RequestStatus;
  notes: string;
  createdAt: string;
  forwardedAt?: string;
  reportReadyAt?: string;
  releasedAt?: string;
  reportDataUrl?: string;   // base64 data URL of the uploaded file
  reportFileName?: string;
  reportMime?: string;
  labNotes?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}