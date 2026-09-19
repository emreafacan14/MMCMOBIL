import type {
  ActivateCardRequest,
  CardSummary,
  MyCardDetail,
  PickedFile,
} from "@/types/api";
import { appendFilePart, handleApiResponse, MULTIPART_CONFIG } from "@/services/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export const cardService = {
  getMyCards(): Promise<CardSummary[]> {
    return handleApiResponse((client) =>
      client.get<CardSummary[]>(API_ENDPOINTS.MY_CARD.BASE),
    );
  },

  getMyCardDetail(cardId: number): Promise<MyCardDetail> {
    return handleApiResponse((client) =>
      client.get<MyCardDetail>(API_ENDPOINTS.MY_CARD.BY_ID(cardId)),
    );
  },

  activateCard(request: ActivateCardRequest): Promise<CardSummary> {
    return handleApiResponse((client) =>
      client.post<CardSummary>(API_ENDPOINTS.MY_CARD.ACTIVATE, request),
    );
  },

  /** Multipart `cardId` + `file`; answers a plain bool on success. */
  updateCardProfileImage(cardId: number, file: PickedFile): Promise<boolean> {
    const formData = new FormData();
    formData.append("cardId", String(cardId));
    appendFilePart(formData, "file", file);

    return handleApiResponse((client) =>
      client.put<boolean>(
        API_ENDPOINTS.MY_CARD.PROFILE_IMAGE,
        formData,
        MULTIPART_CONFIG,
      ),
    );
  },
};
