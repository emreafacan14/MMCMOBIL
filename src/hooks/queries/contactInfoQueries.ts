import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  userAddressApi,
  userEmailApi,
  userPhoneApi,
  userSocialMediaApi,
} from "@/services/contactInfoService";
import { queryKeys } from "@/hooks/queries/queryKeys";
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

interface SaveArgs<TData> {
  id: number | null;
  data: TData;
}

/**
 * Builds hooks for one `api/my-{resource}` contact-info list.
 * Writes invalidate the resource list plus every card query, because cards
 * resolve their content from these records at read time.
 */
function createContactInfoHooks<TItem, TSave>(config: {
  api: {
    list(): Promise<TItem[]>;
    create(request: TSave): Promise<TItem>;
    update(id: number, request: TSave): Promise<TItem>;
    remove(id: number): Promise<boolean>;
  };
  listKey: () => readonly unknown[];
}) {
  const { api, listKey } = config;

  function useList() {
    return useQuery({ queryKey: listKey(), queryFn: api.list });
  }

  function useSave() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: SaveArgs<TSave>) =>
        id === null ? api.create(data) : api.update(id, data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.myInfo.all,
          refetchType: "all",
        });
        await queryClient.refetchQueries({
          queryKey: queryKeys.myInfo.all,
          type: "all",
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

  function useRemove() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: number) => api.remove(id),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.myInfo.all,
          refetchType: "all",
        });
        await queryClient.refetchQueries({
          queryKey: queryKeys.myInfo.all,
          type: "all",
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

  return { useList, useSave, useRemove };
}

export const userPhoneHooks = createContactInfoHooks<
  UserPhone,
  SaveUserPhoneRequest
>({ api: userPhoneApi, listKey: queryKeys.myInfo.phones });

export const userEmailHooks = createContactInfoHooks<
  UserEmail,
  SaveUserEmailRequest
>({ api: userEmailApi, listKey: queryKeys.myInfo.emails });

export const userAddressHooks = createContactInfoHooks<
  UserAddress,
  SaveUserAddressRequest
>({ api: userAddressApi, listKey: queryKeys.myInfo.addresses });

export const userSocialMediaHooks = createContactInfoHooks<
  UserSocialMedia,
  SaveUserSocialMediaRequest
>({ api: userSocialMediaApi, listKey: queryKeys.myInfo.socialMedias });
