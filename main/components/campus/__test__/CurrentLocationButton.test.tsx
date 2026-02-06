import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Alert } from "react-native";

// Mock expo-location
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: () => mockRequestForegroundPermissionsAsync(),
  getCurrentPositionAsync: () => mockGetCurrentPositionAsync(),
  Accuracy: {
    Balanced: 3,
  },
}));

// Mock Alert
jest.spyOn(Alert, "alert");

import CurrentLocationButton from "../CurrentLocationButton";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CurrentLocationButton", () => {
  it("renders the location button", () => {
    const onLocationFound = jest.fn();
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={onLocationFound} />,
    );

    expect(getByTestId("currentLocationButton")).toBeTruthy();
  });

  it("requests location permission when pressed", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });
    mockGetCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 45.5, longitude: -73.6 },
    });

    const onLocationFound = jest.fn();
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={onLocationFound} />,
    );

    fireEvent.press(getByTestId("currentLocationButton"));

    await waitFor(() => {
      expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  it("calls onLocationFound with coordinates when permission granted", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });
    mockGetCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 45.5, longitude: -73.6 },
    });

    const onLocationFound = jest.fn();
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={onLocationFound} />,
    );

    fireEvent.press(getByTestId("currentLocationButton"));

    await waitFor(() => {
      expect(onLocationFound).toHaveBeenCalledWith({
        latitude: 45.5,
        longitude: -73.6,
      });
    });
  });

  it("shows alert when permission denied", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });

    const onLocationFound = jest.fn();
    const onPermissionDenied = jest.fn();
    const { getByTestId } = render(
      <CurrentLocationButton
        onLocationFound={onLocationFound}
        onPermissionDenied={onPermissionDenied}
      />,
    );

    fireEvent.press(getByTestId("currentLocationButton"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Location Permission Required",
        "Please enable location services in your device settings to use this feature.",
        [{ text: "OK" }],
      );
    });

    expect(onPermissionDenied).toHaveBeenCalled();
    expect(onLocationFound).not.toHaveBeenCalled();
  });

  it("shows alert when location fetch fails", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });
    mockGetCurrentPositionAsync.mockRejectedValueOnce(
      new Error("Location error"),
    );

    const onLocationFound = jest.fn();
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={onLocationFound} />,
    );

    fireEvent.press(getByTestId("currentLocationButton"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Location Error",
        "Unable to get your current location. Please try again.",
        [{ text: "OK" }],
      );
    });

    expect(onLocationFound).not.toHaveBeenCalled();
  });

  it("shows loading state while fetching location", async () => {
    // Create a promise that we can control
    let resolvePermission: (value: { status: string }) => void;
    const permissionPromise = new Promise<{ status: string }>((resolve) => {
      resolvePermission = resolve;
    });

    mockRequestForegroundPermissionsAsync.mockReturnValueOnce(permissionPromise);

    const onLocationFound = jest.fn();
    const { getByTestId, getByText } = render(
      <CurrentLocationButton onLocationFound={onLocationFound} />,
    );

    // Initially shows the location icon
    expect(getByText("◎")).toBeTruthy();

    // Press the button
    fireEvent.press(getByTestId("currentLocationButton"));

    // Should show loading state
    await waitFor(() => {
      expect(getByText("...")).toBeTruthy();
    });

    // Resolve the permission
    resolvePermission!({ status: "denied" });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});

describe("CurrentLocationButton - accessibility", () => {
  it("has correct accessibility attributes", () => {
    const onLocationFound = jest.fn();
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={onLocationFound} />,
    );

    const button = getByTestId("currentLocationButton");
    expect(button.props.accessibilityRole).toBe("button");
    expect(button.props.accessibilityLabel).toBe(
      "Center map on current location",
    );
  });
});
