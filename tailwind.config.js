/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        base: "#070810",
        elevated: "#101221",
        surface: "rgba(246,247,255,0.055)",
        "surface-strong": "rgba(246,247,255,0.105)",
        line: "rgba(190,196,255,0.14)",
        ink: "#F7F8FF",
        muted: "#A7ADC4",
        faint: "#6B728F",
        primary: "#7667F8",
        "primary-strong": "#A89DFF",
        "primary-dim": "#24204E",
        accent: "#5AD7FF",
        sky: "#8AB9F2",
        gold: "#E9C98B",
        success: "#51D6A3",
        danger: "#FF7485",
        warning: "#F5C76B",
      },
      fontFamily: {
        "inter-regular": ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
        "inter-extrabold": ["Inter_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
