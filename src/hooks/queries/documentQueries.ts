import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userDocumentsService } from "@/services/userDocumentsService";
import { queryKeys } from "@/hooks/queries/queryKeys";
import type { SaveUserDocumentRequest } from "@/types/api";

interface SaveArgs {
  id: number | null;
  data: SaveUserDocumentRequest;
}

export function useMyDocuments() {
  return useQuery({
    queryKey: queryKeys.myInfo.documents(),
    queryFn: userDocumentsService.list,
  });
}

export function useMyDocument(id: number | null) {
  return useQuery({
    queryKey: queryKeys.myInfo.document(id ?? 0),
    queryFn: () => userDocumentsService.getById(id as number),
    enabled: id !== null && id > 0,
  });
}

export function useSaveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: SaveArgs) => userDocumentsService.save(id, data),
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

export function useRemoveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userDocumentsService.remove(id),
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
