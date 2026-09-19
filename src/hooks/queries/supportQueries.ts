import { useMutation } from "@tanstack/react-query";
import { supportService } from "@/services/supportService";
import type { CreateContactRequest } from "@/types/api";

export function useSendContactMessage() {
  return useMutation({
    mutationFn: (request: CreateContactRequest) =>
      supportService.sendMessage(request),
  });
}
