import type { ContactResponse, CreateContactRequest } from "@/types/api";
import { unwrap } from "@/services/client";

export const supportService = {
  sendMessage(request: CreateContactRequest): Promise<ContactResponse> {
    return unwrap((client) => client.post<ContactResponse>("/api/contact", request));
  },
};
