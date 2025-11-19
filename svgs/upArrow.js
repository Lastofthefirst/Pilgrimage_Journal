import React from "react";
import SVG, { Path } from "react-native-svg";

export default function UpArrow({ color = "white", hw = 24 }) {
  return (
    <SVG
      xmlns="http://www.w3.org/2000/SVG"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
      height={hw}
      width={hw}
      stroke-width="2"
    >
      <Path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </SVG>
  );
}
