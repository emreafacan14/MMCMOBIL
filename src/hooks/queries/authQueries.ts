import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "@/types/api";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (request: LoginRequest) => authService.login(request),
    onSuccess: async (response) => {
      const accessToken = response.accessToken;
      const refreshToken = response.refreshToken;

      if (
        !response.requiresEmailVerification &&
        accessToken !== null &&
        refreshToken !== null
      ) {
        await setSession(
          { accessToken, refreshToken },
          {
            userId: response.userId,
            name: response.name,
            surname: response.surname,
            email: response.email,
            roleId: response.roleId,
            roleName: response.roleName,
          },
        );
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (request: RegisterRequest) => authService.register(request),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (request: VerifyOtpRequest) => authService.verifyEmail(request),
  });
}

export function useResendEmailOtp() {
  return useMutation({
    mutationFn: (request: ResendOtpRequest) =>
      authService.resendEmailVerificationOtp(request),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (request: ForgotPasswordRequest) =>
      authService.forgotPassword(request),
  });
}

export function useResendForgotPasswordOtp() {
  return useMutation({
    mutationFn: (request: ForgotPasswordRequest) =>
      authService.resendForgotPasswordOtp(request),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (request: ResetPasswordRequest) =>
      authService.resetPassword(request),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { refreshToken } = useAuthStore.getState();

      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
    },
    onSettled: async () => {
      await clearSession();
      queryClient.clear();
    },
  });
}
