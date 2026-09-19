import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

/** Entry gate: routes to tabs or auth once the stored session is hydrated. */
export default function IndexGate() {
  const status = useAuthStore((state) => state.status);

  if (status === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  return null;
}
