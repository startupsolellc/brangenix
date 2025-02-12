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
  const res = await apiRequest("POST", "/api/generate-names", data);
  return res.json();
}
