import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Row } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
import PopupForm from "../../components/Forms/PopupForm";
import GameCard from "./GameListCard";
import Loading from "../../components/UI/Loading";
import GameListOptions from "./GameListOptions";
import GameListLoad from "./GameListLoad";
// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
// types
import { GameInfo, GameFilterOptions } from "../../utils/types";

const GameList = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [gameData, setGameData] = useState<GameInfo[]>([] as GameInfo[]);
  const [gameName, setGameName] = useState("");
  const [fetchBody, setFetchBody] = useState({
    gamesLoaded: 0,
    filter: "All",
    search: "",
  });
  const [moreGames, setMoreGames] = useState(true);
  const [loadingMoreGames, setLoadingMoreGames] = useState(false);

  const scrollPositionRef = useRef<number>(0);

  const navigate = useNavigate();
  const { fetchData, loading } = useFetch<GameInfo[]>();
  const { postData } = usePost();
  const { userAuthenticated } = useAuth();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    queryGames(fetchBody, true);
  }, []);

  // on loading more games
  useEffect(() => {
    window.scrollTo(0, scrollPositionRef.current);
  }, [gameData]);

  // creating new games
  const handleCreateGame = () => {
    navigate("/games/create-game");
  };

  // joining games
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

  // querying games
  const queryGames = (body: Object, newQuery: boolean) => {
    scrollPositionRef.current = window.scrollY;
    setLoadingMoreGames(true);

    fetchData("/game-list", body).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        if (newQuery) {
          setGameData(res.data);
          setFetchBody((prev) => ({
            ...prev,
            gamesLoaded: res.data.length,
          }));
        } else {
          setGameData((prev) => [...prev, ...res.data]);
          setFetchBody((prev) => ({
            ...prev,
            gamesLoaded: prev.gamesLoaded + res.data.length,
          }));
        }

        if (res.data.length === 10) {
          setMoreGames(true);
        } else {
          setMoreGames(false);
        }
      }
    });

    setLoadingMoreGames(false);
  };

  const handleSearch = (search: string) => {
    setFetchBody((prev) => ({
      ...prev,
      gamesLoaded: 0,
      search: search,
    }));

    queryGames(
      {
        gamesLoaded: 0,
        filter: fetchBody.filter,
        search: search,
      },
      true
    );
  };

  const handleFilter = (filter: GameFilterOptions) => {
    setFetchBody((prev) => ({ ...prev, gamesLoaded: 0, filter: filter }));

    queryGames(
      { gamesLoaded: 0, filter: filter, search: fetchBody.search },
      true
    );
  };

  const handleLoadMore = () => {
    queryGames(fetchBody, false);
  };

  const handleReset = () => {
    setFetchBody({ gamesLoaded: 0, filter: "All", search: "" });
    queryGames({ gamesLoaded: 0, filter: "All", search: "" }, true);
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
        <GameListOptions
          onSearch={handleSearch}
          onFilter={handleFilter}
          filter={fetchBody.filter as GameFilterOptions}
          onReset={handleReset}
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
        filter={fetchBody.filter as GameFilterOptions}
        onReset={handleReset}
      />

      {/* list of all games */}
      <Row xs={1} md={2} className="g-4">
        {gameData.map((game, index) => (
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

      <Row className="d-flex justify-content-center mt-5">
        <GameListLoad
          loading={loadingMoreGames}
          moreGames={moreGames}
          onLoadMore={handleLoadMore}
        />
      </Row>
    </>
  );
};

export default GameList;
