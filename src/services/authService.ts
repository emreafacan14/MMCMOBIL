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
import { unwrap, unwrapNullable, unwrapVoid } from "@/services/client";

export const authService = {
  login(request: LoginRequest): Promise<LoginResponse> {
    return unwrap((client) =>
      client.post<LoginResponse>("/api/auth/login", request),
    );
  },

  register(request: RegisterRequest): Promise<RegisterResponse> {
    return unwrap((client) =>
      client.post<RegisterResponse>("/api/auth/register", request),
    );
  },

  verifyEmail(request: VerifyOtpRequest): Promise<void> {
    return unwrapVoid((client) =>
      client.post("/api/auth/verify-email", request),
    );
  },

  resendEmailVerificationOtp(
    request: ResendOtpRequest,
  ): Promise<OtpCreationResponse | null> {
    return unwrapNullable((client) =>
      client.post<OtpCreationResponse>(
        "/api/auth/resend-email-verification-otp",
        request,
      ),
    );
  },

  forgotPassword(request: ForgotPasswordRequest): Promise<OtpCreationResponse | null> {
    return unwrapNullable((client) =>
      client.post<OtpCreationResponse>("/api/auth/forgot-password", request),
    );
  },

  resendForgotPasswordOtp(
    request: ForgotPasswordRequest,
  ): Promise<OtpCreationResponse | null> {
    return unwrapNullable((client) =>
      client.post<OtpCreationResponse>(
        "/api/auth/resend-forgot-password-otp",
        request,
      ),
    );
  },

  resetPassword(request: ResetPasswordRequest): Promise<void> {
    return unwrapVoid((client) =>
      client.post("/api/auth/reset-password", request),
    );
  },

  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return unwrap((client) =>
      client.post<RefreshTokenResponse>("/api/auth/refresh-token", request),
    );
  },

  logout(request: RefreshTokenRequest): Promise<LogoutResponse> {
    return unwrap((client) =>
      client.post<LogoutResponse>("/api/auth/logout", request),
    );
  },
};
