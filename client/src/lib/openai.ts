import { apiRequest } from "./queryClient";

export interface GenerateNamesRequest {
  keywords: string[];
  category: string;
  language: string;
}

export interface GenerateNamesResponse {
  names: string[];
}

export async function generateNames(data: GenerateNamesRequest): Promise<GenerateNamesResponse> {
  try {
    // Get guest token from localStorage if it exists
    const guestToken = localStorage.getItem('guest_token');
    const options: RequestInit = {};

    if (guestToken) {
      options.headers = {
        'x-guest-token': guestToken
      };
    }

    const res = await apiRequest("POST", "/api/generate-names", data, options);
    const jsonData = await res.json();

    if (!res.ok) {
      // Handle specific error codes
      if (jsonData.code === 'GUEST_TOKEN_MISSING' || jsonData.code === 'UPGRADE_REQUIRED') {
        throw new Error(jsonData.code);
      }
      throw new Error(jsonData.error || "Failed to generate names");
    }

    if (!jsonData.names || !Array.isArray(jsonData.names)) {
      throw new Error("Invalid response format from server");
    }

    return jsonData;
  } catch (error) {
    console.error("Name generation error:", error);
    throw error instanceof Error ? error : new Error("Failed to generate names");
  }
}