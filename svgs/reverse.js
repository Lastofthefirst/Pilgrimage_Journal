import React from "react";
import SVG, { Path } from "react-native-svg";

export default function reverse({ color = "white", hw = 24 }) {
  return (
    <SVG
      xmlns="http://www.w3.org/2000/SVG"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke={color}
      height={hw}
      width={hw}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
      />
    </SVG>
  );
}
