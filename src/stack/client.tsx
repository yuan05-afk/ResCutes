import { HexclaveClientApp } from "@hexclave/next";

export const hexclaveClientApp = new HexclaveClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    default: {
      type: "hosted",
    },
    signIn: {
      type: "custom",
      url: "/login",
      version: 0,
    },
    afterSignOut: "/",
  },
});
