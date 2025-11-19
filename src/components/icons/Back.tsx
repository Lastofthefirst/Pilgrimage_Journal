import { Component } from "solid-js";

interface IconProps {
  color?: string;
  size?: number;
}

const Back: Component<IconProps> = (props) => {
  const color = () => props.color || "white";
  const size = () => props.size || 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke={color()}
      stroke-width="2"
      height={size()}
      width={size()}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
      />
    </svg>
  );
};

export default Back;
