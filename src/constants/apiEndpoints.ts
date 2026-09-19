/**
 * Backend API Controllers
 * Her controller için temel yol (base path) burada tanımlanır.
 */
export const API_CONTROLLERS = {
  AUTH: "/api/auth",
  MY_CARD: "/api/my-card",
  MY_PROFILE: "/api/my-profile",
  MY_PHONES: "/api/my-phones",
  MY_EMAILS: "/api/my-emails",
  MY_ADDRESSES: "/api/my-addresses",
  MY_SOCIAL_MEDIAS: "/api/my-social-medias",
  MY_DOCUMENTS: "/api/my-documents",
  LOCATION: "/api/location",
  SOCIAL_MEDIA_PLATFORMS: "/api/social-media-platforms",
  CONTACT: "/api/contact",
  PUBLIC_CARDS: "/api/public/cards",
} as const;

export type ApiController = (typeof API_CONTROLLERS)[keyof typeof API_CONTROLLERS];

/**
 * Backend API Endpoints
 * Controller'lar altında gruplandırılmış uç noktalar.
 * Dinamik parametre alan uç noktalar fonksiyon olarak tanımlanmıştır.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_CONTROLLERS.AUTH}/login`,
    REGISTER: `${API_CONTROLLERS.AUTH}/register`,
    VERIFY_EMAIL: `${API_CONTROLLERS.AUTH}/verify-email`,
    RESEND_EMAIL_VERIFICATION_OTP: `${API_CONTROLLERS.AUTH}/resend-email-verification-otp`,
    FORGOT_PASSWORD: `${API_CONTROLLERS.AUTH}/forgot-password`,
    RESEND_FORGOT_PASSWORD_OTP: `${API_CONTROLLERS.AUTH}/resend-forgot-password-otp`,
    RESET_PASSWORD: `${API_CONTROLLERS.AUTH}/reset-password`,
    REFRESH_TOKEN: `${API_CONTROLLERS.AUTH}/refresh-token`,
    LOGOUT: `${API_CONTROLLERS.AUTH}/logout`,
  },

  MY_CARD: {
    BASE: API_CONTROLLERS.MY_CARD,
    BY_ID: (cardId: number | string) => `${API_CONTROLLERS.MY_CARD}/${cardId}`,
    ACTIVATE: `${API_CONTROLLERS.MY_CARD}/activate`,
    PROFILE_IMAGE: `${API_CONTROLLERS.MY_CARD}/profile-image`,
    PHONES: `${API_CONTROLLERS.MY_CARD}/phones`,
    PHONE_BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_CARD}/phones/${id}`,
    EMAILS: `${API_CONTROLLERS.MY_CARD}/emails`,
    EMAIL_BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_CARD}/emails/${id}`,
    ADDRESSES: `${API_CONTROLLERS.MY_CARD}/addresses`,
    ADDRESS_BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_CARD}/addresses/${id}`,
    SOCIAL_MEDIAS: `${API_CONTROLLERS.MY_CARD}/social-medias`,
    SOCIAL_MEDIA_BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_CARD}/social-medias/${id}`,
    DOCUMENTS: `${API_CONTROLLERS.MY_CARD}/documents`,
    DOCUMENT_BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_CARD}/documents/${id}`,
  },

  MY_PROFILE: {
    BASE: API_CONTROLLERS.MY_PROFILE,
    PROFILE_IMAGE: `${API_CONTROLLERS.MY_PROFILE}/profile-image`,
  },

  MY_PHONES: {
    BASE: API_CONTROLLERS.MY_PHONES,
    BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_PHONES}/${id}`,
  },

  MY_EMAILS: {
    BASE: API_CONTROLLERS.MY_EMAILS,
    BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_EMAILS}/${id}`,
  },

  MY_ADDRESSES: {
    BASE: API_CONTROLLERS.MY_ADDRESSES,
    BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_ADDRESSES}/${id}`,
  },

  MY_SOCIAL_MEDIAS: {
    BASE: API_CONTROLLERS.MY_SOCIAL_MEDIAS,
    BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_SOCIAL_MEDIAS}/${id}`,
  },

  MY_DOCUMENTS: {
    BASE: API_CONTROLLERS.MY_DOCUMENTS,
    BY_ID: (id: number | string) => `${API_CONTROLLERS.MY_DOCUMENTS}/${id}`,
    FILE: (id: number | string) => `${API_CONTROLLERS.MY_DOCUMENTS}/${id}/file`,
  },

  LOCATION: {
    BASE: API_CONTROLLERS.LOCATION,
    CITIES: `${API_CONTROLLERS.LOCATION}/cities`,
    DISTRICTS: (cityId: number | string) => `${API_CONTROLLERS.LOCATION}/cities/${cityId}/districts`,
    NEIGHBORHOODS: (districtId: number | string) => `${API_CONTROLLERS.LOCATION}/districts/${districtId}/neighborhoods`,
  },

  SOCIAL_MEDIA_PLATFORMS: {
    BASE: API_CONTROLLERS.SOCIAL_MEDIA_PLATFORMS,
  },

  CONTACT: {
    BASE: API_CONTROLLERS.CONTACT,
  },

  PUBLIC_CARDS: {
    BASE: API_CONTROLLERS.PUBLIC_CARDS,
    BY_URL_KEY: (urlKey: string) => `${API_CONTROLLERS.PUBLIC_CARDS}/${encodeURIComponent(urlKey)}`,
    VCF: (urlKey: string) => `${API_CONTROLLERS.PUBLIC_CARDS}/${encodeURIComponent(urlKey)}/vcf`,
    DOCUMENT: (urlKey: string, cardDocumentId: number | string) =>
      `${API_CONTROLLERS.PUBLIC_CARDS}/${encodeURIComponent(urlKey)}/documents/${cardDocumentId}`,
  },
} as const;

export const ENDPOINTS = API_ENDPOINTS;
export const CONTROLLERS = API_CONTROLLERS;
