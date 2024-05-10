import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Row } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import PopupForm from "../../components/Forms/PopupForm";
import GameCard from "./GameListCard";
import Loading from "../../components/UI/Loading";
import GameListOptions from "./GameListOptions";
// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
// types
import {
  GameInfo,
  GameSortOptions,
  GameFilterOptions,
} from "../../utils/types";

const GameList = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [gameData, setGameData] = useState<GameInfo[]>([] as GameInfo[]);
  const [gameName, setGameName] = useState("");
  const [filteredGames, setFilteredGames] = useState<GameInfo[]>(
    [] as GameInfo[]
  );
  // const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const { fetchData, loading } = useFetch<GameInfo[]>();
  const { postData } = usePost();
  const { userAuthenticated } = useAuth();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    fetchData("/game-list").then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setGameData(res.data);
        setFilteredGames(res.data);
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

  const handleSearch = (search: string) => {
    const filtered = gameData.filter((game) => {
      return game.name.toLowerCase().includes(search.toLowerCase());
    });

    setFilteredGames(filtered);
  };

  const handleFilter = (filter: GameFilterOptions) => {
    const filtered = gameData.filter((game) => {
      switch (filter) {
        case "All":
          return game;
        case "Not Started":
          return game.status === "Not Started";
        case "In Progress":
          return game.status === "In Progress";
        case "Completed":
          return game.status === "Completed";
        case "Public":
          return game.passwordRequired === false;
        case "Private":
          return game.passwordRequired === true;
        case "Not Joined":
          return game.joinedGame === false;
        default:
          return game;
      }
    });

    setFilteredGames(filtered);
  };

  const handleSort = (sort: GameSortOptions) => {
    const sorted = [...filteredGames].sort((a, b) => {
      switch (sort) {
        case "Participants":
          return b.participants - a.participants;
        case "Start Date":
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        case "Alphabetical":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredGames(sorted);
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
      {userAuthenticated ? (
        <Title
          title="Game List"
          subtitle="Complete list of all games!"
          button="Create Game"
          onClick={handleCreateGame}
        />
      ) : (
        <Title title="Game List" subtitle="Login to join a game!" />
      )}

      {/* popup */}
      <PopupForm
        show={showPopup}
        name={gameName}
        content="Please enter the password to join the game."
        submitName="Join Game"
        onClose={() => setShowPopup(false)}
        onSubmit={joinGame}
      />

      <GameListOptions
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
      />

      {/* list of all games */}
      <Row xs={1} md={2} className="g-4">
        {filteredGames.map((game, index) => (
          <Col key={index}>
            {userAuthenticated ? (
              <GameCard
                gameInfo={game}
                onJoin={() => {
                  handleJoin(game.passwordRequired, game.name);
                }}
              />
            ) : (
              <GameCard gameInfo={game} />
            )}
          </Col>
        ))}
      </Row>
    </>
  );
};

export default GameList;
