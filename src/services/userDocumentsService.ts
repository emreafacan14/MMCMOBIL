import type { PickedFile, SaveUserDocumentRequest, UserDocument } from "@/types/api";
import { apiClient, appendFilePart, handleApiResponse, MULTIPART_CONFIG } from "@/services/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { useAuthStore } from "@/store/authStore";

/**
 * `api/my-documents`: metadata lives behind the standard envelope, but the
 * bytes are served envelope-free from `{id}/file` with the bearer token.
 */
export const userDocumentsService = {
  list(): Promise<UserDocument[]> {
    return handleApiResponse((client) =>
      client.get<UserDocument[]>(API_ENDPOINTS.MY_DOCUMENTS.BASE),
    );
  },

  getById(id: number): Promise<UserDocument> {
    return handleApiResponse((client) =>
      client.get<UserDocument>(API_ENDPOINTS.MY_DOCUMENTS.BY_ID(id)),
    );
  },

  /** Multipart form: `title` + optional replacement `file`. */
  save(id: number | null, request: SaveUserDocumentRequest): Promise<UserDocument> {
    const formData = new FormData();
    formData.append("title", request.title);

    if (request.file !== undefined) {
      appendFilePart(formData, "file", request.file);
    }

    return handleApiResponse((client) =>
      id === null
        ? client.post<UserDocument>(
            API_ENDPOINTS.MY_DOCUMENTS.BASE,
            formData,
            MULTIPART_CONFIG,
          )
        : client.put<UserDocument>(
            API_ENDPOINTS.MY_DOCUMENTS.BY_ID(id),
            formData,
            MULTIPART_CONFIG,
          ),
    );
  },

  remove(id: number): Promise<boolean> {
    return handleApiResponse((client) =>
      client.delete<boolean>(API_ENDPOINTS.MY_DOCUMENTS.BY_ID(id)),
    );
  },

  /** Direct file endpoint URL — requires the Authorization header. */
  buildFileUrl(id: number): string {
    const baseUrl = apiClient.defaults.baseURL || "";
    return `${baseUrl}${API_ENDPOINTS.MY_DOCUMENTS.FILE(id)}`;
  },

  /** Bearer token for authenticated downloadAsync calls. */
  authToken(): string | null {
    return useAuthStore.getState().accessToken;
  },
};
