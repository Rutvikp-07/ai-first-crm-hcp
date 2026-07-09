import axiosInstance from './axios';

export interface HCPCreateInput {
  name: string;
  specialization: string;
  hospital: string;
  city?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface HCPUpdateInput {
  name?: string;
  specialization?: string;
  hospital?: string;
  city?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export const hcpsApi = {
  getHcps: async (skip = 0, limit = 100) => {
    const response = await axiosInstance.get('/hcps/', {
      params: { skip, limit },
    });
    return response.data;
  },

  getHcpById: async (id: number | string) => {
    const response = await axiosInstance.get(`/hcps/${id}`);
    return response.data;
  },

  createHcp: async (data: HCPCreateInput) => {
    const response = await axiosInstance.post('/hcps/', data);
    return response.data;
  },

  updateHcp: async (id: number | string, data: HCPUpdateInput) => {
    const response = await axiosInstance.put(`/hcps/${id}`, data);
    return response.data;
  },

  deleteHcp: async (id: number | string) => {
    const response = await axiosInstance.delete(`/hcps/${id}`);
    return response.data;
  },
};
