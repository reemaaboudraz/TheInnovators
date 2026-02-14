import React from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

type Props = {
    startText: string;
    endText: string;
    activeField: "start" | "end";
    onChangeStartText: (text: string) => void;
    onChangeEndText: (text: string) => void;
    onFocusStart: () => void;
    onFocusEnd: () => void;
    onSwap: () => void;
};

export default function NavigationSearchCard({
                                                 startText,
                                                 endText,
                                                 activeField,
                                                 onChangeStartText,
                                                 onChangeEndText,
                                                 onFocusStart,
                                                 onFocusEnd,
                                                 onSwap,
                                             }: Props) {
    const isStartActive = activeField === "start";
    const isEndActive = activeField === "end";

    return (
        <View style={styles.card}>
            {/* Left Figma-style vertical icon stack */}
            <View style={styles.leftIcons}>
                <Pressable onPress={onFocusStart} hitSlop={8} style={styles.iconTap}>
                    <Ionicons
                        name="ellipse-outline"
                        size={34}
                        color={isStartActive ? "#000000" : "#1F1F1F"}
                    />
                </Pressable>

                {/* dotted connector */}
                <View style={styles.dotsColumn} pointerEvents="none">
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>

                <Pressable onPress={onFocusEnd} hitSlop={8} style={styles.iconTap}>
                    {/* use the requested pin icon */}
                    <Ionicons
                        name="location-outline"
                        size={36}
                        color={isEndActive ? "#C43127" : "#C43127"}
                    />
                </Pressable>
            </View>

            {/* Inputs column */}
            <View style={styles.inputsCol}>
                <Pressable onPress={onFocusStart} style={styles.inputPressable}>
                    <TextInput
                        value={startText}
                        onChangeText={onChangeStartText}
                        onFocus={onFocusStart}
                        placeholder="Enter your starting location"
                        placeholderTextColor="#9A9AA0"
                        style={[styles.input, isStartActive && styles.inputActive]}
                    />
                </Pressable>

                <Pressable onPress={onFocusEnd} style={styles.inputPressable}>
                    <TextInput
                        value={endText}
                        onChangeText={onChangeEndText}
                        onFocus={onFocusEnd}
                        placeholder="Enter your destination"
                        placeholderTextColor="#9A9AA0"
                        style={[styles.input, isEndActive && styles.inputActive]}
                    />
                </Pressable>
            </View>

            {/* Swap icon (black, figma-like) */}
            <Pressable onPress={onSwap} style={styles.swapButton} hitSlop={10}>
                <MaterialIcons name="swap-vert" size={34} color="#101114" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.97)",
        minHeight: 118,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
    },

    leftIcons: {
        width: 40,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 6,
    },

    iconTap: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
    },

    dotsColumn: {
        height: 18,
        width: 8,
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 2,
    },

    dot: {
        width: 5,
        height: 5,
        borderRadius: 1,
        backgroundColor: "#000000",
    },

    inputsCol: {
        flex: 1,
        justifyContent: "center",
        gap: 8,
    },

    inputPressable: {
        borderRadius: 18,
    },

    input: {
        height: 42,
        borderRadius: 16,
        backgroundColor: "#ECECEE",
        paddingHorizontal: 14,
        fontSize: 34 / 2, // 17
        fontWeight: "500",
        color: "#2D2E34",
    },

    inputActive: {
        borderWidth: 1,
        borderColor: "#CFCFD6",
    },

    swapButton: {
        width: 38,
        height: 90,
        marginLeft: 8,
        alignItems: "center",
        justifyContent: "center",
    },
});
