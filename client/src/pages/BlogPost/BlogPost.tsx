import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Col, Row, Card } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import BlogPostParser from "./BlogPostParser";
import SubscribeLink from "../../components/SubscribeLink";
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
    funanceBlogPostCollection (order: sys_firstPublishedAt_DESC, limit: 5) {
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
          subtitle="Posts on Everything Quantitative Finance!"
        />
        <Loading />
      </>
    );
  }

  return (
    <>
      <Title
        title={blogPost.title}
        subtitle={`Uploaded On: ${formatDatetime(
          blogPost.sys.firstPublishedAt
        )}`}
      />

      <Row className="d-flex justify-content-center">
        <Col md={9}>
          <BlogPostParser
            content={blogPost.body.json}
            links={blogPost.body.links}
          />
        </Col>

        <Col md={3}>
          <div className="sticky-card">
            <Card>
              <Card.Header className="text-center">
                <h4>My Latest Posts</h4>
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
                          <h5 className="mb-3">- {post.title}</h5>
                        </Link>
                      </div>
                    )
                )}
              </Card.Body>
            </Card>

            <h5 className="mt-4 text-center">
              Like what you're reading? <SubscribeLink /> to be notified of new
              posts! (Its FREE)
            </h5>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default BlogPost;
