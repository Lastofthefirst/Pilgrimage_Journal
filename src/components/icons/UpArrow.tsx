import { Component } from "solid-js";

interface IconProps {
  color?: string;
  size?: number;
}

const UpArrow: Component<IconProps> = (props) => {
  const color = () => props.color || "white";
  const size = () => props.size || 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color()}
      height={size()}
      width={size()}
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  );
};

export default UpArrow;
