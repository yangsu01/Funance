import { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import InfoCard from "../../components/UI/InfoCard";
import SubscribeLink from "../../components/SubscribeLink";
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

      <h5 className="mb-3">
        <SubscribeLink /> to be notified of new posts!
      </h5>

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
