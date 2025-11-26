export interface AppUser {
  name: string;
  email: string;
  avatar_url?: string | null;
  phone?: string | null;
  company?: string | null;
  job_title?: string | null;
  location?: string | null;
  bio?: string | null;
  language?: string | null;
  timezone?: string | null;
  date_format?: string | null;
}
