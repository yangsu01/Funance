import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Col, Row } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import PopupForm from "../../components/Forms/PopupForm";
import GameCard from "./GameListCard";

import api from "../../utils/api";

// custom types
import { GameInfo, AlertMessage } from "../../utils/types";

type Props = {
  token: string | null;
  showAlert: (alertMessage: AlertMessage) => void;
};

const GameList = ({ token, showAlert }: Props) => {
  // page title
  const title = "Game List";
  const subtitle = "Complete list of all games!";
  const buttonText = "Create Game";

  const [games, setGames] = useState<GameInfo[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [gameName, setGameName] = useState("");

  const navigate = useNavigate();

  const getGameList = async () => {
    try {
      const response = await api.get("/game-list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGames(response.data.data);
    } catch (error: any) {
      showAlert({
        alert: "Cannot get data from API, please try again",
        alertType: "danger",
      });
    }
  };

  useEffect(() => {
    if (token) {
      getGameList();
    } else {
      showAlert({
        alert: "An unexpected error has occurred",
        alertType: "warning",
      });
    }
  }, []);

  const handleCreateGame = () => {
    navigate("/games/create-game");
  };

  const handleJoin = (passwordRequired: boolean, name: string) => {
    setGameName(name);

    if (passwordRequired) {
      setShowPopup(true);
    } else {
      joinGame(name);
    }
  };

  const joinGame = async (name: string, password?: string) => {
    try {
      const response = await api.post(
        "/join-game",
        {
          gameName: name,
          gamePassword: password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showAlert({ alert: response.data.msg, alertType: "success" }); // change to navigate to game portfolio?
    } catch (error: any) {
      showAlert({ alert: error.response.data.msg, alertType: "danger" });
      console.log(gameName, password);
    }
  };

  return (
    <>
      {/* page title */}
      <Title
        title={title}
        subtitle={subtitle}
        button={buttonText}
        onClick={handleCreateGame}
      />

      {/* popup */}
      <PopupForm
        show={showPopup}
        name={gameName}
        content="Please enter the password to join the game."
        submitName="Join Game"
        onClose={() => setShowPopup(false)}
        onSubmit={joinGame}
      />

      {/* list of all games */}
      <Row xs={1} md={2} className="g-4">
        {games &&
          games.map((game, index) => (
            <Col key={index}>
              <GameCard
                gameInfo={game}
                onJoin={() => {
                  handleJoin(game.passwordRequired, game.name);
                }}
              />
            </Col>
          ))}
      </Row>
    </>
  );
};

export default GameList;
