import React from "react";
import SVG, { Path } from "react-native-svg";

export default function Info({ color = "white", hw = 24 }) {
  return (
    <SVG
      xmlns="http://www.w3.org/2000/SVG"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
      height={hw}
      width={hw}
      strokeWidth={2}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </SVG>
  );
}
