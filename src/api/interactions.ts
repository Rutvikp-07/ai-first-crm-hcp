import axiosInstance from './axios';

export interface InteractionCreateInput {
  hcp_id: number;
  interaction_type?: string;
  meeting_date?: string; // YYYY-MM-DD
  attendees?: string;
  topics_discussed?: string;
  materials_shared?: string;
  sentiment?: string;
  follow_up_actions?: string;
}

export interface InteractionUpdateInput {
  hcp_id?: number;
  interaction_type?: string;
  meeting_date?: string;
  attendees?: string;
  topics_discussed?: string;
  materials_shared?: string;
  sentiment?: string;
  follow_up_actions?: string;
}

export const interactionsApi = {
  getInteractions: async (skip = 0, limit = 100) => {
    const response = await axiosInstance.get('/interactions/', {
      params: { skip, limit },
    });
    return response.data;
  },

  getInteractionById: async (id: number | string) => {
    const response = await axiosInstance.get(`/interactions/${id}`);
    return response.data;
  },

  getInteractionsByHcp: async (hcpId: number | string, skip = 0, limit = 100) => {
    const response = await axiosInstance.get(`/interactions/hcp/${hcpId}`, {
      params: { skip, limit },
    });
    return response.data;
  },

  createInteraction: async (data: InteractionCreateInput) => {
    const response = await axiosInstance.post('/interactions/', data);
    return response.data;
  },

  updateInteraction: async (id: number | string, data: InteractionUpdateInput) => {
    const response = await axiosInstance.put(`/interactions/${id}`, data);
    return response.data;
  },

  deleteInteraction: async (id: number | string) => {
    const response = await axiosInstance.delete(`/interactions/${id}`);
    return response.data;
  },
};
