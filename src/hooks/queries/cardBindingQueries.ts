import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cardAddressApi,
  cardDocumentApi,
  cardEmailApi,
  cardPhoneApi,
  cardSocialMediaApi,
} from "@/services/cardBindingService";
import { queryKeys } from "@/hooks/queries/queryKeys";
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

interface UpdateArgs<TData> {
  id: number;
  data: TData;
}

/**
 * Builds the query + mutation hooks for one `api/my-card/{resource}` binding.
 * Every write invalidates all card queries: card detail responses embed the
 * bound lists, so the detail view must refresh alongside the resource list.
 */
function createCardBindingHooks<TItem, TCreate, TUpdate>(config: {
  api: {
    list(cardId: number): Promise<TItem[]>;
    create(request: TCreate): Promise<TItem>;
    update(id: number, request: TUpdate): Promise<TItem>;
    remove(id: number, cardId: number): Promise<boolean>;
  };
  listKey: (cardId: number) => readonly unknown[];
}) {
  const { api, listKey } = config;

  function useList(cardId: number | undefined) {
    return useQuery({
      queryKey: listKey(cardId ?? 0),
      queryFn: () => api.list(cardId as number),
      enabled: cardId !== undefined && cardId > 0,
    });
  }

  function useCreate(cardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (request: TCreate) => api.create(request),
      onSuccess: async (createdItem) => {
        queryClient.setQueryData<TItem[]>(listKey(cardId), (old) => {
          if (!old) return [createdItem];
          return [...old, createdItem];
        });

        await queryClient.invalidateQueries({
          queryKey: queryKeys.cards.all,
          refetchType: "all",
        });
        await queryClient.refetchQueries({
          queryKey: queryKeys.cards.all,
          type: "all",
        });
      },
    });
  }

  function useUpdate(cardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: UpdateArgs<TUpdate>) => api.update(id, data),
      onSuccess: async (updatedItem) => {
        queryClient.setQueryData<TItem[]>(listKey(cardId), (old) => {
          if (!old) return old;
          return old.map((item: any) => {
            if (item.id === (updatedItem as any).id) {
              return updatedItem;
            }
            if ((updatedItem as any).isPrimary && item.isPrimary) {
              return { ...item, isPrimary: false };
            }
            return item;
          });
        });

        await queryClient.invalidateQueries({
          queryKey: queryKeys.cards.all,
          refetchType: "all",
        });
        await queryClient.refetchQueries({
          queryKey: queryKeys.cards.all,
          type: "all",
        });
      },
    });
  }

  function useRemove(cardId: number) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id }: { id: number }) => api.remove(id, cardId),
      onSuccess: async (_, { id }) => {
        queryClient.setQueryData<TItem[]>(listKey(cardId), (old) => {
          if (!old) return old;
          return old.filter((item: any) => item.id !== id);
        });

        await queryClient.invalidateQueries({
          queryKey: queryKeys.cards.all,
          refetchType: "all",
        });
        await queryClient.refetchQueries({
          queryKey: queryKeys.cards.all,
          type: "all",
        });
      },
    });
  }

  return { useList, useCreate, useUpdate, useRemove };
}

export const cardPhoneHooks = createCardBindingHooks<
  CardPhone,
  CreateCardPhoneRequest,
  UpdateCardPhoneRequest
>({ api: cardPhoneApi, listKey: queryKeys.cards.phones });

export const cardEmailHooks = createCardBindingHooks<
  CardEmail,
  CreateCardEmailRequest,
  UpdateCardEmailRequest
>({ api: cardEmailApi, listKey: queryKeys.cards.emails });

export const cardAddressHooks = createCardBindingHooks<
  CardAddress,
  CreateCardAddressRequest,
  UpdateCardAddressRequest
>({ api: cardAddressApi, listKey: queryKeys.cards.addresses });

export const cardSocialMediaHooks = createCardBindingHooks<
  CardSocialMedia,
  CreateCardSocialMediaRequest,
  UpdateCardSocialMediaRequest
>({ api: cardSocialMediaApi, listKey: queryKeys.cards.socialMedias });

export const cardDocumentHooks = createCardBindingHooks<
  CardDocument,
  SaveCardDocumentRequest,
  SaveCardDocumentRequest
>({ api: cardDocumentApi, listKey: queryKeys.cards.documents });
