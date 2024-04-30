import { Accordion } from "react-bootstrap";

type Props = {
  header: string;
  children: React.ReactNode;
  open?: boolean;
};

const AccordionCard = ({ header, children, open = true }: Props) => {
  const defaultActiveKey = open ? ["0"] : [];

  return (
    <Accordion className="mb-3" defaultActiveKey={defaultActiveKey} alwaysOpen>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <strong>{header}</strong>
        </Accordion.Header>
        <Accordion.Body>{children}</Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default AccordionCard;
