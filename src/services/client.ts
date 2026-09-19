import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiEnvelope, PickedFile } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

/**
 * Business failures arrive with HTTP 200 + success:false, so callers must go
 * through `unwrap` / `unwrapVoid` instead of relying on HTTP status alone.
 * HTTP 401 only happens when the JWT is missing/expired -> silent refresh.
 */
export class ApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

const REQUEST_TIMEOUT_MS = 20000;

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    config.headers = headers;
  }

  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const { refreshToken, setTokens, clearSession } = useAuthStore.getState();

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await axios.post<ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
    }>>(
      "/api/auth/refresh-token",
      { refreshToken },
      { baseURL: apiClient.defaults.baseURL },
    );

    const envelope = readEnvelope<{
      accessToken: string;
      refreshToken: string;
    }>(response.data);

    if (!envelope.success || envelope.responseData === null) {
      await clearSession();
      return false;
    }

    await setTokens({
      accessToken: envelope.responseData.accessToken,
      refreshToken: envelope.responseData.refreshToken,
    });

    return true;
  } catch {
    await clearSession();
    return false;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isUnauthorized = error.response?.status === 401;

    if (!config || !isUnauthorized || config._retried) {
      return Promise.reject(error);
    }

    config._retried = true;
    refreshInFlight = refreshInFlight ?? refreshSession();

    const refreshed = await refreshInFlight;
    refreshInFlight = null;

    if (!refreshed) {
      return Promise.reject(
        new ApiError("Oturum süresi doldu.", 401),
      );
    }

    return apiClient.request(config);
  },
);

/** Normalizes any thrown value into an `ApiError` with a user-facing message. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (isApiEnvelope(responseData)) {
      return new ApiError(
        responseData.message || "Beklenmeyen bir hata oluştu.",
        responseData.statusCode,
      );
    }

    if (!error.response) {
      return new ApiError(
        "Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin.",
        0,
      );
    }
  }

  return new ApiError("Beklenmeyen bir hata oluştu.", 0);
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ApiEnvelope<unknown>>;

  return (
    typeof candidate.success === "boolean" &&
    typeof candidate.message === "string" &&
    typeof candidate.statusCode === "number" &&
    "responseData" in candidate
  );
}

function readEnvelope<T>(value: unknown): ApiEnvelope<T> {
  if (!isApiEnvelope(value)) {
    throw new ApiError("Sunucudan geçersiz yanıt alındı.", 0);
  }

  return value as ApiEnvelope<T>;
}

/** Runs a request and returns `responseData`, throwing `ApiError` on failure.
 *  Services declare the payload's ELEMENT type for ergonomic public signatures;
 *  the wire format is always the backend envelope, so the raw body is narrowed
 *  here (justified cast — guarded by the success/responseData checks below). */
export async function unwrap<T>(
  request: (client: AxiosInstance) => Promise<{ data: unknown }>,
): Promise<T> {
  try {
    const response = await request(apiClient);
    // Backend always answers ResponseDto<T>; see types/api.ts ApiEnvelope docs.
    const envelope = readEnvelope<T>(response.data);

    if (!envelope.success || envelope.responseData === null) {
      throw new ApiError(
        envelope.message || "İşlem tamamlanamadı.",
        envelope.statusCode,
      );
    }

    return envelope.responseData;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Unwraps successful endpoints that intentionally return a null payload.
 * This is used by anti-enumeration OTP endpoints: `success: true` is still a
 * successful request even when the backend withholds the verification key.
 */
export async function unwrapNullable<T>(
  request: (client: AxiosInstance) => Promise<{ data: unknown }>,
): Promise<T | null> {
  try {
    const response = await request(apiClient);
    const envelope = readEnvelope<T>(response.data);

    if (!envelope.success) {
      throw new ApiError(
        envelope.message || "İşlem tamamlanamadı.",
        envelope.statusCode,
      );
    }

    return envelope.responseData;
  } catch (error) {
    throw toApiError(error);
  }
}

/** Same as `unwrap` for endpoints whose payload the app ignores. */
export async function unwrapVoid(
  request: (client: AxiosInstance) => Promise<{ data: unknown }>,
): Promise<void> {
  try {
    const envelope = readEnvelope<unknown>((await request(apiClient)).data);

    if (!envelope.success) {
      throw new ApiError(
        envelope.message || "İşlem tamamlanamadı.",
        envelope.statusCode,
      );
    }
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Per-request config for multipart bodies — overrides the instance default
 * `application/json`; React Native's networking layer adds the boundary.
 */
export const MULTIPART_CONFIG = {
  headers: { "Content-Type": "multipart/form-data" },
} as const;

/** Wraps a picker result into the FormData file part React Native expects. */
export function filePart(file: PickedFile): {
  uri: string;
  name: string;
  type: string;
} {
  return {
    uri: file.uri,
    name: file.fileName,
    type: file.mimeType ?? "application/octet-stream",
  };
}

/**
 * Appends a picker result as a multipart file part. The {uri, name, type}
 * object is what React Native's networking layer transmits, even though the
 * DOM typings only know real Blobs — hence the cast.
 */
export function appendFilePart(
  formData: FormData,
  fieldName: string,
  file: PickedFile,
): void {
  formData.append(fieldName, filePart(file) as unknown as Blob);
}

/**
 * Joins an API-relative public file path ("/uploads/...") with the base URL;
 * null when the path is missing so callers can fall back to initials.
 */
export function resolvePublicUrl(path: string | null | undefined): string | null {
  if (path === null || path === undefined || path.length === 0) {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("file://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return `${apiClient.defaults.baseURL}${path.startsWith("/") ? "" : "/"}${path}`;
}
