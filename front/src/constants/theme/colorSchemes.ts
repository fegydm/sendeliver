// front/src/constants/theme/colorSchemes.ts
export type ColorScheme = {
  clientColor: string;
  forwarderColor: string;
  carrierColor: string;
  name: string;
  description?: string;
};

export const COLOR_SCHEMES = {
  DEFAULT: {
    name: "Default",
    description: "Default color scheme for unregistered users",
    clientColor: "blue",
    forwarderColor: "green",
    carrierColor: "red",
  },
  TESTING: {
    name: "Testing",
    description: "Testing color scheme",
    clientColor: "purple",
    forwarderColor: "orange",
    carrierColor: "teal",
  },
} as const;
