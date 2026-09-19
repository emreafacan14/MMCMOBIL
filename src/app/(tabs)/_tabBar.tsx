import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Contact,
  CreditCard,
  House,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
// SDK 57 vendors react-navigation inside expo-router; @react-navigation/bottom-tabs is not installed.
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { CommonActions } from "expo-router/build/react-navigation/routers";

import { colors } from "@/constants/theme";
import { useHaptic } from "@/hooks/useHaptic";

const ACTIVE_COLOR = colors.primaryStrong;
const INACTIVE_COLOR = colors.faint;

const TAB_ICONS: Record<string, LucideIcon> = {
  index: House,
  cards: CreditCard,
  "my-info": Contact,
  settings: Settings,
};

interface TabBarItemProps {
  Icon: LucideIcon;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function TabBarItem({ Icon, label, isActive, onPress }: TabBarItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 110 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 280 });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className={`flex-1 items-center justify-center rounded-[20px] border py-2.5 ${
        isActive ? "border-primary/25 bg-primary-dim" : "border-transparent"
      }`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[animatedStyle]} className="items-center gap-1">
        <Icon
          size={21}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        <Text
          className={`text-[11px] font-inter-medium ${
            isActive ? "text-primary-strong" : "text-faint"
          }`}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function TabBar(props: Partial<BottomTabBarProps>) {
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { state, descriptors, navigation } = props;

  // During Fast Refresh or navigator reconfiguration React Navigation can
  // briefly render a custom tab bar before its state is attached.
  if (state === undefined || descriptors === undefined || navigation === undefined) {
    return null;
  }

  const handleTabPress =
    (routeKey: string, routeName: string, isFocused: boolean) => () => {
      haptic("selection");

      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.dispatch({
          ...CommonActions.navigate({ name: routeName }),
          target: state.key,
        });
      }
    };

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 px-4"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View
        className="flex-row overflow-hidden rounded-[28px] border border-line bg-elevated/80 p-1.5"
        style={styles.bar}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (descriptor === undefined) {
            return null;
          }

          const Icon = TAB_ICONS[route.name];
          if (Icon === undefined) {
            return null;
          }

          return (
            <TabBarItem
              key={route.key}
              Icon={Icon}
              label={descriptor.options.title ?? route.name}
              isActive={state.index === index}
              onPress={handleTabPress(
                route.key,
                route.name,
                state.index === index,
              )}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    shadowColor: "#000000",
    shadowOpacity: 0.38,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
});
