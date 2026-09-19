import type {
  CardAddress,
  CardDocument,
  CardEmail,
  CardPhone,
  CardSocialMedia,
  CreateCardAddressRequest,
  CreateCardEmailRequest,
  CreateCardPhoneRequest,
  CreateCardSocialMediaRequest,
  SaveCardDocumentRequest,
  UpdateCardAddressRequest,
  UpdateCardEmailRequest,
  UpdateCardPhoneRequest,
  UpdateCardSocialMediaRequest,
} from "@/types/api";
import { handleApiResponse } from "@/services/client";
import { API_CONTROLLERS } from "@/constants/apiEndpoints";

/**
 * The five `api/my-card/*` sub-resources share one shape:
 * GET    /api/my-card/{resource}?cardId={cardId}
 * POST   /api/my-card/{resource}          (cardId inside body)
 * PUT    /api/my-card/{resource}/{id}     (cardId inside body)
 * DELETE /api/my-card/{resource}/{id}?cardId={cardId}
 */
function createCardBindingApi<
  TItem,
  TCreate,
  TUpdate,
>(resource: string, deleteUsesCardId = true) {
  const basePath = `${API_CONTROLLERS.MY_CARD}/${resource}`;

  return {
    list(cardId: number): Promise<TItem[]> {
      return handleApiResponse((client) =>
        client.get<TItem[]>(basePath, { params: { cardId } }),
      );
    },

    create(request: TCreate): Promise<TItem> {
      return handleApiResponse((client) => client.post<TItem>(basePath, request));
    },

    update(id: number, request: TUpdate): Promise<TItem> {
      return handleApiResponse((client) =>
        client.put<TItem>(`${basePath}/${id}`, request),
      );
    },

    remove(id: number, cardId: number): Promise<boolean> {
      return handleApiResponse((client) =>
        client.delete<boolean>(
          `${basePath}/${id}`,
          deleteUsesCardId ? { params: { cardId } } : undefined,
        ),
      );
    },
  };
}

export const cardPhoneApi = createCardBindingApi<
  CardPhone,
  CreateCardPhoneRequest,
  UpdateCardPhoneRequest
>("phones");

export const cardEmailApi = createCardBindingApi<
  CardEmail,
  CreateCardEmailRequest,
  UpdateCardEmailRequest
>("emails");

export const cardAddressApi = createCardBindingApi<
  CardAddress,
  CreateCardAddressRequest,
  UpdateCardAddressRequest
>("addresses");

export const cardSocialMediaApi = createCardBindingApi<
  CardSocialMedia,
  CreateCardSocialMediaRequest,
  UpdateCardSocialMediaRequest
>("social-medias");

/**
 * Card documents bind an existing my-document to a card (no file bytes).
 * Create/update share one body shape. Unlike the other bindings, document
 * delete identifies ownership from the binding itself and takes no `cardId`.
 */
export const cardDocumentApi = createCardBindingApi<
  CardDocument,
  SaveCardDocumentRequest,
  SaveCardDocumentRequest
>("documents", false);
