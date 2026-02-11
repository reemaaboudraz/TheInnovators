import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, jest } from "@jest/globals";
import { Alert } from "react-native";
import WelcomeScreen from "@/components/Welcome/WelcomeScreen";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("@/hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({
    signInWithGoogle: jest.fn(), // no Alert here
  }),
}));

describe("WelcomeScreen", () => {
  it("navigates to map when continuing as guest", () => {
    const { router } = require("expo-router");
    const { getByText } = render(<WelcomeScreen />);

    fireEvent.press(getByText("Continue without signing in"));
    expect(router.replace).toHaveBeenCalledWith("/(tabs)/map");
  });

  it("shows alert when Google sign-in pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const { getByText } = render(<WelcomeScreen />);

    fireEvent.press(getByText("Sign in with Google"));
    expect(alertSpy).toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
