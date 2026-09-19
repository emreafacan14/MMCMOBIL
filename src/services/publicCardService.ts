import { apiClient, unwrap } from "@/services/client";
import type { PublicCard } from "@/types/api";

export const publicCardService = {
  getPublicCard(urlKey: string): Promise<PublicCard> {
    const encodedUrlKey = encodeURIComponent(urlKey);

    return unwrap((client) =>
      client.get<PublicCard>(`/api/public/cards/${encodedUrlKey}`),
    );
  },

  /** Public web card URL (used for NFC tags, QR codes, and sharing link). */
  buildPublicWebUrl(urlKey: string): string {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || "https://mmcard.rascal.com.tr";
    return `${baseUrl}/card/${encodeURIComponent(urlKey)}`;
  },

  /** Direct VCF endpoint URL (public, no auth header needed). */
  buildVcfUrl(urlKey: string): string {
    return `${apiClient.defaults.baseURL}/api/public/cards/${encodeURIComponent(urlKey)}/vcf`;
  },

  /** Direct public document endpoint; the response is raw file bytes. */
  buildDocumentUrl(urlKey: string, cardDocumentId: number): string {
    return `${apiClient.defaults.baseURL}/api/public/cards/${encodeURIComponent(urlKey)}/documents/${cardDocumentId}`;
  },
};
