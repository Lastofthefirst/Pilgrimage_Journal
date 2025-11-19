import React from "react";
import SVG, { Path, Svg } from "react-native-svg";

export default function Share({ color = "white", hw = 24 }) {
  return (
    <SVG
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
      height={hw}
      width={hw}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </SVG>
  );
}
