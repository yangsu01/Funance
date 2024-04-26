import { ListGroup } from "react-bootstrap";

type Props = {
  items: string[];
};

function InfoList({ items }: Props) {
  return (
    <ListGroup>
      {items.map((item, index) => (
        <ListGroup.Item key={index}>{item}</ListGroup.Item>
      ))}
    </ListGroup>
  );
}

export default InfoList;
