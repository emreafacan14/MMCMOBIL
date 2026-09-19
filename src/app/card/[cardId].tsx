import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CardDetailRedirectScreen() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId: string }>();

  useEffect(() => {
    if (cardId) {
      router.replace(`/(tabs)/cards?cardId=${cardId}`);
    } else {
      router.replace("/(tabs)/cards");
    }
  }, [cardId, router]);

  return (
    <View className="flex-1 items-center justify-center bg-transparent px-5">
      <Skeleton className="h-52 w-full rounded-3xl" />
    </View>
  );
}
