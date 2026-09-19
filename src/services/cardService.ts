import type {
  ActivateCardRequest,
  CardSummary,
  MyCardDetail,
  PickedFile,
} from "@/types/api";
import { appendFilePart, MULTIPART_CONFIG, unwrap } from "@/services/client";

export const cardService = {
  getMyCards(): Promise<CardSummary[]> {
    return unwrap((client) => client.get<CardSummary[]>("/api/my-card"));
  },

  getMyCardDetail(cardId: number): Promise<MyCardDetail> {
    return unwrap((client) =>
      client.get<MyCardDetail>(`/api/my-card/${cardId}`),
    );
  },

  activateCard(request: ActivateCardRequest): Promise<CardSummary> {
    return unwrap((client) =>
      client.post<CardSummary>("/api/my-card/activate", request),
    );
  },

  /** Multipart `cardId` + `file`; answers a plain bool on success. */
  updateCardProfileImage(cardId: number, file: PickedFile): Promise<boolean> {
    const formData = new FormData();
    formData.append("cardId", String(cardId));
    appendFilePart(formData, "file", file);

    return unwrap((client) =>
      client.put<boolean>("/api/my-card/profile-image", formData, MULTIPART_CONFIG),
    );
  },
};
