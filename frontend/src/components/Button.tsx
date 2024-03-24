import React from "react";

interface Props {
  children: React.ReactNode;
  color?: "outline-light" | "success" | "primary" | "danger";
  onClick: () => void;
}

const Button = ({ children, color = "success", onClick }: Props) => {
  return (
    <button className={"btn btn-" + color} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
