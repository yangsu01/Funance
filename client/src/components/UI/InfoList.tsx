import React from "react";
import { ListGroup } from "react-bootstrap";

type Props = {
  items: string[];
};

const InfoList: React.FC<Props> = ({ items }) => {
  return (
    <ListGroup>
      {items.map((item, index) => (
        <ListGroup.Item key={index}>{item}</ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default InfoList;
