import type {
  SaveUserAddressRequest,
  SaveUserEmailRequest,
  SaveUserPhoneRequest,
  SaveUserSocialMediaRequest,
  UserAddress,
  UserEmail,
  UserPhone,
  UserSocialMedia,
} from "@/types/api";
import { handleApiResponse } from "@/services/client";
import { API_CONTROLLERS } from "@/constants/apiEndpoints";

/**
 * Phone, e-mail and social-media resources share one shape:
 * GET    /api/my-{resource}
 * GET    /api/my-{resource}/{id}
 * POST   /api/my-{resource}
 * PUT    /api/my-{resource}/{id}
 * DELETE /api/my-{resource}/{id}
 * Addresses do not expose GET-by-id in the backend and are defined separately.
 */
function createContactInfoApi<TItem, TSave>(basePath: string) {
  return {
    list(): Promise<TItem[]> {
      return handleApiResponse((client) => client.get<TItem[]>(basePath));
    },

    getById(id: number): Promise<TItem> {
      return handleApiResponse((client) => client.get<TItem>(`${basePath}/${id}`));
    },

    create(request: TSave): Promise<TItem> {
      return handleApiResponse((client) => client.post<TItem>(basePath, request));
    },

    update(id: number, request: TSave): Promise<TItem> {
      return handleApiResponse((client) =>
        client.put<TItem>(`${basePath}/${id}`, request),
      );
    },

    remove(id: number): Promise<boolean> {
      return handleApiResponse((client) => client.delete<boolean>(`${basePath}/${id}`));
    },
  };
}

export const userPhoneApi = createContactInfoApi<UserPhone, SaveUserPhoneRequest>(
  API_CONTROLLERS.MY_PHONES,
);

export const userEmailApi = createContactInfoApi<UserEmail, SaveUserEmailRequest>(
  API_CONTROLLERS.MY_EMAILS,
);

export const userAddressApi =
  (() => {
    const basePath = API_CONTROLLERS.MY_ADDRESSES;

    return {
      list(): Promise<UserAddress[]> {
        return handleApiResponse((client) => client.get<UserAddress[]>(basePath));
      },

      create(request: SaveUserAddressRequest): Promise<UserAddress> {
        return handleApiResponse((client) => client.post<UserAddress>(basePath, request));
      },

      update(id: number, request: SaveUserAddressRequest): Promise<UserAddress> {
        return handleApiResponse((client) =>
          client.put<UserAddress>(`${basePath}/${id}`, request),
        );
      },

      remove(id: number): Promise<boolean> {
        return handleApiResponse((client) => client.delete<boolean>(`${basePath}/${id}`));
      },
    };
  })();

export const userSocialMediaApi =
  createContactInfoApi<UserSocialMedia, SaveUserSocialMediaRequest>(
    API_CONTROLLERS.MY_SOCIAL_MEDIAS,
  );
