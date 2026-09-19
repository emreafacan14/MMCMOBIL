import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cardService } from "@/services/cardService";
import { queryKeys } from "@/hooks/queries/queryKeys";
import type { ActivateCardRequest, PickedFile } from "@/types/api";

export function useMyCards() {
  return useQuery({
    queryKey: queryKeys.cards.list(),
    queryFn: cardService.getMyCards,
  });
}

export function useMyCardDetail(cardId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.cards.detail(cardId ?? 0),
    queryFn: () => {
      if (cardId === undefined || cardId <= 0) {
        throw new Error("useMyCardDetail requires a valid cardId");
      }

      return cardService.getMyCardDetail(cardId);
    },
    enabled: cardId !== undefined && cardId > 0,
  });
}

export function useActivateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ActivateCardRequest) =>
      cardService.activateCard(request),
    onSuccess: async (activatedCard) => {
      queryClient.setQueryData(
        queryKeys.cards.detail(activatedCard.id),
        activatedCard,
      );
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

/** Card photo upload — the image shows up in card lists and public cards. */
export function useUpdateCardProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, file }: { cardId: number; file: PickedFile }) =>
      cardService.updateCardProfileImage(cardId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.cards.all,
        refetchType: "all",
      });
      await queryClient.refetchQueries({
        queryKey: queryKeys.cards.all,
        type: "all",
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.publicCard.all });
    },
  });
}
