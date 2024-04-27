import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Col, Row } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import PopupForm from "../../components/Forms/PopupForm";
import GameCard from "./GameListCard";
import Loading from "../../components/UI/Loading";

// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";

// custom types
import { GameInfo, AlertMessage } from "../../utils/types";

type Props = {
  showAlert: (alertMessage: AlertMessage) => void;
};

const GameList: React.FC<Props> = ({ showAlert }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [gameName, setGameName] = useState("");

  const { fetchData, responseData, loading } = useFetch<GameInfo[]>();
  const { postData } = usePost();

  // on page load
  useEffect(() => {
    fetchData("/game-list").then((response) => {
      if (response) {
        showAlert({ alert: response, alertType: "danger" });
      }
    });
  }, []);

  const navigate = useNavigate();

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

  const joinGame = (name: string, password?: string) => {
    const post = async () => {
      return await postData("/join-game", {
        gameName: name,
        gamePassword: password,
      });
    };

    post().then((res) => {
      if (res && res.response) {
        showAlert({ alert: res.response.msg, alertType: "success" });
      } else if (res && res.error) {
        showAlert({ alert: res.error, alertType: "danger" });
      }
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {/* page title */}
      <Title
        title="Game List"
        subtitle="Complete list of all games!"
        button="Create Game"
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
        {responseData &&
          responseData.map((game, index) => (
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
