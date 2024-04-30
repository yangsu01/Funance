import React, { useEffect, useState } from "react";
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

// types
import { AlertMessage, GameLeaderboardData } from "../../utils/types";

// constants
import {
  TOP_PORTFOLIO_TABLE_HEADERS,
  DAILY_PORTFOLIOS_TABLE_HEADERS,
} from "../../utils/constants";

type Props = {
  showAlert: (alertMessage: AlertMessage) => void;
};

const GameLeaderboard: React.FC<Props> = ({ showAlert }) => {
  const { id } = useParams();
  const { fetchData, loading } = useFetch<GameLeaderboardData>();
  const [leaderboardData, setLeaderboardData] = useState<GameLeaderboardData>(
    {} as GameLeaderboardData
  );
  const { postData } = usePost();
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  // on page load
  useEffect(() => {
    fetchData(`/game-leaderboard/${id}`).then((res) => {
      if (res.status === "error") {
        showAlert({ alert: res.msg, alertType: "danger" });
      } else {
        setLeaderboardData(res.data);
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
        showAlert({ alert: res.msg, alertType: "danger" });
      } else {
        navigate(`/portfolio/${res.data}`, {
          replace: true,
          state: {
            alert: res.msg,
            alertType: "success",
          },
        });
      }
    });
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
            plotTitle="Portfolio Values Over Time"
            plotData={leaderboardData.closingHistory}
            tableHeaders={TOP_PORTFOLIO_TABLE_HEADERS}
            tableData={leaderboardData.topPortfolios}
          />

          {/* daily top performers */}
          {leaderboardData.gameDetails.status === "In Progress" && (
            <GameLeaderboardRankings
              title={`Top Today (${leaderboardData.dailyHistoryDate})`}
              subtitle="*Updated every 30 minutes during market hours"
              plotTitle="Portfolio Values Over Time"
              plotData={leaderboardData.dailyHistory}
              tableHeaders={DAILY_PORTFOLIOS_TABLE_HEADERS}
              tableData={leaderboardData.dailyPortfolios}
            />
          )}
        </>
      )}
    </>
  );
};

export default GameLeaderboard;
