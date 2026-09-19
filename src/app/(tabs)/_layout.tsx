import { Tabs } from "expo-router";

import { useTranslation } from "@/i18n";
import TabBar from "./_tabBar";

function RootTabs() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="cards" options={{ title: t("tabs.cards") }} />
      <Tabs.Screen name="my-info" options={{ title: t("tabs.myInfo") }} />
      <Tabs.Screen name="settings" options={{ title: t("tabs.settings") }} />
    </Tabs>
  );
}

export default RootTabs;
