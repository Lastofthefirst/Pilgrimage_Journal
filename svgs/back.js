import React from "react";
import SVG, { Path } from "react-native-svg";

export default function addNote({ color = "white", hw = 24 }) {
  return (
    <SVG
      xmlns="http://www.w3.org/2000/SVG"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
      strokeWidth={2}
      height={hw}
      width={hw}
>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
      />
    </SVG>
  );
}
