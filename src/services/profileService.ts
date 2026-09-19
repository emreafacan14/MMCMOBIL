import type {
  MyProfile,
  PickedFile,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from "@/types/api";
import { appendFilePart, MULTIPART_CONFIG, unwrap } from "@/services/client";

export const profileService = {
  getMyProfile(): Promise<MyProfile> {
    return unwrap((client) => client.get<MyProfile>("/api/my-profile"));
  },

  updateMyProfile(request: UpdateMyProfileRequest): Promise<UpdateMyProfileResponse> {
    return unwrap((client) => client.put<UpdateMyProfileResponse>("/api/my-profile", request));
  },

  /** Multipart `file` upload; the endpoint answers a plain bool on success. */
  updateProfileImage(file: PickedFile): Promise<boolean> {
    const formData = new FormData();
    appendFilePart(formData, "file", file);

    return unwrap((client) =>
      client.put<boolean>("/api/my-profile/profile-image", formData, MULTIPART_CONFIG),
    );
  },
};
