export interface Pagination {
  page: number;
  pageSize: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AiUsageContext {
  userId: string;
  projectId?: string;
}
