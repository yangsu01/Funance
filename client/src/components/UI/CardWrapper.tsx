import React from "react";
import { Card } from "react-bootstrap";

type Props = {
  children: React.ReactNode;
  className?: string;
};
const CardWrapper = ({ children, className = "" }: Props) => {
  return (
    <Card className={className}>
      <Card.Body>{children}</Card.Body>
    </Card>
  );
};

export default CardWrapper;
