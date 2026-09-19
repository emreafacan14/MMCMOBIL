import type {
  MyProfile,
  PickedFile,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from "@/types/api";
import { appendFilePart, handleApiResponse, MULTIPART_CONFIG } from "@/services/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export const profileService = {
  getMyProfile(): Promise<MyProfile> {
    return handleApiResponse((client) =>
      client.get<MyProfile>(API_ENDPOINTS.MY_PROFILE.BASE),
    );
  },

  updateMyProfile(request: UpdateMyProfileRequest): Promise<UpdateMyProfileResponse> {
    return handleApiResponse((client) =>
      client.put<UpdateMyProfileResponse>(API_ENDPOINTS.MY_PROFILE.BASE, request),
    );
  },

  /** Multipart `file` upload; the endpoint answers a plain bool on success. */
  updateProfileImage(file: PickedFile): Promise<boolean> {
    const formData = new FormData();
    appendFilePart(formData, "file", file);

    return handleApiResponse((client) =>
      client.put<boolean>(
        API_ENDPOINTS.MY_PROFILE.PROFILE_IMAGE,
        formData,
        MULTIPART_CONFIG,
      ),
    );
  },
};
