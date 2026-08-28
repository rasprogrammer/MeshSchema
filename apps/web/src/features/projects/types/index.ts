export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
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
  isPrivate: boolean;
  password?: string;
}
