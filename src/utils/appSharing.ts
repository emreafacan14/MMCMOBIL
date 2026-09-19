import { Share } from "react-native";

/** Temporary landing URL until the app is listed on the stores. */
const APP_SHARE_URL = "https://mmcard.rascal.com.tr";

/**
 * Opens the native share sheet with a short recommendation message and the
 * app URL appended. Dismissing the sheet is not treated as an error.
 */
export async function shareApp(message: string): Promise<void> {
  try {
    await Share.share({ message: `${message}\n${APP_SHARE_URL}` });
  } catch {
    // User cancelled the share sheet — not an error.
  }
}
