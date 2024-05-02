import { Row, Col, Button } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";

type Props = {
  title: string;
  subtitle: string;
  button?: string;
  onClick?: () => void;
};

const Title = ({ title, subtitle, button, onClick }: Props) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  return (
    <Row className="d-flex align-items-center border-bottom mb-4">
      <Col sm={12} md={9}>
        <h1 className="display-5 fw-bold text-white">{title}</h1>
        <h5>{subtitle}</h5>
      </Col>
      {button && (
        <Col
          sm={12}
          md={3}
          className={isSmallScreen ? "my-3" : "d-flex justify-content-end"}
        >
          <Button
            variant="outline-light"
            size="lg"
            style={{ minWidth: "100px" }}
            onClick={onClick}
          >
            {button}
          </Button>
        </Col>
      )}
    </Row>
  );
};

export default Title;
