/**
 * Mirrors MMCardSystem backend DTOs exactly (camelCase JSON).
 * Enums are serialized as NUMBERS by the backend (no string converter),
 * so every enum type is a numeric union and must be sent as a number.
 */

export const ADDRESS_TYPE = {
  Home: 1,
  Work: 2,
  Office: 3,
  Branch: 4,
  Other: 5,
} as const;
export type AddressType = (typeof ADDRESS_TYPE)[keyof typeof ADDRESS_TYPE];

export const EMAIL_TYPE = {
  Personal: 1,
  Work: 2,
  Corporate: 3,
  Support: 4,
  Sales: 5,
  Other: 6,
} as const;
export type EmailType = (typeof EMAIL_TYPE)[keyof typeof EMAIL_TYPE];

export const PHONE_NUMBER_TYPE = {
  Mobile: 1,
  Home: 2,
  Work: 3,
} as const;
export type PhoneNumberType =
  (typeof PHONE_NUMBER_TYPE)[keyof typeof PHONE_NUMBER_TYPE];

/** Standard backend response format. HTTP status is 200 even for business failures;
 *  `success` + `statusCode` carry the real result. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  responseData: T | null;
  statusCode: number;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  name: string;
  surname: string;
  email: string;
  roleId: number;
  roleName: string;
  profileImagePath: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  requiresEmailVerification: boolean;
  verificationKey: string | null;
  otpExpiresAt: string | null;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  name: string;
  surname: string;
  email: string;
  roleId: number;
  roleName: string;
  verificationKey: string;
  otpExpiresAt: string;
}

export interface VerifyOtpRequest {
  verificationKey: string;
  code: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  verificationKey: string;
  code: string;
  newPassword: string;
}

export interface OtpCreationResponse {
  verificationKey: string;
  expiresAt: string;
  /** Raw OTP code leaked by the backend (dev convenience) — never shown in UI. */
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  refreshTokenId: number;
  isRevoked: boolean;
  revokedAt: string | null;
}

// ---------------------------------------------------------------------------
// Profile (api/my-profile)
// ---------------------------------------------------------------------------

/** GET /api/my-profile response. */
export interface MyProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  /** Public static URL path ("/uploads/...") — prefix with the API base URL. */
  profileImagePath: string | null;
}

/** PUT /api/my-profile body; the endpoint answers UserResponseDto. */
export interface UpdateMyProfileRequest {
  name: string;
  surname: string;
}

