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
                <i>Funance</i>
              </strong>
            </h3>
            <p className="fs-5">
              Funance was born from my passion for finance and investing. With a
              background in engineering and software development, I enjoy the
              iterative process of design and implementation, which let me to
              build a portfolio simulator from scratch. The simulator serves as
              both a learning tool and a platform for testing various trading
              strategies.
            </p>

            <p className="fs-5">
              While working on the simulator, I saw its potential as a platform
              to share my quantitative finance journey. This inspired the
              creation of Funance Blog where I explore different topics,
              implementing and analyzing the theory behind them. All the code is
              accessible on{" "}
              <a
                href="https://github.com/yangsu01/funance_blog"
                target="_blank"
                className="link"
              >
                GitHub
              </a>
              , and I strive to make investing more accessible for a broader
              audience.
            </p>

            <p className="fs-5">
              This project started off as a simple Flask App, but as the
              userbase grew, I transitioned the frontend to React while
              maintaining Flask as the backend API. This update greatly improved
              performance and user experience but was a challenging process, as
              I had limited prior web development experience...
            </p>

            <h3>
              <strong>
                <i>Me</i>
              </strong>
            </h3>
            <p className="fs-5">
              I am a recent university graduate who began my career as a
              full-stack developer. While this role strengthened my software
              skills, I felt disconnect and wanted to do more with my skillset.
              Working on the Funance simulator and blog has helped me realize
              the professional path I want to pursue. After six years of
              studying engineering with only a vague sense of direction,
              quantitative finance has reignited my curiosity and desire to
              learn. It may have taken time, but better late than never.
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
                .
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
                travel to 11 countries (mostly solo). In the past year, I also
                visited New York, Montreal, and Portland.
              </li>
            </ul>
            <p className="fs-5">
              Got any feedback or suggestions? Feel free to reach out at{" "}
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
