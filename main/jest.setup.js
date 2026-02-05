/* eslint-env jest */
/* global jest */
import "@testing-library/jest-native/extend-expect";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
}));

/**
 * Mock expo-linear-gradient
 */
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const PropTypes = require("prop-types");
  const { View } = require("react-native");

  function LinearGradient({ children, ...props }) {
    return React.createElement(View, props, children);
  }

  LinearGradient.propTypes = {
    children: PropTypes.node,
  };

  return { LinearGradient };
});

/**
 * Mock react-native-maps
 * Expose animateToRegion as a stable spy so tests can assert calls.
 */
globalThis.__animateToRegionMock = jest.fn();

jest.mock("react-native-maps", () => {
  const React = require("react");
  const PropTypes = require("prop-types");
  const { View } = require("react-native");

  const MockMapView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: globalThis.__animateToRegionMock,
    }));

    // IMPORTANT: render children so <Polygon /> etc appear in the tree
    return React.createElement(View, props, props.children);
  });

  MockMapView.displayName = "MockMapView";
  MockMapView.propTypes = {
    children: PropTypes.node,
  };

  const MockPolygon = (props) =>
    React.createElement(View, props, props.children);
  MockPolygon.propTypes = {
    children: PropTypes.node,
  };

  const MockMarker = (props) =>
    React.createElement(View, props, props.children);
  MockMarker.propTypes = {
    children: PropTypes.node,
  };

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
    Polygon: MockPolygon,
    Marker: MockMarker,
  };
});
// ---- Test mocks for Reanimated + Bottom Sheet ----
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  // Workaround for: "Cannot read properties of undefined (reading 'call')"
  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View, ScrollView } = require("react-native");

  const BottomSheet = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      snapToIndex: jest.fn(),
      expand: jest.fn(),
      close: jest.fn(),
      collapse: jest.fn(),
      forceClose: jest.fn(),
    }));

    return <View {...props} />;
  });

  const BottomSheetScrollView = React.forwardRef((props, ref) => {
    return <ScrollView ref={ref} {...props} />;
  });

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetScrollView,
  };
});


