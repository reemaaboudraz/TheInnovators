import React from "react";
import { render } from "@testing-library/react-native";
import { describe, it, expect, jest } from "@jest/globals";

// prefix with mock
const mockUseColorScheme = jest.fn(() => "light");

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

// Fix RNGestureHandlerModule.install crash
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    GestureHandlerRootView: ({ children }: any) => (
      <View testID="ghRoot">{children}</View>
    ),
  };
});
jest.mock("react-native-gesture-handler/jestSetup", () => ({}));

jest.mock("@react-navigation/native", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    DarkTheme: { dark: true, colors: { background: "black" } },
    DefaultTheme: { dark: false, colors: { background: "white" } },
    ThemeProvider: ({ children }: any) => (
      <View testID="themeProvider">{children}</View>
    ),
  };
});

// ✅ IMPORTANT: expo-router Stack must include Stack.Screen
jest.mock("expo-router", () => {
  const React = require("react");
  const { View } = require("react-native");

  const Stack: any = ({ children }: any) => (
    <View testID="stack">{children}</View>
  );

  Stack.Screen = ({ name }: any) => (
    <View testID={`stack-screen-${name ?? "unknown"}`} />
  );

  return {
    __esModule: true,
    Stack,
  };
});

import Layout from "../_layout";

describe("Root layout", () => {
  it("renders", () => {
    const { getByTestId } = render(<Layout />);
    expect(getByTestId("stack")).toBeTruthy();
  });
});
