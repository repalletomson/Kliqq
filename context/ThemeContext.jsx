"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme, Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define theme colors
export const lightTheme = {
  background: "#FFFFFF",
  surface: "#F8F9FA",
  surfaceVariant: "#F0F0F0",
  primary: "#000000",
  secondary: "#333333",
  accent: "#555555",
  text: "#000000",
  textSecondary: "#555555",
  textTertiary: "#777777",
  border: "#E0E0E0",
  inputBackground: "#F5F5F5",
  statusBar: "dark-content",
  card: "#FFFFFF",
  bubbleSent: "#E8E8E8",
  bubbleReceived: "#FFFFFF",
  icon: "#333333",
  separator: "#EEEEEE",
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FF9800",
  info: "#2196F3",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "#000000",
};

export const darkTheme = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceVariant: "#252525",
  primary: "#FFFFFF",
  secondary: "#CCCCCC",
  accent: "#AAAAAA",
  text: "#FFFFFF",
  textSecondary: "#CCCCCC",
  textTertiary: "#999999",
  border: "#333333",
  inputBackground: "#2A2A2A",
  statusBar: "light-content",
  card: "#1E1E1E",
  bubbleSent: "#2A2A2A",
  bubbleReceived: "#1E1E1E",
  icon: "#CCCCCC",
  separator: "#333333",
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FF9800",
  info: "#2196F3",
  overlay: "rgba(0, 0, 0, 0.7)",
  shadow: "#000000",
};

const ThemeContext = createContext({
  isDark: false,
  colors: lightTheme,
  setScheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceColorScheme === "dark");

  useEffect(() => {
    loadThemePreference();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem("userThemePreference").then((preference) => {
        if (!preference || preference === "system") {
          setIsDark(colorScheme === "dark");
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const preference = await AsyncStorage.getItem("userThemePreference");
      if (preference === "dark") {
        setIsDark(true);
      } else if (preference === "light") {
        setIsDark(false);
      } else {
        setIsDark(deviceColorScheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
      setIsDark(deviceColorScheme === "dark");
    }
  };

  const setScheme = (scheme) => {
    if (scheme === "system") {
      setIsDark(deviceColorScheme === "dark");
      AsyncStorage.setItem("userThemePreference", "system");
    } else {
      setIsDark(scheme === "dark");
      AsyncStorage.setItem("userThemePreference", scheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors: isDark ? darkTheme : lightTheme,
        setScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