export interface UpdateMyProfileResponse {
  id: number;
  name: string;
  surname: string;
  email: string;
  roleId: number;
  roleName: string | null;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export interface CardSummary {
  id: number;
  urlKey: string;
  userId: number | null;
  userFullName: string | null;
  /** Public static URL path ("/uploads/...") — prefix with the API base URL. */
  cardProfileImagePath: string | null;
  activatedAt: string | null;
  isActive: boolean;
  isRevoked: boolean;
  revokedAt: string | null;
  /** Incremented only by public web page visits (/card/{urlKey}), not by API reads. */
  viewCount: number;
  revokeReason: string | null;
  createdAt: string;
  createdByUserId: number | null;
}

export interface ActivateCardRequest {
  urlKey: string;
}

export interface MyCardDetail {
  id: number;
  urlKey: string;
  activatedAt: string | null;
  isRevoked: boolean;
  phones: CardPhone[];
  emails: CardEmail[];
  addresses: CardAddress[];
  socialMedia: CardSocialMedia[];
}

export interface PublicCard {
  id: number;
  urlKey: string;
  userFullName: string | null;
  /** Public static URL path ("/uploads/...") — prefix with the API base URL. */
  cardProfileImagePath: string | null;
  phones: CardPhone[];
  emails: CardEmail[];
  addresses: CardAddress[];
  socialMedia: CardSocialMedia[];
  documents: CardDocument[];
}

/** One of the owner's documents attached to a card (api/my-card/documents). */
export interface CardDocument {
  id: number;
  cardId: number;
  userDocumentId: number;
  title: string;
  fileName: string;
  contentType: string;
  displayOrder: number;
  /** Public relative URL — only populated on public card responses. */
  documentUrl: string | null;
}

/** POST/PUT body for api/my-card/documents (binding, not upload). */
export interface SaveCardDocumentRequest {
  cardId: number;
  userDocumentId: number;
  displayOrder: number;
}

export interface CardPhone {
  id: number;
  cardId: number;
  userPhoneId: number;
  title: string | null;
  description: string | null;
  phoneNumberType: PhoneNumberType;
  phoneNumber: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CardEmail {
  id: number;
  cardId: number;
  userEmailId: number;
  title: string | null;
  description: string | null;
  emailType: EmailType;
  emailAddress: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CardAddress {
  id: number;
  cardId: number;
  userAddressId: number;
  title: string | null;
  description: string | null;
  addressType: AddressType;
  fullAddress: string | null;
  buildingNumber: number | null;
  buildingName: string | null;
  floor: number | null;
  doorNumber: number | null;
  streetName: string | null;
  zipCode: number | null;
  neighborhoodId: number;
  neighborhoodName: string;
  districtId: number;
  districtName: string;
  cityId: number;
  cityName: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CardSocialMedia {
  id: number;
  cardId: number;
  userSocialMediaId: number;
  title: string | null;
  username: string | null;
  url: string;
  socialMediaPlatformId: number;
  socialMediaPlatformName: string;
  icon: string | null;
  baseUrl: string | null;
  displayOrder: number;
}

export interface CreateCardPhoneRequest {
  cardId: number;
  userPhoneId: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface UpdateCardPhoneRequest {
  cardId: number;
  userPhoneId: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CreateCardEmailRequest {
  cardId: number;
  userEmailId: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface UpdateCardEmailRequest {
  cardId: number;
  userEmailId: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CreateCardAddressRequest {
  cardId: number;
  userAddressId: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface UpdateCardAddressRequest {
  cardId: number;
  userAddressId: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CreateCardSocialMediaRequest {
  cardId: number;
  userSocialMediaId: number;
  displayOrder: number;
}

export interface UpdateCardSocialMediaRequest {
  cardId: number;
  userSocialMediaId: number;
  displayOrder: number;
}

// ---------------------------------------------------------------------------
// My contact info (user-owned phones / emails / addresses / socials)
// ---------------------------------------------------------------------------

export interface UserPhone {
  id: number;
  title: string | null;
  description: string | null;
  phoneId: number;
  phoneNumberType: PhoneNumberType;
  phoneNumber: string;
}

export interface SaveUserPhoneRequest {
  title: string | null;
  description: string | null;
  phoneNumberType: PhoneNumberType;
  phoneNumber: string;
}

export interface UserEmail {
  id: number;
  title: string | null;
  description: string | null;
  emailId: number;
  emailType: EmailType;
  emailAddress: string;
}

export interface SaveUserEmailRequest {
  title: string | null;
  description: string | null;
  emailType: EmailType;
  emailAddress: string;
}

export interface UserAddress {
  id: number;
  title: string | null;
  description: string | null;
  addressId: number;
  addressType: AddressType;
  fullAddress: string | null;
  buildingNumber: number | null;
  buildingName: string | null;
  floor: number | null;
  doorNumber: number | null;
  streetName: string | null;
  zipCode: number | null;
  neighborhoodId: number;
  neighborhoodName: string | null;
  districtId: number;
  districtName: string | null;
  cityId: number;
  cityName: string | null;
}

export interface SaveUserAddressRequest {
  title: string | null;
  description: string | null;
  addressType: AddressType;
  fullAddress: string | null;
  buildingNumber: number | null;
  buildingName: string | null;
  floor: number | null;
  doorNumber: number | null;
  streetName: string | null;
  zipCode: number | null;
  neighborhoodId: number;
}

export interface UserSocialMedia {
  id: number;
  title: string | null;
  username: string | null;
  url: string;
  socialMediaPlatformId: number;
  socialMediaPlatformName: string;
  icon: string | null;
  baseUrl: string | null;
}

export interface SaveUserSocialMediaRequest {
  title: string | null;
  username: string | null;
  url: string;
  socialMediaPlatformId: number;
}

// ---------------------------------------------------------------------------
// My documents (api/my-documents) — file bytes travel via multipart, not JSON
// ---------------------------------------------------------------------------

export interface UserDocument {
  id: number;
  title: string;
  filePath: string;
  fileName: string;
  contentType: string;
  createdAt: string;
}

/** Multipart form for POST/PUT api/my-documents. */
export interface SaveUserDocumentRequest {
  title: string;
  /** Omit on update to keep the current file (rename only). */
  file?: PickedFile;
}

/** Local file handle produced by the document/image pickers. */
export interface PickedFile {
  uri: string;
  fileName: string;
  mimeType: string | null;
  /** Bytes — validated client-side against the backend's 10 MB limit. */
  size: number | null;
}

// ---------------------------------------------------------------------------
// Location & platforms
// ---------------------------------------------------------------------------

export interface City {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  cityId: number;
}

export interface Neighborhood {
  id: number;
  name: string;
  districtId: number;
}

export interface SocialMediaPlatform {
  id: number;
  name: string;
  icon: string | null;
  baseUrl: string | null;
}

// ---------------------------------------------------------------------------
// Contact form
// ---------------------------------------------------------------------------

export interface CreateContactRequest {
  fullName: string;
  email: string;
  /** 10 digits, starts with 5 (Turkish mobile, no leading zero). */
  phoneNumber: string;
  message: string;
}

export interface ContactResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  message: string;
  createdAt: string;
}
