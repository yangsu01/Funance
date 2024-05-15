import { Image, Container, Row, Col } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";

const About = () => {
  return (
    <>
      <Title title="About Funance" subtitle="And More..." />

      <Container>
        <Row className="d-flex justify-content-center align-items-center mb-4">
          <Col md={8}>
            <h3>
              <strong>
                <i>Funance</i>
              </strong>
            </h3>
            <p className="fs-5">
              Funance was created because I'm unemployed and have nothing better
              to do. The original intent was to create a simple portfolio
              simulator to play with some friends. But then I realized people
              aren't nearly as interested as I thought they would be in
              investing... So I decided to write a <i>weekly</i> blog.
            </p>

            <p className="fs-5">
              I have always been interested in finance and investing but always
              procrastinated when it came to actually working on a project
              relating to it. So this was the perfect opportunity to learn more
              about quantitative finance and record <i>my journey</i>.
            </p>

            <p className="fs-5">
              Originally, Funance was a simple Flask app. It was a bit tedious
              but pretty easy to implement. I then realized there would be
              scalability issues. So I decided to use a more modern setup. How
              much work could it be? I gave myself a weekend to learn React and
              a few more days to re-implement everything. Mistakes were made. I
              ended up rewriting both the frontend and backend from scratch. But
              hey, at least the UI is a lot better now... right?
            </p>
          </Col>
          <Col md={2}>
            <Row>
              <Col xs={6} md={12} className="mb-3">
                <Image src="/old_logo.png" alt="old logo" fluid rounded />
                <h6 className="text-center text-muted">logo v1</h6>
              </Col>
              <Col xs={6} md={12} className="mb-3">
                <Image src="/funance_logo.png" alt="logo" fluid rounded />
                <h6 className="text-center text-muted">logo v2</h6>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="d-flex justify-content-center mb-">
          <Col md={10}>
            <h3>
              <strong>
                <i>About Me</i>
              </strong>
            </h3>
            <p className="fs-5">
              I am a (somewhat) recent grad from university. After working for a
              few months as a full-stack developer, I realized I had no idea
              what I wanted from my career. I studied engineering for 6 years
              but ended up doing something completely different right out of
              school. So now I'm taking a break to figure things out.
            </p>
            <p className="fs-5">
              Outside of work, my hobbies include (in case anyone asked...)
            </p>
            <ul className="fs-5">
              <li>
                <strong>Photography:</strong> I like taking pics. Currently, I
                mainly use my trusty Ricoh GRIII for everyday photos but I also
                have a Canon M50 (its supposed to be for video but I use it for
                photos...) with a few lenses that I use on trips or other
                special occasions. Check out some of my photos at{" "}
                <a
                  href="https://www.instagram.com/soappppics/"
                  target="_blank"
                  className="link"
                >
                  <i>@soappppics</i>
                </a>
              </li>
              <li>
                <strong>Board Games:</strong> Started a few years ago when I
                decided to get Catan (the classic entry board game). And the
                next thing I know, I have a collection of over 30 games (REAL
                games, not frauds like Monopoly). Currently, my favorite game is{" "}
                <a
                  href="https://boardgamegeek.com/boardgame/118/modern-art"
                  target="_blank"
                  className="link"
                >
                  <i>Modern Art</i>
                </a>{" "}
                (My favorite game is often the most recent game I get...)
              </li>
              <li>
                <strong>Travel:</strong> Ever since I went to Denmark for an
                exchange semester, I've been hooked on traveling. During my time
                in Europe, I visited 11 countries (mostly solo, top 3 cities?...
                [Lisbon, Athens, Budapest] ). In the last year, I also went to
                New York, Montreal, and Portland. Travel pics can be found at{" "}
                <a
                  href="https://www.instagram.com/soappppics/"
                  target="_blank"
                  className="link"
                >
                  <i>@soappppics</i>
                </a>{" "}
                :)
              </li>
              <li>
                <strong>Working Out:</strong> Yea I gym 💪, how could you tell?
              </li>
            </ul>

            <p className="fs-5">
              If you want to contact me for any reason, pls reach out at{" "}
              <a href="mailto:ssgc1101@gmail.com" className="link">
                <i>ssgc1101@gmail.com</i>
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default About;
