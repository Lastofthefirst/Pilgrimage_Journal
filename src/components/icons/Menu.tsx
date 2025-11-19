import { Component } from "solid-js";

interface IconProps {
  color?: string;
  size?: number;
}

const Menu: Component<IconProps> = (props) => {
  const color = () => props.color || "white";
  const size = () => props.size || 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
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
        d="M4 6h16M4 12h16M4 18h7"
      />
    </svg>
  );
};

export default Menu;
