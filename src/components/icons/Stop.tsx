import { Component } from "solid-js";

interface IconProps {
  color?: string;
  size?: number;
}

const Stop: Component<IconProps> = (props) => {
  const color = () => props.color || "white";
  const size = () => props.size || 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 20 20"
      fill={color()}
      height={size()}
      width={size()}
    >
      <path
        fill-rule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
        clip-rule="evenodd"
      />
    </svg>
  );
};

export default Stop;
