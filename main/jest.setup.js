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
