import { Stack } from "expo-router";
import type { ReactElement } from "react";

/**
 * Auth group: full-screen dark flows. OTP screens (verify / reset) disable
 * the iOS back gesture so a swipe can never skip a pending verification.
 */
export default function AuthLayout(): ReactElement {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        animation: "none",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" options={{ gestureEnabled: false }} />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
