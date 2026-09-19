/**
 * Document download + open flows. Both variants land the bytes in the cache
 * and surface them through the native share sheet, mirroring the VCF flow in
 * cardSharing.ts — private files additionally carry the bearer token.
 */

import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { apiClient, publicApiClient } from "@/services/client";
import { userDocumentsService } from "@/services/userDocumentsService";
import type { CardDocument } from "@/types/api";

const FALLBACK_MIME_TYPE = "application/octet-stream";

async function shareDownloadedFile(
  fileUri: string,
  mimeType: string,
  dialogTitle: string,
): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle,
  });
}

/** Owner-only file endpoint (`/api/my-documents/{id}/file`). */
export async function sharePrivateDocument(
  document: Pick<UserDocumentFields, "id" | "title" | "fileName" | "contentType">,
): Promise<void> {
  const accessToken = userDocumentsService.authToken();

  if (accessToken === null) {
    throw new Error("Not authenticated.");
  }

  const safeName = document.fileName.length > 0 ? document.fileName : document.title;
  const fileUri = `${FileSystem.cacheDirectory}${document.id}-${safeName}`;

  const downloadResult = await FileSystem.downloadAsync(
    userDocumentsService.buildFileUrl(document.id),
    fileUri,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  await shareDownloadedFile(
    downloadResult.uri,
    document.contentType.length > 0 ? document.contentType : FALLBACK_MIME_TYPE,
    document.title,
  );
}

/** Public per-card endpoint — no auth header, URL comes from the response. */
export async function sharePublicCardDocument(
  document: Pick<CardDocument, "id" | "documentUrl" | "title" | "contentType">,
): Promise<void> {
  if (document.documentUrl === null || document.documentUrl.length === 0) {
    throw new Error("Missing document URL.");
  }

  const fileUri = `${FileSystem.cacheDirectory}card-${document.id}`;
  const baseUrl = publicApiClient.defaults.baseURL || apiClient.defaults.baseURL || "";
  const downloadResult = await FileSystem.downloadAsync(
    `${baseUrl}${document.documentUrl}`,
    fileUri,
  );

  await shareDownloadedFile(
    downloadResult.uri,
    document.contentType.length > 0 ? document.contentType : FALLBACK_MIME_TYPE,
    document.title,
  );
}

/** Structural subset shared by UserDocument and CardDocument rows. */
interface UserDocumentFields {
  id: number;
  title: string;
  fileName: string;
  contentType: string;
}
