import type { ContactResponse, CreateContactRequest } from "@/types/api";
import { handleApiResponse, publicApiClient } from "@/services/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export const supportService = {
  sendMessage(request: CreateContactRequest): Promise<ContactResponse> {
    return handleApiResponse(
      (client) =>
        client.post<ContactResponse>(API_ENDPOINTS.CONTACT.BASE, request),
      publicApiClient,
    );
  },
};
