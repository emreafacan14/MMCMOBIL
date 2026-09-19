import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export interface OtpInputProps {
  value: string;
  onChange: (digits: string) => void;
  length?: number;
  hasError?: boolean;
}

/**
 * OTP entry: an invisible TextInput overlays a row of digit cells, so the
 * native keyboard drives everything. Digits are filtered and truncated.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  hasError = false,
}: OtpInputProps): ReactElement {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const cellIndexes = Array.from({ length }, (_, index) => index);

  const handleChangeText = (text: string): void => {
    onChange(text.replace(/\D/g, "").slice(0, length));
  };

  const handleFocusInput = (): void => {
    inputRef.current?.focus();
  };

  return (
    <Pressable
      onPress={handleFocusInput}
      className="relative self-stretch"
      accessibilityHint="Enter the verification code"
    >
      <View className="flex-row justify-between">
        {cellIndexes.map((index) => {
          const digit = value[index];
          const isFilled = digit !== undefined && digit !== "";
          const isCurrentCell = isFocused && index === value.length;
          const borderClass = hasError
            ? "border-danger"
            : isFilled || isCurrentCell
              ? "border-primary-strong"
              : "border-line";
          const backgroundClass = isFilled ? "bg-primary-dim" : "bg-elevated/80";

          return (
            <View
              key={index}
              className={`h-14 w-12 items-center justify-center rounded-2xl border ${backgroundClass} ${borderClass}`}
            >
              <Text className="font-inter-bold text-2xl text-ink">
                {digit ?? ""}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        autoFocus
        maxLength={length}
        contextMenuHidden
        autoComplete="off"
        textContentType="oneTimeCode"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
});
