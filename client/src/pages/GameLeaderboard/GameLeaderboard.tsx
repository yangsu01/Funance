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
  LeaderboardFilterOptions,
} from "../../utils/types";
// constants
import {
  TOP_PORTFOLIO_TABLE_HEADERS,
  DAILY_PORTFOLIOS_TABLE_HEADERS,
} from "../../utils/constants";

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<GameLeaderboardData>(
    {} as GameLeaderboardData
  );
  const [filteredClose, setFilteredClose] = useState<TimeSeriesPlotData[]>(
    [] as TimeSeriesPlotData[]
  );
  const [filteredDaily, setFilteredDaily] = useState<TimeSeriesPlotData[]>(
    [] as TimeSeriesPlotData[]
  );
  const [topCloseUsers, setTopCloseUsers] = useState<string[]>([]);
  const [topDailyUsers, setTopDailyUsers] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  const { id } = useParams();
  const { fetchData, loading } = useFetch<GameLeaderboardData>();
  const { postData } = usePost();
  const navigate = useNavigate();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    fetchData(`/game-leaderboard/${id}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setLeaderboardData(res.data);

        const topClose = res.data.topPortfolios.map((data) => {
          return data.Username;
        });
        const topDaily = res.data.dailyPortfolios.map((data) => {
          return data.Username;
        });

        setTopCloseUsers(topClose);
        setTopDailyUsers(topDaily);

        // initiate filtered data
        const filteredClose = res.data.closingHistory.filter((data) => {
          return topClose.slice(0, 5).includes(data.name);
        });
        setFilteredClose(filteredClose);

        const filteredDaily = res.data.dailyHistory.filter((data) => {
          return topDaily.slice(0, 5).includes(data.name);
        });
        setFilteredDaily(filteredDaily);
      }
    });
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleJoin = () => {
    if (leaderboardData.gameDetails.passwordRequired) {
      setShowPopup(true);
    } else {
      joinGame(leaderboardData.gameDetails.name);
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

  const handleCloseFilter = (filter: LeaderboardFilterOptions) => {
    switch (filter) {
      case "Top 5":
        const topFilter = leaderboardData.closingHistory.filter((data) => {
          return topCloseUsers.slice(0, 5).includes(data.name);
        });
        setFilteredClose(topFilter);
        break;

      case "Bottom 5":
        const bottomFilter = leaderboardData.closingHistory.filter((data) => {
          return topCloseUsers.slice(-5).includes(data.name);
        });
        setFilteredClose(bottomFilter);
        break;

      default:
        setFilteredClose(leaderboardData.closingHistory);
        break;
    }
  };

  const handleDailyFilter = (filter: LeaderboardFilterOptions) => {
    switch (filter) {
      case "Top 5":
        const topFilter = leaderboardData.dailyHistory.filter((data) => {
          return topDailyUsers.slice(0, 5).includes(data.name);
        });
        setFilteredDaily(topFilter);
        break;

      case "Bottom 5":
        const bottomFilter = leaderboardData.dailyHistory.filter((data) => {
          return topDailyUsers.slice(-5).includes(data.name);
        });
        setFilteredDaily(bottomFilter);
        break;

      default:
        setFilteredDaily(leaderboardData.dailyHistory);
        break;
    }
  };

  if (loading || !leaderboardData.gameDetails) {
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
        title={`${leaderboardData.gameDetails.name} Leaderboard`}
        subtitle="Detailed stats for the game"
        button="Back"
        onClick={handleBack}
      />

      {/* popup */}
      <PopupForm
        show={showPopup}
        name={leaderboardData.gameDetails.name}
        content="Please enter the password to join the game."
        submitName="Join Game"
        onClose={() => setShowPopup(false)}
        onSubmit={joinGame}
      />

      {/* buttons */}
      <GameLeaderboardButtons
        portfolioId={leaderboardData.gameDetails.portfolioId}
        gameStatus={leaderboardData.gameDetails.status}
        joinedGame={leaderboardData.gameDetails.joinedGame}
        onJoin={handleJoin}
      />

      {/* game info */}
      <GameLeaderboardInfo details={leaderboardData.gameDetails} />

      {leaderboardData.gameDetails.status === "Not Started" ? (
        <EmptyMessage
          title={`Game will start on: ${leaderboardData.gameDetails.startDate}`}
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
            }}
            plotData={filteredClose}
            tableHeaders={TOP_PORTFOLIO_TABLE_HEADERS}
            tableData={leaderboardData.topPortfolios}
            onFilter={handleCloseFilter}
          />

          {/* daily top performers */}
          {leaderboardData.gameDetails.status === "In Progress" && (
            <GameLeaderboardRankings
              title={`Top Growers (${leaderboardData.dailyHistoryDate})`}
              subtitle="*Updated every 30 minutes during market hours"
              chartLabel={{
                title: "Todays Portfolio Growth",
                xLabel: "Time",
                yLabel: "Growth (%)",
              }}
              plotData={filteredDaily}
              tableHeaders={DAILY_PORTFOLIOS_TABLE_HEADERS}
              tableData={leaderboardData.dailyPortfolios}
              onFilter={handleDailyFilter}
            />
          )}
        </>
      )}
    </>
  );
};

export default GameLeaderboard;
