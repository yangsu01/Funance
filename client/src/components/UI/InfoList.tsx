import { ListGroup } from "react-bootstrap";

type Props = {
  items: string[];
  links?: string[];
  breakpoint?: "sm" | "md" | "lg" | "xl";
};

const InfoList = ({ items, links, breakpoint }: Props) => {
  return (
    <>
      {links ? (
        <ListGroup horizontal={breakpoint}>
          {items.map((item, index) => (
            <ListGroup.Item
              key={index}
              action
              href={links[index]}
              target="_blank"
            >
              {item}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <ListGroup horizontal={breakpoint}>
          {items.map((item, index) => (
            <ListGroup.Item key={index}>{item}</ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  );
};

export default InfoList;
