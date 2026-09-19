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
import { unwrap } from "@/services/client";

/**
 * Phone, e-mail and social-media resources share one shape:
 * GET    /api/my-{resource}
 * GET    /api/my-{resource}/{id}
 * POST   /api/my-{resource}
 * PUT    /api/my-{resource}/{id}
 * DELETE /api/my-{resource}/{id}
 * Addresses do not expose GET-by-id in the backend and are defined separately.
 */
function createContactInfoApi<TItem, TSave>(resource: string) {
  const basePath = `/api/my-${resource}`;

  return {
    list(): Promise<TItem[]> {
      return unwrap((client) => client.get<TItem[]>(basePath));
    },

    getById(id: number): Promise<TItem> {
      return unwrap((client) => client.get<TItem>(`${basePath}/${id}`));
    },

    create(request: TSave): Promise<TItem> {
      return unwrap((client) => client.post<TItem>(basePath, request));
    },

    update(id: number, request: TSave): Promise<TItem> {
      return unwrap((client) =>
        client.put<TItem>(`${basePath}/${id}`, request),
      );
    },

    remove(id: number): Promise<boolean> {
      return unwrap((client) => client.delete<boolean>(`${basePath}/${id}`));
    },
  };
}

export const userPhoneApi = createContactInfoApi<UserPhone, SaveUserPhoneRequest>(
  "phones",
);

export const userEmailApi = createContactInfoApi<UserEmail, SaveUserEmailRequest>(
  "emails",
);

export const userAddressApi =
  (() => {
    const basePath = "/api/my-addresses";

    return {
      list(): Promise<UserAddress[]> {
        return unwrap((client) => client.get<UserAddress[]>(basePath));
      },

      create(request: SaveUserAddressRequest): Promise<UserAddress> {
        return unwrap((client) => client.post<UserAddress>(basePath, request));
      },

      update(id: number, request: SaveUserAddressRequest): Promise<UserAddress> {
        return unwrap((client) =>
          client.put<UserAddress>(`${basePath}/${id}`, request),
        );
      },

      remove(id: number): Promise<boolean> {
        return unwrap((client) => client.delete<boolean>(`${basePath}/${id}`));
      },
    };
  })();

export const userSocialMediaApi =
  createContactInfoApi<UserSocialMedia, SaveUserSocialMediaRequest>(
    "social-medias",
  );
