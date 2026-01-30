import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, jest } from "@jest/globals";
import { Alert } from "react-native";
import { router } from "expo-router";
import WelcomeScreen from "@/app/(auth)/welcome";

describe("WelcomeScreen", () => {
  it("navigates to map when continuing as guest", () => {
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
