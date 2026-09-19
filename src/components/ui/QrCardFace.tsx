import { Sparkles } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import type { ReactElement } from "react";
import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CardShell } from "@/components/ui/CardShell";
import { CARD_ASPECT_RATIO } from "@/components/ui/CardVisual";
import { colors, glowShadow, radius } from "@/constants/theme";

/** Horizontal margin around the hero card on the home screen (px-20 both sides). */
const HOME_HORIZONTAL_PADDING = 40;
/** Vertical chrome around the QR: py-3 paddings (24) + tile inner padding (24). */
const TILE_CHROME = 48;
/** QR share of the card width; the rest belongs to the logo column. */
const MAX_QR_WIDTH_RATIO = 0.42;

export interface QrCardFaceProps {
  /** Public URL encoded into the QR — any phone camera must be able to open it. */
  value: string;
  /** Short scan hint shown under the logo. */
  caption: string;
}

/** Back face of the hero card: big QR on the left, brand column on the right. */
export function QrCardFace({ value, caption }: QrCardFaceProps): ReactElement {
  const { width } = useWindowDimensions();
  const cardWidth = width - HOME_HORIZONTAL_PADDING;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const qrSize = Math.min(
    Math.floor(cardHeight - TILE_CHROME),
    Math.floor(cardWidth * MAX_QR_WIDTH_RATIO),
  );

  return (
    <View style={[styles.card, glowShadow, { borderRadius: radius.xl }]}>
      <CardShell>
        <View className="flex-1 flex-row items-center gap-4 px-4 py-3">
          <View style={styles.tile}>
            <QRCode
              value={value}
              size={qrSize}
              backgroundColor="white"
              color="#070810"
            />
          </View>
          <View className="flex-1 items-center gap-2.5">
            <Image
              source={require("../../../assets/logo.png")}
              resizeMode="contain"
              style={styles.logo}
            />
            <View className="flex-row items-center gap-1">
              <View className="h-px w-6 bg-gold/50" />
              <Sparkles size={11} color={colors.gold} />
              <View className="h-px w-6 bg-gold/50" />
            </View>
            <Text className="text-center font-inter-medium text-[11px] leading-snug text-white/60">
              {caption}
            </Text>
          </View>
        </View>
      </CardShell>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // Fills the absolutely positioned flip face, which owns the fixed height.
    flex: 1,
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: colors.elevated,
  },
  tile: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 12,
    elevation: 6,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logo: {
    width: 132,
    height: 44,
    // Right column narrows on small screens; never let the logo overlap the QR.
    maxWidth: "100%",
  },
});
