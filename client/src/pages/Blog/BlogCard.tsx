import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";

type Props = {
  img: string;
  title: string;
  text: string | JSX.Element;
  link: string;
  footer: string;
};

const BlogCard = ({ img, title, text, link, footer }: Props) => {
  return (
    <Card>
      <Link to={link} className="text-white text-decoration-none">
        <Card.Body>
          <Card.Img variant="top" className="rounded" src={img} />

          <Card.Title>
            <h3 className="mt-3">
              <strong>{title}</strong>
            </h3>
          </Card.Title>

          <Card.Text>{text}</Card.Text>
        </Card.Body>
      </Link>

      <Card.Footer>{footer}</Card.Footer>
    </Card>
  );
};

export default BlogCard;
