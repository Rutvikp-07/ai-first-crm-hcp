import axiosInstance from './axios';

export const agentApi = {
  processNotes: async (rawText: string) => {
    const response = await axiosInstance.post('/agent/', {
      raw_text: rawText,
    });
    return response.data;
  },
};
