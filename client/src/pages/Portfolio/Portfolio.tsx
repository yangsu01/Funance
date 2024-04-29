import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Row, Col } from "react-bootstrap";

// hooks
import useFetch from "../../hooks/useFetch";

// components
import Title from "../../components/UI/Title";
import SimpleTable from "../../components/UI/SimpleTable";
import Loading from "../../components/UI/Loading";
import TimeSeriesPlot from "../../components/Plots/TimeSeriesPlot";
import InfoCard from "../../components/UI/InfoCard";
import PortfolioInfo from "./PortfolioInfo";
import PortfolioHistoryPlots from "./PortfolioHistoryPlots";

// types
import { PortfolioData, AlertMessage } from "../../utils/types";

type Props = {
  showAlert: (alertMessage: AlertMessage) => void;
};

const Portfolio: React.FC<Props> = ({ showAlert }) => {
  let { id } = useParams();
  const { fetchData, loading } = useFetch<PortfolioData>();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(
    {} as PortfolioData
  );
  const navigate = useNavigate();

  // on page load
  useEffect(() => {
    if (!id) id = "-1";

    fetchData(`/portfolio/${id}`).then((res) => {
      if (res.status === "error") {
        showAlert({ alert: res.msg, alertType: "danger" });
      } else {
        setPortfolioData(res.data);
      }
    });
  }, [id]);

  const handleLeaderboard = () => {
    navigate(`/games/${portfolioData.portfolioDetails.gameId}`);
  };

  if (loading || !portfolioData.portfolioDetails) {
    return (
      <>
        {/* page title */}
        <Title
          title="Game Leaderboard"
          subtitle="Detailed stats for the game"
        />
        <Loading />
      </>
    );
  }

  return (
    <>
      {/* page title */}
      <Title
        title={"My Portfolio"}
        subtitle={`For game: ${portfolioData.portfolioDetails.gameName}`}
        button="Leaderboard"
        onClick={handleLeaderboard}
      />

      {/* portfolio info */}
      <PortfolioInfo
        data={portfolioData.portfolioDetails}
        portfolios={portfolioData.userPortfolios}
        portfolioId={portfolioData.portfolioDetails.portfolioId}
      />

      {portfolioData.portfolioDetails.gameStatus === "Not Started" ? (
        <div className="my-5">
          <h2 className="text-center">
            The game will start on{" "}
            {portfolioData.portfolioDetails.gameStartDate}.
          </h2>
          <h5 className="text-center">
            Analytics will be available once the game starts
          </h5>
        </div>
      ) : (
        <PortfolioHistoryPlots
          closeData={portfolioData.closingHistory}
          dailyData={portfolioData.dailyHistory}
          gameStatus={portfolioData.portfolioDetails.gameStatus}
          date={portfolioData.dailyHistoryDate}
        />
      )}
    </>
  );
};

export default Portfolio;
