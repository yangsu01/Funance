import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// hooks
import useFetch from "../../hooks/useFetch";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import PortfolioInfo from "./PortfolioInfo";
import PortfolioHistoryPlots from "./PortfolioHistoryPlots";
import PortfolioHoldingsPlots from "./PortfolioHoldingsPlots";
import EmptyMessage from "../../components/UI/EmptyMessage";
import PortfolioTable from "./PortfolioTable";

// types
import { PortfolioData, AlertMessage } from "../../utils/types";

// constants
import {
  HOLDINGS_TABLE_HEADERS,
  TRANSACTIONS_TABLE_HEADERS,
} from "../../utils/constants";

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
        <EmptyMessage
          title={`Game will start on: ${portfolioData.portfolioDetails.gameStartDate}`}
          subtitle="Analytics will be available once the game starts."
        />
      ) : (
        <>
          <PortfolioHistoryPlots
            closeData={portfolioData.closingHistory}
            dailyData={portfolioData.dailyHistory}
            gameStatus={portfolioData.portfolioDetails.gameStatus}
            date={portfolioData.dailyHistoryDate}
          />
          <PortfolioHoldingsPlots
            breakdownData={portfolioData.holdingsBreakdown}
            sectorData={portfolioData.sectorBreakdown}
          />
          <PortfolioTable
            tableHeaders={HOLDINGS_TABLE_HEADERS}
            tableData={portfolioData.portfolioHoldings}
            title="Holdings"
          />
          <PortfolioTable
            tableHeaders={TRANSACTIONS_TABLE_HEADERS}
            tableData={portfolioData.portfolioTransactions}
            title="Transactions"
          />
        </>
      )}
    </>
  );
};

export default Portfolio;
