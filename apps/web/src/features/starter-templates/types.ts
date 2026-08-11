export interface StarterTemplate {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface StarterTemplateCategory {
  id: string;
  name: string;
  templates: StarterTemplate[];
}