import { useState, useEffect } from "react";
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
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { GameInfo } from "../../utils/types";

const GameList = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [gameData, setGameData] = useState<GameInfo[]>([] as GameInfo[]);
  const [gameName, setGameName] = useState("");

  const navigate = useNavigate();
  const { fetchData, loading } = useFetch<GameInfo[]>();
  const { postData } = usePost();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    fetchData("/game-list").then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setGameData(res.data);
      }
    });
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

  const joinGame = (name: string, password?: string) => {
    const post = async () => {
      return await postData("/join-game", {
        gameName: name,
        gamePassword: password,
      });
    };

    post().then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        showAlert(res.msg, "success");
        navigate(`/portfolio/${res.data}`);
      }
    });
  };

  if (loading || !gameData) {
    return (
      <>
        {/* page title */}
        <Title
          title="Game List"
          subtitle="Complete list of all games!"
          button="Create Game"
          onClick={handleCreateGame}
        />
        <Loading />
      </>
    );
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
        {gameData.map((game, index) => (
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
