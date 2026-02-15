/* eslint-disable import/first */
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockHasServicesEnabledAsync = jest.fn();
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetLastKnownPositionAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

jest.mock("expo-location", () => ({
  hasServicesEnabledAsync: () => mockHasServicesEnabledAsync(),
  requestForegroundPermissionsAsync: () =>
    mockRequestForegroundPermissionsAsync(),
  getLastKnownPositionAsync: () => mockGetLastKnownPositionAsync(),
  getCurrentPositionAsync: (opts: any) => mockGetCurrentPositionAsync(opts),
  Accuracy: { Balanced: 3 },
}));

import {
  ensureLocationReady,
  requestForegroundPermission,
  getDeviceLocation,
  LocationError,
} from "@/components/campus/helper_methods/locationUtils";

describe("locationUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ensureLocationReady throws SERVICES_OFF when services are disabled", async () => {
    // @ts-ignore
    mockHasServicesEnabledAsync.mockResolvedValueOnce(false);

    await expect(ensureLocationReady()).rejects.toBeInstanceOf(LocationError);
    await expect(ensureLocationReady()).rejects.toMatchObject({
      code: "SERVICES_OFF",
    });
  });

  it("ensureLocationReady resolves when services are enabled", async () => {
    // @ts-ignore
    mockHasServicesEnabledAsync.mockResolvedValueOnce(true);
    await expect(ensureLocationReady()).resolves.toBeUndefined();
  });

  it("requestForegroundPermission throws PERMISSION_DENIED when not granted", async () => {
    // @ts-ignore
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });

    await expect(requestForegroundPermission()).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });
  });

  it("requestForegroundPermission resolves when granted", async () => {
    // @ts-ignore
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });

    await expect(requestForegroundPermission()).resolves.toBeUndefined();
  });

  it("getDeviceLocation returns last known coords when available", async () => {
    // @ts-ignore
    mockHasServicesEnabledAsync.mockResolvedValueOnce(true);
    // @ts-ignore
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });

    // @ts-ignore
    mockGetLastKnownPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 45.49, longitude: -73.58 },
    });

    const res = await getDeviceLocation();

    expect(res).toEqual({ latitude: 45.49, longitude: -73.58 });
    expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("getDeviceLocation falls back to getCurrentPositionAsync when last known is null", async () => {
    // @ts-ignore
    mockHasServicesEnabledAsync.mockResolvedValueOnce(true);
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

    const res = await getDeviceLocation();

    expect(mockGetCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: 3,
    });
    expect(res).toEqual({ latitude: 45.5, longitude: -73.6 });
  });

  it("getDeviceLocation throws UNKNOWN when getCurrentPositionAsync fails", async () => {
    // @ts-ignore
    mockHasServicesEnabledAsync.mockResolvedValueOnce(true);
    // @ts-ignore
    mockRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "granted",
    });

    // @ts-ignore
    mockGetLastKnownPositionAsync.mockResolvedValueOnce(null);
    // @ts-ignore
    mockGetCurrentPositionAsync.mockRejectedValueOnce(new Error("boom"));

    await expect(getDeviceLocation()).rejects.toMatchObject({
      code: "UNKNOWN",
    });
  });
});
