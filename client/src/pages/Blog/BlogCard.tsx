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
    <Card className="blog-card">
      <Link to={link} className="text-white text-decoration-none">
        <Card.Body className="blog-card-body">
          <div className="blog-card-image-container">
            <Card.Img src={img} alt={title} className="blog-card-image" />
          </div>

          <div className="blog-card-text">
            <Card.Title>
              <h3 className="mt-3">
                <strong>{title}</strong>
              </h3>
            </Card.Title>
            <Card.Text>{text}</Card.Text>
          </div>
        </Card.Body>
      </Link>

      <Card.Footer>{footer}</Card.Footer>
    </Card>
  );
};

export default BlogCard;
