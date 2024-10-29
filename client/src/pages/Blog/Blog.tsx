import { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import InfoCard from "../../components/UI/InfoCard";
import SubscribeLink from "../../components/SubscribeLink";
import AccordionCard from "../../components/UI/AccordionCard";
// hooks
import useGraphQL from "../../hooks/useGraphQL";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { BlogItem, BlogListData } from "../../utils/types";
// utils
import formatDatetime from "../../utils/formatDatetime";

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
          subtitle="Blog Posts on Everything Quantitative Finance!"
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
        subtitle="Blog Posts on Everything Quantitative Finance!"
      />

      <Row>
        <Col md={12} className="mb-4">
          <AccordionCard header="Welcome to Funance Blog">
            <>
              <figure className="text-center">
                <blockquote className="blockquote">
                  <i>
                    "Any intelligent fool can make things bigger and more
                    complex... It takes a touch of genius and a lot of courage
                    to move in the opposite direction."
                  </i>
                </blockquote>
                <figcaption className="blockquote-footer">
                  E.F. Schumacher
                </figcaption>
              </figure>
              <p className="fs-5">
                Inspired by the quote above, I strive to break down topics in
                quantitative finance, exploring theories and demonstrating how
                they can be applied to our own investment portfolios. Each post
                includes real-world examples and visualizations. A baseline
                understanding of calculus and probability theory is recommended.
              </p>
              <p className="fs-5 text-center">
                <SubscribeLink /> to be notified of new posts.
              </p>
            </>
          </AccordionCard>
        </Col>
        {blogCatalog.map((blog, index) => (
          <Col key={index} md={6} className="mb-4">
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
