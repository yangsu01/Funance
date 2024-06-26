import { Link } from "react-router-dom";

// components
import Title from "../../components/UI/Title";
import SubscribeLink from "../../components/SubscribeLink";

const Home = () => {
  return (
    <div className="home-container">
      <Title title="Welcome to Funance" subtitle="Investing is fun!" />
      <p className="fs-5">
        Join me on my journey of learning about quantitative finance! Be sure to
        Check out my latest <strong>Weekly blog</strong> posts uploaded on{" "}
        <Link to="/blog" className="text-white">
          Funance Blog
        </Link>{" "}
        where I explore different applications of math and data science in
        finance.
      </p>
      <p className="fs-5">
        Want to test the waters and try out a new investing strategy?
        Create/join a lobby and start trading in the{" "}
        <strong>Portfolio Simulator</strong>: Compete against others (or
        yourself) to see who can make the most money in a set amount of time!
        All prices are based on real-time stock data. check out the{" "}
        <Link to="/game-rules" className="text-white">
          Game Rules
        </Link>{" "}
        to get started. Want to see all the ongoing games? Head over to the{" "}
        <Link to="/games" className="text-white">
          Game List
        </Link>{" "}
        for a preview.
      </p>

      <p className="fs-5">
        This just in: you can now <SubscribeLink /> to Funance Blog (for FREE)
        and be the first to know when a new post is uploaded!
      </p>
    </div>
  );
};

export default Home;
