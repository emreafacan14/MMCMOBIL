import type { SocialMediaPlatform } from "@/types/api";
import { unwrap } from "@/services/client";

export const platformService = {
  getAll(): Promise<SocialMediaPlatform[]> {
    return unwrap((client) =>
      client.get<SocialMediaPlatform[]>("/api/social-media-platforms"),
    );
  },
};
