import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Col, Row, Card } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import BlogPostParser from "./BlogPostParser";
// hooks
import useGraphQL from "../../hooks/useGraphQL";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { BlogPostData, BlogData, BlogItem } from "../../utils/types";
// utils
import formatDatetime from "../../utils/formatDatetime";

const BlogPost = () => {
  const [blogPost, setBlogPost] = useState<BlogData | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogItem[] | null>(null);

  let { blogId, blogTitle } = useParams();
  const navigate = useNavigate();
  const showAlert = useShowAlert();
  const { loading, fetchContent } = useGraphQL<BlogPostData>();

  const query = `{
    funanceBlogPost(id: "${blogId}") {
      title
      sys {
        publishedAt
        firstPublishedAt
      }
      description
      body {
        json
        links {
          assets {
            block {
              sys {
                id
              }
              url
              title
              width
              height
              description
            }
          }
        }
      }
    }
    funanceBlogPostCollection {
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
        setBlogPost(res.data.funanceBlogPost);
        setRelatedBlogs(res.data.funanceBlogPostCollection.items);
      }
    });
  }, [blogId]);

  if (loading || !blogPost || !relatedBlogs) {
    return (
      <>
        {/* page title */}
        <Title
          title={blogTitle ? blogTitle : "Funance Blog"}
          subtitle="Weekly Blog Posts!"
        />
        <Loading />
      </>
    );
  }

  return (
    <>
      <Title
        title={blogPost.title}
        subtitle={`Updated: ${formatDatetime(blogPost.sys.publishedAt)}`}
      />

      <Row className="d-flex justify-content-center">
        <Col md={9}>
          <BlogPostParser
            content={blogPost.body.json}
            links={blogPost.body.links}
          />
        </Col>

        <Col md={3}>
          <Card>
            <Card.Header className="text-center">
              <h4>Other Blog Posts</h4>
            </Card.Header>
            <Card.Body>
              {relatedBlogs.map(
                (post) =>
                  post.route !== blogTitle && (
                    <div key={post.route}>
                      <Link
                        to={`/blog/${post.sys.id}/${post.route}`}
                        className="link"
                      >
                        <h5 className="mb-3">{post.title}</h5>
                      </Link>
                    </div>
                  )
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BlogPost;
