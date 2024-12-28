import api from './api';

export interface APIKeyRequest {
  email: string;
  full_name: string;
  application_name: string;
  organization: string;
  phone_number: string;
}

export interface APIKeyResponse {
  api_key: string;
  full_name: string;
  application_name: string;
  organization: string;
  email: string;
  phone_number: string;
}

export const apiKeyService = {
  generateApiKey: async (request: APIKeyRequest): Promise<APIKeyResponse> => {
    try {
      const { data } = await api.post<APIKeyResponse>(
        '/internal/generate-api-key/',
        request
      );
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.detail || "Failed to generate API key");
      }
      throw new Error("Failed to generate API key");
    }
  },
};