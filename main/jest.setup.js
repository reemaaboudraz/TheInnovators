import "@testing-library/jest-native/extend-expect";

// Mock expo-router
jest.mock("expo-router", () => ({
    router: {
        replace: jest.fn(),
        push: jest.fn(),
        back: jest.fn(),
    },
}));

// Mock react-native-maps
jest.mock("react-native-maps", () => {
    const React = require("react");
    const { View } = require("react-native");

    const MockMapView = React.forwardRef((props, ref) => {
        React.useImperativeHandle(ref, () => ({
            animateToRegion: jest.fn(),
        }));
        return <View testID="mapView" {...props} />;
    });

    return {
        __esModule: true,
        default: MockMapView,
        PROVIDER_GOOGLE: "google",
    };
});
