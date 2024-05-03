import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Col, Row, Card } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
// hooks
import useFetch from "../../hooks/useFetch";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { BlogPostData } from "../../utils/types";

const BlogPost = () => {
  const [blogPostData, setBlogPostData] = useState<BlogPostData>(
    {} as BlogPostData
  );

  let { blogTitle } = useParams();
  const navigate = useNavigate();
  const { fetchData, loading } = useFetch<BlogPostData>();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    fetchData(`/blog/${blogTitle}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setBlogPostData(res.data);
      }
    });
  }, [blogTitle]);

  if (loading || !blogPostData.blogData) {
    return (
      <>
        {/* page title */}
        <Title
          title="Funance Blog"
          subtitle="Weekly Blog Posts!"
          button="Back"
          onClick={() => navigate(-1)}
        />
        <Loading />
      </>
    );
  }

  return (
    <>
      <Title
        title={blogPostData.blogData.title}
        subtitle={`Created on: ${blogPostData.blogData.creationDate}`}
        button="Back"
        onClick={() => navigate(-1)}
      />

      <Row className="d-flex justify-content-center">
        <Col md={7}>
          <div
            dangerouslySetInnerHTML={{
              __html: blogPostData.blogData.content,
            }}
          ></div>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Header className="text-center">
              <h4>Other Blog Posts</h4>
            </Card.Header>
            <Card.Body>
              {blogPostData.blogCatalog.map((post) => (
                <div key={post.fileName}>
                  <Link to={`/blog/${post.fileName}`} className="text-white">
                    <h5 className="mx-3">{post.title}</h5>
                  </Link>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BlogPost;
