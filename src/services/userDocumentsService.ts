import type { PickedFile, SaveUserDocumentRequest, UserDocument } from "@/types/api";
import { apiClient, appendFilePart, MULTIPART_CONFIG, unwrap } from "@/services/client";
import { useAuthStore } from "@/store/authStore";

/**
 * `api/my-documents`: metadata lives behind the standard envelope, but the
 * bytes are served envelope-free from `{id}/file` with the bearer token.
 */
export const userDocumentsService = {
  list(): Promise<UserDocument[]> {
    return unwrap((client) => client.get<UserDocument[]>("/api/my-documents"));
  },

  getById(id: number): Promise<UserDocument> {
    return unwrap((client) =>
      client.get<UserDocument>(`/api/my-documents/${id}`),
    );
  },

  /** Multipart form: `title` + optional replacement `file`. */
  save(id: number | null, request: SaveUserDocumentRequest): Promise<UserDocument> {
    const formData = new FormData();
    formData.append("title", request.title);

    if (request.file !== undefined) {
      appendFilePart(formData, "file", request.file);
    }

    return unwrap((client) =>
      id === null
        ? client.post<UserDocument>("/api/my-documents", formData, MULTIPART_CONFIG)
        : client.put<UserDocument>(`/api/my-documents/${id}`, formData, MULTIPART_CONFIG),
    );
  },

  remove(id: number): Promise<boolean> {
    return unwrap((client) => client.delete<boolean>(`/api/my-documents/${id}`));
  },

  /** Direct file endpoint URL — requires the Authorization header. */
  buildFileUrl(id: number): string {
    return `${apiClient.defaults.baseURL}/api/my-documents/${id}/file`;
  },

  /** Bearer token for authenticated downloadAsync calls. */
  authToken(): string | null {
    return useAuthStore.getState().accessToken;
  },
};
