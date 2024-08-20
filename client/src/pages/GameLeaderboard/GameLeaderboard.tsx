import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
// components
import Title from "../../components/UI/Title";
import PopupForm from "../../components/Forms/PopupForm";
import Loading from "../../components/UI/Loading";
import GameLeaderboardInfo from "./GameLeaderboardInfo";
import GameLeaderboardRankings from "./GameLeaderboardRankings";
import EmptyMessage from "../../components/UI/EmptyMessage";
import GameLeaderboardButtons from "./GameLeaderboardButtons";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import {
  GameLeaderboardData,
  TimeSeriesPlotData,
  GameDetails,
  TopPortfolio,
  DailyPortfolio,
} from "../../utils/types";
// constants
import {
  TOP_PORTFOLIO_TABLE_HEADERS,
  DAILY_PORTFOLIOS_TABLE_HEADERS,
} from "../../utils/constants";

const GameLeaderboard = () => {
  const [gameDetails, setGameDetails] = useState<GameDetails>(
    {} as GameDetails
  );
  const [topPortfolios, setTopPortfolios] = useState<TopPortfolio[]>(
    [] as TopPortfolio[]
  );
  const [dailyPortfolios, setDailyPortfolios] = useState<DailyPortfolio[]>(
    [] as DailyPortfolio[]
  );
  const [dailyHistoryDate, setDailyHistoryDate] = useState("");
  const [closingHistory, setClosingHistory] = useState<TimeSeriesPlotData[]>(
    [] as TimeSeriesPlotData[]
  );
  const [dailyHistory, setDailyHistory] = useState<TimeSeriesPlotData[]>(
    [] as TimeSeriesPlotData[]
  );
  const [showPopup, setShowPopup] = useState(false);

  const { id } = useParams();
  const { fetchData } = useFetch<GameLeaderboardData>();
  const { postData } = usePost();
  const navigate = useNavigate();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    fetchData(`/game-leaderboard/${id}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setGameDetails(res.data.gameDetails);
        setDailyHistory(res.data.dailyHistory);
        setClosingHistory(res.data.closingHistory);
        setDailyHistoryDate(res.data.dailyHistoryDate);
        setTopPortfolios(res.data.topPortfolios);
        setDailyPortfolios(res.data.dailyPortfolios);
      }
    });
  }, []);

  // navigation
  const handleBack = () => {
    navigate(-1);
  };

  // joining game
  const handleJoin = () => {
    if (gameDetails.passwordRequired) {
      setShowPopup(true);
    } else {
      joinGame(gameDetails.name);
    }
  };

  const joinGame = async (name: string, password?: string) => {
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

  // filtering plots
  const handleFilter = (filterData: string, filter: string) => {
    const body = { [filterData]: filter };

    fetchData(`/game-leaderboard/${id}`, body).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        if (filterData === "closeData") {
          setClosingHistory(res.data.closingHistory);
        } else if (filterData === "dailyData") {
          setDailyHistory(res.data.dailyHistory);
        }
      }
    });
  };

  if (!gameDetails.name) {
    return (
      <>
        {/* page title */}
        <Title
          title="Game Leaderboard"
          subtitle="Detailed stats for the game"
          button="Back"
          onClick={handleBack}
        />
        <Loading />
      </>
    );
  }

  return (
    <>
      {/* page title */}
      <Title
        title={`${gameDetails.name} Leaderboard`}
        subtitle="Detailed stats for the game"
        button="Back"
        onClick={handleBack}
      />

      {/* popup */}
      <PopupForm
        show={showPopup}
        name={gameDetails.name}
        content="Please enter the password to join the game."
        submitName="Join Game"
        onClose={() => setShowPopup(false)}
        onSubmit={joinGame}
      />

      {/* buttons */}
      <GameLeaderboardButtons
        portfolioId={gameDetails.portfolioId}
        gameStatus={gameDetails.status}
        joinedGame={gameDetails.joinedGame}
        onJoin={handleJoin}
      />

      {/* game info */}
      <GameLeaderboardInfo details={gameDetails} />

      {gameDetails.status === "Not Started" ? (
        <EmptyMessage
          title={`Game will start on: ${gameDetails.startDate}`}
          subtitle="Analytics will be available once the game starts."
        />
      ) : (
        <>
          {/* overall top performers */}
          <GameLeaderboardRankings
            title="Top Performing Portfolios"
            subtitle="*Updated daily when markets close"
            chartLabel={{
              title: "Portfolio Value Over Time",
              xLabel: "Date",
              yLabel: "Portfolio Value ($)",
              xUnit: "day",
            }}
            plotData={closingHistory}
            tableHeaders={TOP_PORTFOLIO_TABLE_HEADERS}
            tableData={topPortfolios}
            filterData="closeData"
            onFilter={handleFilter}
          />

          {/* daily top performers */}
          {gameDetails.status === "In Progress" && (
            <GameLeaderboardRankings
              title={`Top Growers (${dailyHistoryDate})`}
              subtitle="*Updated every 5 minutes during market hours"
              chartLabel={{
                title: "Todays Portfolio Growth",
                xLabel: "Time",
                yLabel: "Growth (%)",
                xUnit: "minute",
              }}
              plotData={dailyHistory}
              tableHeaders={DAILY_PORTFOLIOS_TABLE_HEADERS}
              tableData={dailyPortfolios}
              filterData="dailyData"
              onFilter={handleFilter}
            />
          )}
        </>
      )}
    </>
  );
};

export default GameLeaderboard;
