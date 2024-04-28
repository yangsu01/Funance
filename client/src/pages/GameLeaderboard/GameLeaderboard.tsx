import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Row, Col } from "react-bootstrap";

// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";

// components
import Title from "../../components/UI/Title";
import TimeSeriesPlot from "../../components/Plots/TimeSeriesPlot";
import SimpleTable from "../../components/UI/SimpleTable";
import PopupForm from "../../components/Forms/PopupForm";
import Loading from "../../components/UI/Loading";
import GameLeaderboardInfo from "./GameLeaderboardInfo";

// types
import { AlertMessage, GameLeaderboardData } from "../../utils/types";

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

  const topPortfoliosColumns = [
    "Rank",
    "Username",
    "Portfolio Value",
    "Change (%)",
    "Portfolio Age (days)",
    "Daily Change (%)",
  ];

  const dailyPortfoliosColumns = [
    "Rank",
    "Username",
    "Change (%)",
    "Change ($)",
    "Portfolio Value",
  ];

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

  const handleGameList = () => {
    navigate("/games");
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
          button="Game List"
          onClick={handleGameList}
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
        button="Game List"
        onClick={handleGameList}
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

      {/* game info */}
      <GameLeaderboardInfo
        details={leaderboardData.gameDetails}
        onJoin={handleJoin}
      />

      {leaderboardData.gameDetails.status === "Not Started" ? (
        <div className="my-5">
          <h2 className="text-center">
            The game will start on {leaderboardData.gameDetails.startDate}.
          </h2>
          <h5 className="text-center">
            Analytics will be available once the game starts
          </h5>
        </div>
      ) : (
        <>
          {/* overall top performers */}
          <Row className="d-flex align-items-center mb-5">
            <h2>Top Performing Portfolios</h2>
            <Col lg={6}>
              <TimeSeriesPlot
                timeSeriesData={leaderboardData.closingHistory}
                title="Portfolio Values Over Time"
              />
            </Col>
            <Col lg={6}>
              <SimpleTable
                headers={topPortfoliosColumns}
                content={leaderboardData.topPortfolios}
              />
            </Col>
          </Row>

          {/* daily top performers */}
          {leaderboardData.gameDetails.status === "In Progress" && (
            <Row className="d-flex align-items-center">
              <h2>Daily Performance ({leaderboardData.dailyHistoryDate})</h2>
              <Col lg={6}>
                <TimeSeriesPlot
                  timeSeriesData={leaderboardData.dailyHistory}
                  title="Todays performance"
                />
              </Col>
              <Col lg={6}>
                <SimpleTable
                  headers={dailyPortfoliosColumns}
                  content={leaderboardData.dailyPortfolios}
                />
              </Col>  
            </Row>
          )}
        </>
      )}
    </>
  );
};

export default GameLeaderboard;
