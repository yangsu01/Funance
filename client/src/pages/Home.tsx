import Button from "../components/Button";

const Home = () => {
  return (
    <div className="px-4 py-5 text-center">
      <h1 className="display-5 fw-bold text-white">
        <strong>Welcome to Funance</strong>
      </h1>

      <div className="col-lg-6 mx-auto mt-5">
        <p className="fs-5">
          Join me on my journey of learning about quantitative finance and check
          out my latest blog posts uploaded on{" "}
          <a className="text-white" href="/blog">
            Funance Blog.
          </a>{" "}
          Updated weekly!
        </p>

        <p className="fs-5">
          Or, create/join a lobby and start trading in the portfolio simulator.
          Compete against other players to see who can make the most money in a
          set amount of time! All prices are based on real-time stock data. To
          get started, check out the{" "}
          <a className="text-white" href="/blog">
            game rules.
          </a>
        </p>
      </div>
    </div>
  );
};

export default Home;
