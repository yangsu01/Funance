import { Link } from "react-router-dom";
import { Card, ListGroup } from "react-bootstrap";

type Props = {
  header?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  infoList?: string[];
  link?: string;
  footer?: string;
};

const GameCard = ({
  header,
  title,
  subtitle,
  text,
  infoList,
  link,
  footer,
}: Props) => {
  return (
    <Card>
      {header && (
        <Card.Header>
          <strong>{header}</strong>
        </Card.Header>
      )}

      <Card.Body>
        {title && (
          <Card.Title>
            {link ? (
              <Link to={link} className="text-white">
                <h4>{title}</h4>
              </Link>
            ) : (
              <h4>{title}</h4>
            )}
          </Card.Title>
        )}

        {subtitle && (
          <Card.Subtitle className="pb-3 text-muted">{subtitle}</Card.Subtitle>
        )}

        {text && <Card.Text>{text}</Card.Text>}

        {infoList && (
          <ListGroup>
            {infoList.map((item, index) => (
              <ListGroup.Item key={index}>{item}</ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {footer && <Card.Footer>{footer}</Card.Footer>}
      </Card.Body>
    </Card>
  );
};

export default GameCard;
