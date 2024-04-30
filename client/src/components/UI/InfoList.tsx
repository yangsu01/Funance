import { ListGroup } from "react-bootstrap";

type Props = {
  items: string[];
};

const InfoList = ({ items }: Props) => {
  return (
    <ListGroup>
      {items.map((item, index) => (
        <ListGroup.Item key={index}>{item}</ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default InfoList;
