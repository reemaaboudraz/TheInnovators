/* eslint-disable import/first */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Alert } from "react-native";

const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
const mockGetLastKnownPositionAsync = jest.fn();

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: () =>
    mockRequestForegroundPermissionsAsync(),
  getCurrentPositionAsync: () => mockGetCurrentPositionAsync(),
  getLastKnownPositionAsync: () => mockGetLastKnownPositionAsync(),
  Accuracy: {
    Balanced: 3,
    Low: 2,
  },
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Import AFTER mocks
import CurrentLocationButton from "../CurrentLocationButton";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CurrentLocationButton", () => {
  it("renders the location button", () => {
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={jest.fn()} />,
    );

    expect(getByTestId("currentLocationButton")).toBeTruthy();
  });

  it("requests location permission when pressed", async () => {
    // @ts-ignore
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });
    // @ts-ignore
    mockGetLastKnownPositionAsync.mockResolvedValueOnce(null);
    // @ts-ignore
    mockGetCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 45.5, longitude: -73.6 },
    });

    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={jest.fn()} />,
    );

    fireEvent.press(getByTestId("currentLocationButton"));

    await waitFor(() => {
      expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onLocationFound with last known position when available", async () => {
    // @ts-ignore
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });
    // @ts-ignore
    mockGetLastKnownPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 45.49, longitude: -73.58 },
    });

    const onLocationFound = jest.fn();
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={onLocationFound} />,
    );

    fireEvent.press(getByTestId("currentLocationButton"));

    await waitFor(() => {
      expect(onLocationFound).toHaveBeenCalledWith({
        latitude: 45.49,
        longitude: -73.58,
      });
    });

    expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("falls back to getCurrentPositionAsync when last known is null", async () => {
    // @ts-ignore
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });
    // @ts-ignore
    mockGetLastKnownPositionAsync.mockResolvedValueOnce(null);
    // @ts-ignore
    mockGetCurrentPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 45.5, longitude: -73.6 },
    });

    const onLocationFound = jest.fn();
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={onLocationFound} />,
    );

    fireEvent.press(getByTestId("currentLocationButton"));

    await waitFor(() => {
      expect(mockGetLastKnownPositionAsync).toHaveBeenCalledTimes(1);
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(1);
      expect(onLocationFound).toHaveBeenCalledWith({
        latitude: 45.5,
        longitude: -73.6,
      });
    });
  });

  it("shows alert + calls onPermissionDenied when permission denied", async () => {
    // @ts-ignore
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

    expect(onPermissionDenied).toHaveBeenCalledTimes(1);
    expect(onLocationFound).not.toHaveBeenCalled();
  });

  it("shows alert when location fetch fails", async () => {
    // @ts-ignore
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });
    // @ts-ignore
    mockGetLastKnownPositionAsync.mockResolvedValueOnce(null);
    // @ts-ignore
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

  it("sets accessibilityState.busy=true while fetching location", async () => {
    let resolvePermission!: (value: { status: string }) => void;

    const permissionPromise = new Promise<{ status: string }>((resolve) => {
      resolvePermission = resolve;
    });

    mockRequestForegroundPermissionsAsync.mockReturnValueOnce(
      permissionPromise,
    );

    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={jest.fn()} />,
    );

    // before press: not busy
    expect(
      getByTestId("currentLocationButton").props.accessibilityState,
    ).toEqual({ busy: false });

    fireEvent.press(getByTestId("currentLocationButton"));

    // after press: busy
    await waitFor(() => {
      expect(
        getByTestId("currentLocationButton").props.accessibilityState,
      ).toEqual({ busy: true });
    });

    // resolve to let the component proceed and finish
    resolvePermission({ status: "denied" });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  it("has correct accessibility attributes", () => {
    const { getByTestId } = render(
      <CurrentLocationButton onLocationFound={jest.fn()} />,
    );

    const button = getByTestId("currentLocationButton");
    expect(button.props.accessibilityRole).toBe("button");
    expect(button.props.accessibilityLabel).toBe(
      "Center map on current location",
    );
  });
});
