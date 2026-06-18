import { createTheme } from "@mantine/core";

export const appTheme = createTheme({
  primaryColor: "sage",
  colors: {
    sage: [
      "#eef6f0",
      "#dcebdd",
      "#b8d6bb",
      "#91c096",
      "#70ad77",
      "#5a9f63",
      "#4d9557",
      "#3e8348",
      "#34753f",
      "#286633"
    ],
    sand: [
      "#fdf8f0",
      "#f2e8d8",
      "#e4d0ac",
      "#d6b67f",
      "#cb9f57",
      "#c48f3e",
      "#c18831",
      "#ab7424",
      "#99671b",
      "#845811"
    ],
    earth: [
      "#f7f2ec",
      "#ece0d3",
      "#d8bea6",
      "#c39a76",
      "#b37c4d",
      "#aa6933",
      "#a15f26",
      "#8e4f1c",
      "#7f4618",
      "#703b12"
    ]
  },
  fontFamily: "'Aptos', 'Segoe UI', 'Inter', sans-serif",
  headings: {
    fontFamily: "'Aptos Display', 'Segoe UI', sans-serif",
    fontWeight: "700"
  },
  radius: {
    xs: "10px",
    sm: "14px",
    md: "18px",
    lg: "24px",
    xl: "30px"
  },
  spacing: {
    xs: "0.625rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.75rem"
  },
  shadows: {
    sm: "0 10px 24px rgba(57, 43, 17, 0.08)",
    md: "0 16px 36px rgba(57, 43, 17, 0.12)"
  },
  defaultRadius: "md",
  components: {
    Paper: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
        p: "lg",
        withBorder: true
      }
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
        padding: "lg",
        withBorder: true
      }
    },
    Button: {
      defaultProps: {
        radius: "xl"
      }
    },
    TextInput: {
      defaultProps: {
        radius: "md"
      }
    },
    NumberInput: {
      defaultProps: {
        radius: "md"
      }
    },
    Select: {
      defaultProps: {
        radius: "md"
      }
    },
    Textarea: {
      defaultProps: {
        radius: "md"
      }
    },
    Drawer: {
      defaultProps: {
        radius: "lg",
        overlayProps: { blur: 1.5, backgroundOpacity: 0.35 }
      }
    }
  }
});
