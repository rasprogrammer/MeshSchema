export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isFavorite?: boolean;
  role?: "OWNER" | "EDITOR" | "VIEWER";
}

export interface ProjectListOptions {
  search?: string;
  sort?: "name" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
  favorite?: boolean;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  isPrivate: boolean;
  password?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  password?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  joinedAt: string;
  user: { id: string; name: string; email: string; avatarUrl?: string | null };
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  role: "EDITOR" | "VIEWER";
  token: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  expiresAt: string;
  createdAt: string;
}

export interface CreateInvitePayload {
  email: string;
  role: "EDITOR" | "VIEWER";
}
