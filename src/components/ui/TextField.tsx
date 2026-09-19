import { colors } from "@/constants/theme";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import {
  type BlurEvent,
  type FocusEvent,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

export interface TextFieldProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string | null;
  icon?: ReactNode;
  /** Node rendered after the input (e.g. a visibility toggle). */
  rightSlot?: ReactNode;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable?: boolean;
  maxLength?: number;
}

/**
 * Labeled text field with focus/error border states, optional leading icon
 * and trailing slot, plus an error/hint line under the input.
 */
export function TextField(props: TextFieldProps): ReactElement {
  const {
    label,
    value,
    onChangeText,
    placeholder,
    error,
    hint,
    icon,
    rightSlot,
    multiline = false,
    secureTextEntry,
    keyboardType = "default",
    autoCapitalize = "none",
    autoCorrect = false,
    editable = true,
    maxLength,
    onFocus,
    onBlur,
    ...rest
  } = props;
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (event: FocusEvent): void => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: BlurEvent): void => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const borderClass = error
    ? "border-danger"
    : isFocused
      ? "border-primary-strong"
      : "border-line";
  const rowSizeClass = multiline ? "min-h-[110px] items-start py-3" : "h-[52px]";

  return (
    <View className="gap-1.5">
      {label !== undefined ? (
        <Text className="mb-1.5 font-inter-semibold text-xs tracking-wide text-muted">{label}</Text>
      ) : null}
      <View
        className={`flex-row rounded-2xl border bg-elevated/80 px-4 ${rowSizeClass} ${borderClass}`}
        style={isFocused ? styles.focusedField : styles.field}
      >
        {icon !== undefined ? (
          <View className={multiline ? "mr-3 pt-3.5" : "mr-3 justify-center"}>
            {icon}
          </View>
        ) : null}
        <TextInput
          {...rest}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          editable={editable}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-1 font-inter-regular text-base text-ink"
          style={multiline ? styles.multilineInput : undefined}
        />
        {rightSlot !== undefined ? (
          <View className="ml-3 justify-center">{rightSlot}</View>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-1.5 font-inter-regular text-xs text-danger">
          {error}
        </Text>
      ) : hint !== null && hint !== undefined ? (
        <Text className="mt-1.5 font-inter-regular text-xs text-faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  focusedField: {
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
});
