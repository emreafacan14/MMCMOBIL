import { Platform } from "react-native";
import NfcManager, { NfcTech, Ndef, NfcError } from "react-native-nfc-manager";

export type NfcWriteStatus = "idle" | "ready" | "scanning" | "writing" | "success" | "error";

class NfcService {
  private initialized = false;

  public async init(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      const isSupported = await NfcManager.isSupported();
      if (isSupported) {
        await NfcManager.start();
        this.initialized = true;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public async isSupported(): Promise<boolean> {
    try {
      return await NfcManager.isSupported();
    } catch {
      return false;
    }
  }

  public async isEnabled(): Promise<boolean> {
    try {
      return await NfcManager.isEnabled();
    } catch {
      return false;
    }
  }

  public async openSettings(): Promise<void> {
    try {
      if (Platform.OS === "android") {
        await NfcManager.goToNfcSetting();
      }
    } catch {
      // Ignored
    }
  }

  public async writeUrl(
    url: string,
    onStatusChange?: (status: NfcWriteStatus, message?: string) => void,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        onStatusChange?.("error", "nfcNotSupported");
        return { success: false, error: "NFC is not supported on this device." };
      }

      const enabled = await this.isEnabled();
      if (!enabled && Platform.OS === "android") {
        onStatusChange?.("error", "nfcDisabled");
        return { success: false, error: "NFC is disabled in system settings." };
      }

      onStatusChange?.("scanning");

      // Register NDEF technology request
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: "Kartınızı telefonun arkasına yaklaştırın",
      });

      onStatusChange?.("writing");

      const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);
      if (!bytes) {
        throw new Error("Failed to encode NDEF URI message");
      }

      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      onStatusChange?.("success");
      return { success: true };
    } catch (err: unknown) {
      if (err instanceof NfcError.UserCancel) {
        onStatusChange?.("idle");
        return { success: false, error: "User cancelled" };
      }

      const errorMessage = err instanceof Error ? err.message : "NFC write error";
      onStatusChange?.("error", errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch {
        // Ignored
      }
    }
  }

  public async cancel(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      // Ignored
    }
  }
}

export const nfcService = new NfcService();
