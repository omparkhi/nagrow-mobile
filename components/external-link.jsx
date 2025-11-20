import React from "react";
import { Link } from "expo-router";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";

export function ExternalLink({ href, ...rest }) {
  const handlePress = async (event) => {
    if (process.env.EXPO_OS !== "web") {
      // Prevent default navigation
      event.preventDefault();
      // Open the link in an in-app browser
      await openBrowserAsync(href, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    }
  };

  return <Link target="_blank" {...rest} href={href} onPress={handlePress} />;
}
