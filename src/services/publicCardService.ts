import { handleApiResponse, publicApiClient } from "@/services/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { PublicCard } from "@/types/api";

export const publicCardService = {
  getPublicCard(urlKey: string): Promise<PublicCard> {
    return handleApiResponse(
      (client) =>
        client.get<PublicCard>(API_ENDPOINTS.PUBLIC_CARDS.BY_URL_KEY(urlKey)),
      publicApiClient,
    );
  },

  /** Public web card URL (used for NFC tags, QR codes, and sharing link). */
  buildPublicWebUrl(urlKey: string): string {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || "https://mmcard.rascal.com.tr";
    return `${baseUrl}/card/${encodeURIComponent(urlKey)}`;
  },

  /** Direct VCF endpoint URL (public, no auth header needed). */
  buildVcfUrl(urlKey: string): string {
    const baseUrl = publicApiClient.defaults.baseURL || "";
    return `${baseUrl}${API_ENDPOINTS.PUBLIC_CARDS.VCF(urlKey)}`;
  },

  /** Direct public document endpoint; the response is raw file bytes. */
  buildDocumentUrl(urlKey: string, cardDocumentId: number): string {
    const baseUrl = publicApiClient.defaults.baseURL || "";
    return `${baseUrl}${API_ENDPOINTS.PUBLIC_CARDS.DOCUMENT(urlKey, cardDocumentId)}`;
  },
};
