export interface CreateStarterProjectPayload {
  templateId: string;
  name: string;
  description?: string;
}

export interface CreateStarterProjectResponse {
  id: string;
  name: string;
}

export interface StarterTemplateResponse {
  id: string;
  name: string;
  description?: string;
  image?: string;
}