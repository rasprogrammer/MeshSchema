
import { apiClient } from "@/lib/apiClient";

export type Room = { id: string; name: string; isPrivate: boolean; projectId: string };

export const collabApi = {
  async getRoomId(projectId: string): Promise<string> {
    const { data } = await apiClient.get<Room>(`/collab/${projectId}/room`);
    return data.name;
  },

  async createRoom(projectId: string, data : {
    name: string;
    isPrivate: boolean;
    password?: string;
  }): Promise<string> {
    const { data: responseData } = await apiClient.post<Room>(`/collab/${projectId}/room`, data);
    return responseData.name;
  }, 

  

};