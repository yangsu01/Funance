import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Col, Row } from "react-bootstrap";

// components
import Title from "../components/Title";
import PopupForm from "../components/PopupForm";
import GameCard from "../components/GameCard";

import api from "../utils/api";

type Props = {
  token: string | null;
  removeToken: () => void;
  showAlert: (message: string, type: "success" | "danger" | "warning") => void;
};

type Game = {
  name: string;
  creator: string;
  startDate: string;
  endDate: string;
  status: string;
  participants: number;
  joinedGame: boolean;
  details: string;
  passwordRequired: boolean;
};

const GameList = (props: Props) => {
  const { token, removeToken, showAlert } = props;

  // page title
  const title = "Game List";
  const subtitle = "Complete list of all games!";
  const buttonText = "Create Game";

  const [games, setGames] = useState<Game[]>([]);
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
      getGameList();
    } else {
      showAlert("An unexpected error has occurred", "warning");
    }
  }, []);

  const handleCreateGame = () => {
    navigate("/create-game");
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
      showAlert(response.data.msg, "success"); // change to navigate to game portfolio?
    } catch (error: any) {
      showAlert(error.response.data.msg, "danger");
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
                status={game.status}
                name={game.name}
                creator={game.creator}
                participants={game.participants}
                startDate={game.startDate}
                endDate={game.endDate}
                details={game.details}
                joinedGame={game.joinedGame}
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
