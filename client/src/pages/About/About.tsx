import { Container, Row, Col } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";

const About = () => {
  return (
    <>
      <Title title="About" />

      <Container>
        <Row className="d-flex justify-content-center">
          <Col md={10}>
            <h3>
              <strong>
                <i>About Funance</i>
              </strong>
            </h3>
            <p className="fs-5">
              Funance was born from my interest in finance and investing. With a
              background in engineering, I enjoy the iterative process of design
              and implementation, which let me to build an investment simulator
              from scratch. The simulator serves as both a learning tool and a
              testing ground for various investment strategies.
            </p>

            <p className="fs-5">
              As I developed the simulator, I realized it could also serve as a
              platform to share what I learn about quantitative finance. This
              inspired the creation of Funance Blog. Each week, I explore a new
              topic and implement/analyze the theory using Python (all the
              notebooks can be found on{" "}
              <a
                href="https://github.com/yangsu01/funance_blog"
                target="_blank"
                className="link"
              >
                GitHub
              </a>
              ). I then condense and summarize my learnings in the blog posts.
              Please note that some weeks may have no posts as I'm likely
              working on the simulator or other parts of the website.
            </p>

            <p className="fs-5">
              The project started off as a simple Flask App. However, as the
              number of users grew, the simplicity of the app started to impact
              the performance. To improve the user experience, I transitioned
              the frontend to React while retaining Flask as the backend API.
              This was a challenging process, as I had limited prior web
              development experience...
            </p>

            <h3>
              <strong>
                <i>About Me</i>
              </strong>
            </h3>
            <p className="fs-5">
              I am a recent university graduate who worked as a full-stack
              developer after graduation. While I enjoy coding, I felt
              disconnected from the pure software aspect of my job. Working on
              Funance made me realize what I wanted from my professional career.
              After spending six years studying engineering with only a vague
              idea of my future, I finally have a clear goal to work towards. It
              may have taken some time, but it's better late than never.
            </p>
            <p className="fs-5">Outside of work, my hobbies include:</p>
            <ul className="fs-5">
              <li>
                <strong>Photography:</strong> I love capturing memories. My
                everyday camera is a Ricoh GRIII, but I also have a Canon M50
                (primarily intended for video, but I use it only for photos)
                with a few lenses that I use on trips or other special
                occasions. Check out some of my photos at{" "}
                <a
                  href="https://www.instagram.com/soappppics/"
                  target="_blank"
                  className="link"
                >
                  <i>@soappppics</i>
                </a>
              </li>
              <li>
                <strong>Board Games:</strong> Started a few years ago with Catan
                (the classic gateway game). Since then, I've gained a collection
                of over 30 games (REAL games, Monopoly does not count).
                Currently, my favorite game is{" "}
                <a
                  href="https://boardgamegeek.com/boardgame/118/modern-art"
                  target="_blank"
                  className="link"
                >
                  <i>Modern Art</i>
                </a>{" "}
                though it often changes as I discover new games.
              </li>
              <li>
                <strong>Travel:</strong> My love for travel began during an
                exchange semester in Denmark, where I had the opportunity to
                travel to 11 countries (mostly solo). My current top three
                cities? Lisbon, Athens, and Budapest. In the last year, I also
                visited New York, Montreal, and Portland. You can also find my
                travel photos at{" "}
                <a
                  href="https://www.instagram.com/soappppics/"
                  target="_blank"
                  className="link"
                >
                  <i>@soappppics</i>
                </a>
              </li>
            </ul>
            <p className="fs-5">
              If you want to reach out, feel free to contact me at{" "}
              <a href="mailto:funance.blog@gmail.com" className="link">
                <i>funance.blog@gmail.com</i>
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default About;
