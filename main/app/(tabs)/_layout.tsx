import { Tabs } from "expo-router";
import React from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";

const MapTabIcon = ({ color }: { color: string }) => (
  <IconSymbol size={28} name="paperplane.fill" color={color} />
);

export default function TabLayout() {

  return (
      <Tabs
          screenOptions={{
              headerShown: false,
              tabBarStyle: { display: "none" },
              tabBarButton: () => null, // forces hiding the tab item completely
          }}
      >
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: MapTabIcon,
        }}
      />
    </Tabs>
  );
}
