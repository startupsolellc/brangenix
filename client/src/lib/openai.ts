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
    const res = await apiRequest("POST", "/api/generate-names", data);
    const jsonData = await res.json();

    if (!res.ok) {
      // If the server returned an error response
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