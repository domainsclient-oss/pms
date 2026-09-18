export type ProjectStatus = "Development" | "Testing" | "Live" | "Maintenance" | "Completed";
export type ProjectType = "Website" | "Web Application" | "E-commerce" | "WordPress" | "Shopify" | "Other";
export type UserRole = "Admin" | "Staff" | "Viewer";

export interface ServiceCredentials {
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  launchDate: string;
  description: string;
  owner: string;
  website: ServiceCredentials & { adminUrl?: string };
  vercel: ServiceCredentials;
  github: ServiceCredentials;
  gmail: ServiceCredentials;
  resend: ServiceCredentials & { apiKey?: string };
  hosting: ServiceCredentials & {
    provider?: string;
    plan?: string;
    serverIp?: string;
    serverType?: string;
    renewalDate?: string;
    ftpUsername?: string;
    ftpPort?: string;
    sshUsername?: string;
    sshPort?: string;
  };
  cpanel: ServiceCredentials;
  webmail: ServiceCredentials;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Invited";
  createdDate: string;
  lastLogin: string;
}
