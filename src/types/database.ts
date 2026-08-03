export type UserRole = "employee" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string; // ISO timestamp
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_out: string | null; // ISO timestamp
  check_out_lat: number | null;
  check_out_lng: number | null;
  created_at: string;
}

export interface AttendanceWithProfile extends AttendanceRecord {
  profiles: {
    full_name: string;
  } | null;
}
