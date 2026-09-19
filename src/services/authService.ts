import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  OtpCreationResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendOtpRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "@/types/api";
import { handleApiResponse, publicApiClient } from "@/services/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export const authService = {
  login(request: LoginRequest): Promise<LoginResponse> {
    return handleApiResponse(
      (client) => client.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, request),
      publicApiClient,
    );
  },

  register(request: RegisterRequest): Promise<RegisterResponse> {
    return handleApiResponse(
      (client) => client.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, request),
      publicApiClient,
    );
  },

  verifyEmail(request: VerifyOtpRequest): Promise<void> {
    return handleApiResponse(
      (client) => client.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, request),
      publicApiClient,
    );
  },

  resendEmailVerificationOtp(
    request: ResendOtpRequest,
  ): Promise<OtpCreationResponse | null> {
    return handleApiResponse(
      (client) =>
        client.post<OtpCreationResponse>(
          API_ENDPOINTS.AUTH.RESEND_EMAIL_VERIFICATION_OTP,
          request,
        ),
      publicApiClient,
    );
  },

  forgotPassword(request: ForgotPasswordRequest): Promise<OtpCreationResponse | null> {
    return handleApiResponse(
      (client) =>
        client.post<OtpCreationResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, request),
      publicApiClient,
    );
  },

  resendForgotPasswordOtp(
    request: ForgotPasswordRequest,
  ): Promise<OtpCreationResponse | null> {
    return handleApiResponse(
      (client) =>
        client.post<OtpCreationResponse>(
          API_ENDPOINTS.AUTH.RESEND_FORGOT_PASSWORD_OTP,
          request,
        ),
      publicApiClient,
    );
  },

  resetPassword(request: ResetPasswordRequest): Promise<void> {
    return handleApiResponse(
      (client) => client.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, request),
      publicApiClient,
    );
  },

  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return handleApiResponse(
      (client) =>
        client.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, request),
      publicApiClient,
    );
  },

  logout(request: RefreshTokenRequest): Promise<LogoutResponse> {
    return handleApiResponse((client) =>
      client.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT, request),
    );
  },
};
