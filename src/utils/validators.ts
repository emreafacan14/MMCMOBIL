const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Backend rule: 10 digits starting with 5 (contact form). */
const TURKISH_MOBILE_PATTERN = /^5\d{9}$/;
/** User phone rule: exactly 10 digits; prefix may be mobile or geographic. */
const PHONE_NUMBER_PATTERN = /^\d{10}$/;
/** Backend rule: 6 digits (e-mail verification / reset codes). */
const OTP_PATTERN = /^\d{6}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidTurkishMobile(value: string): boolean {
  return TURKISH_MOBILE_PATTERN.test(value.trim());
}

export function isValidPhoneNumber(value: string): boolean {
  return PHONE_NUMBER_PATTERN.test(value.trim());
}

export function isValidOtpCode(value: string): boolean {
  return OTP_PATTERN.test(value);
}

/** Backend accepts passwords of at least 6 characters. */
export function isValidPassword(value: string): boolean {
  return value.length >= 6;
}

export function isSamePassword(a: string, b: string): boolean {
  return a.length > 0 && a === b;
}
