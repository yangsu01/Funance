import { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import InfoCard from "../../components/UI/InfoCard";
// hooks
import useGraphQL from "../../hooks/useGraphQL";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { BlogItem, BlogListData } from "../../utils/types";
// utils
import formatDatetime from "../../utils/formatDatetime";
// constants
import { EMAIL_FORM } from "../../utils/constants";

const Blog = () => {
  const [blogCatalog, setBlogCatalog] = useState<BlogItem[] | null>(null);

  const showAlert = useShowAlert();
  const { loading, fetchContent } = useGraphQL<BlogListData>();

  const query = `{
    funanceBlogPostCollection (order: sys_firstPublishedAt_DESC) {
      items {
        sys {
          id
          publishedAt
          firstPublishedAt
        }
        route
        title
        description
      }
    }
  }`;

  // on page load
  useEffect(() => {
    fetchContent(query).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setBlogCatalog(res.data.funanceBlogPostCollection.items);
      }
    });
  }, []);

  if (loading || !blogCatalog) {
    return (
      <>
        {/* page title */}
        <Title
          title="Funance Blog"
          subtitle="Weekly Posts on Quantitative Finance!"
        />
        <Loading />
      </>
    );
  }

  return (
    <>
      {/* page title */}
      <Title
        title="Funance Blog"
        subtitle="Weekly Posts on Quantitative Finance!"
      />

      <Row className="mb-3">
        <Link to={EMAIL_FORM} className="text-white text-center">
          <h5>
            <strong>
              Subscribe to be notified whenever a new post is uploaded!
            </strong>
          </h5>
        </Link>
      </Row>

      <Row>
        {blogCatalog.map((blog, index) => (
          <Col key={index} md={4} className="mb-4">
            <InfoCard
              footer={`Uploaded On: ${formatDatetime(
                blog.sys.firstPublishedAt
              )}`}
              title={blog.title}
              text={blog.description}
              link={`/blog/${blog.sys.id}/${blog.route}`}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Blog;
