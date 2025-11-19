import React from "react";
import SVG, { Path } from "react-native-svg";

export default function Menu({ color = "white", hw = 24 }) {
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
        d="M4 6h16M4 12h16M4 18h7"
      />
    </SVG>
  );
}
