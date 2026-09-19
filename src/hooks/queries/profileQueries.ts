import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profileService";
import { queryKeys } from "@/hooks/queries/queryKeys";
import type { PickedFile, UpdateMyProfileRequest } from "@/types/api";

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: profileService.getMyProfile,
  });
}

function useInvalidateProfileAndCards() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    // Name changes flow into public-card UserFullName; images into the lists.
    queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.publicCard.all });
  };
}

export function useUpdateMyProfile() {
  const invalidate = useInvalidateProfileAndCards();

  return useMutation({
    mutationFn: (request: UpdateMyProfileRequest) =>
      profileService.updateMyProfile(request),
    onSuccess: invalidate,
  });
}

export function useUpdateProfileImage() {
  const invalidate = useInvalidateProfileAndCards();

  return useMutation({
    mutationFn: (file: PickedFile) => profileService.updateProfileImage(file),
    onSuccess: invalidate,
  });
}
