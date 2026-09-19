import type { SocialMediaPlatform } from "@/types/api";
import { handleApiResponse } from "@/services/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export const platformService = {
  getAll(): Promise<SocialMediaPlatform[]> {
    return handleApiResponse((client) =>
      client.get<SocialMediaPlatform[]>(
        API_ENDPOINTS.SOCIAL_MEDIA_PLATFORMS.BASE,
      ),
    );
  },
};
