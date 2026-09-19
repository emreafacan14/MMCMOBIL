/**
 * Native pickers -> PickedFile mapping plus the client-side half of the
 * backend's 10 MB upload limit (rejected before any bytes leave the device).
 */

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import type { PickedFile } from "@/types/api";

/** Mirrors FileSettings.MaxFileSize on the backend. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function isWithinUploadLimit(file: PickedFile): boolean {
  return file.size === null || file.size <= MAX_UPLOAD_BYTES;
}

function assetToFile(asset: {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}): PickedFile {
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `file-${Date.now()}`,
    mimeType: asset.mimeType ?? null,
    size: asset.fileSize ?? null,
  };
}

/** Square-cropped gallery image (profile / card photos). */
export async function pickImageFromLibrary(): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
    exif: false,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return assetToFile(result.assets[0]!);
}

/** Any document type (PDFs, Office files, ...) via the system picker. */
export async function pickDocumentFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return assetToFile(result.assets[0]!);
}
