import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Clipboard from "expo-clipboard";
import { NativeModules, Platform } from "react-native";
import { publicCardService } from "@/services/publicCardService";
import { toast } from "@/store/toastStore";

const VCF_MIME_TYPE = "text/vcard";

interface VCardShareNativeModule {
  openChooser(fileUri: string, mimeType: string, title: string): Promise<void>;
}

const vCardShare = NativeModules.VCardShare as VCardShareNativeModule | undefined;

/**
 * Downloads the public VCF of a card into the cache and opens the native
 * share sheet with it — the recipient can save the contact directly.
 * Returns true when the share sheet was opened.
 */
export async function shareCardVcf(urlKey: string): Promise<boolean> {
  const fileUri = `${FileSystem.cacheDirectory}${urlKey}.vcf`;
  const downloadResult = await FileSystem.downloadAsync(
    publicCardService.buildVcfUrl(urlKey),
    fileUri,
  );

  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    return false;
  }

  if (Platform.OS === "android" && vCardShare !== undefined) {
    try {
      await vCardShare.openChooser(downloadResult.uri, VCF_MIME_TYPE, "MMCard");
    } catch {
      // Keep sharing functional on Android variants that reject custom chooser intents.
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: VCF_MIME_TYPE,
        dialogTitle: "MMCard",
      });
    }
  } else {
    await Sharing.shareAsync(downloadResult.uri, {
      mimeType: VCF_MIME_TYPE,
      dialogTitle: "MMCard",
    });
  }

  return true;
}

/** Shares the VCF and surfaces failures as a toast instead of throwing. */
export async function shareCardVcfSafe(urlKey: string, errorMessage: string): Promise<void> {
  try {
    await shareCardVcf(urlKey);
  } catch {
    toast.error(errorMessage);
  }
}

export async function copyCardLink(urlKey: string, successMessage: string): Promise<void> {
  await Clipboard.setStringAsync(publicCardService.buildPublicWebUrl(urlKey));
  toast.success(successMessage);
}

/** Opens the native share sheet with the card's public web link as plain text. */
export async function shareCardLink(
  urlKey: string,
  message: string,
  errorMessage: string,
): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    toast.error(errorMessage);
    return;
  }

  try {
    await Sharing.shareAsync(publicCardService.buildPublicWebUrl(urlKey), {
      dialogTitle: message,
    });
  } catch {
    // User cancelled the share sheet — not an error.
  }
}
