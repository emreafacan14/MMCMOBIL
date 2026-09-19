/**
 * Circular avatar: the user's public profile image when present, otherwise
 * two-letter initials on the dim primary disc (same look as public pages).
 */

import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

import { resolvePublicUrl } from "@/services/client";
import { initialsOf } from "@/utils/contact";

export interface AvatarProps {
  /** Public image path ("/uploads/...") — API-relative, resolved internally. */
  imagePath?: string | null;
  name: string;
  surname?: string;
  size?: number;
}

function initialsFor(name: string, surname: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  const last = surname.trim().split(/\s+/).filter(Boolean).pop() ?? "";
  return initialsOf(first, last);
}

export function Avatar({ imagePath, name, surname = "", size = 48 }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const uri = resolvePublicUrl(imagePath);
  const fontSize = Math.round(size * 0.34);

  useEffect(() => {
    setHasError(false);
  }, [imagePath]);

  const showInitials = uri === null || hasError;

  return (
    <View
      className="items-center justify-center rounded-full border border-primary/30 bg-primary-dim overflow-hidden"
      style={{ width: size, height: size }}
    >
      {showInitials ? (
        <Text style={{ fontSize }} className="font-inter-extrabold text-primary-strong">
          {initialsFor(name, surname)}
        </Text>
      ) : (
        <Image
          source={{ uri }}
          className="h-full w-full"
          accessibilityLabel={`${name} ${surname}`.trim()}
          fadeDuration={120}
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
}
