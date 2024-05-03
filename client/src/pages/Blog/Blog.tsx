import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Row } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import InfoCard from "../../components/UI/InfoCard";
// hooks
import useFetch from "../../hooks/useFetch";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { BlogCard } from "../../utils/types";

const Blog = () => {
  const [blogCard, setBlogCard] = useState<BlogCard[]>([] as BlogCard[]);

  const navigate = useNavigate();
  const { fetchData, loading } = useFetch<BlogCard[]>();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    fetchData("/blog-list").then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setBlogCard(res.data);
      }
    });
  }, []);

  if (loading || !blogCard) {
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
      {/* page title */}
      <Title
        title="Funance Blog"
        subtitle="Weekly Blog Posts!"
        button="Back"
        onClick={() => navigate(-1)}
      />

      <Row md={3}>
        {blogCard.map((blog, index) => (
          <Col key={index} className="mb-4">
            <InfoCard
              footer={`Updated: ${blog.date}`}
              title={blog.title}
              text={blog.description}
              link={`/blog/${blog.fileName}`}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Blog;
