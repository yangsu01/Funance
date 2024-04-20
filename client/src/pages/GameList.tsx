import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, Col, Row, Button } from "react-bootstrap";

import Title from "../components/Title";

import api from "../utils/api";

interface Props {
  token: string | null;
  removeToken: () => void;
  showAlert: (message: string, type: "success" | "danger" | "warning") => void;
}

interface Game {
  name: string;
  creator: string;
  startDate: string;
  endDate: string;
  status: string;
  participants: number;
  joinedGame: boolean;
  details: string;
}

const GameList = ({ token, removeToken, showAlert }: Props) => {
  const title = "Game List";
  const subTitle = "Complete list of all current and past games!";
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);

  const callAPI = async () => {
    try {
      const response = await api.get("/game-list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGames(response.data.data);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeToken();
        navigate("/sign-in", {
          state: {
            alert: "Your session has expired. Please sign in again.",
            alertType: "warning",
          },
        });
        window.location.reload();
      } else {
        showAlert("Cannot get data from API, please try again", "danger");
      }
    }
  };

  useEffect(() => {
    if (token) {
      callAPI();
    } else {
      showAlert("An unexpected error has occurred", "warning");
    }
  }, []);

  return (
    <>
      <Title title={title} subTitle={subTitle} />
      {/* list of all games */}
      <Row xs={1} md={2} className="g-4">
        {games &&
          games.map((game, index) => (
            <Col key={index}>
              <Card>
                <Card.Header>
                  <strong>{game.status}</strong>
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                    <strong>{game.name}</strong>
                  </Card.Title>
                  <Card.Subtitle className="pb-2 text-muted">
                    {`Created by: ${game.creator}`}
                  </Card.Subtitle>
                  <Card.Text>
                    {`Current participants: ${game.participants}`}
                    <br />
                    {`${
                      game.status === "Not Started"
                        ? `Starts on: ${game.startDate}`
                        : game.status === "In Progress"
                        ? `Ends on: ${game.endDate}`
                        : `Ended on: ${game.endDate}`
                    }`}
                    <br /> <br />
                    <strong>Details:</strong> {""}
                    {game.details}
                  </Card.Text>
                  <Button variant="outline-light">Join Game</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>
    </>
  );
};

export default GameList;
