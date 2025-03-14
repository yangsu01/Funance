import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// components
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import PortfolioInfo from "./PortfolioInfo";
import PortfolioHistoryPlots from "./PortfolioHistoryPlots";
import PortfolioHoldingsPlots from "./PortfolioHoldingsPlots";
import EmptyMessage from "../../components/UI/EmptyMessage";
import PortfolioTable from "./PortfolioTable";
import PortfolioOrders from "./PortfolioOrders";
// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { PortfolioData } from "../../utils/types";
// constants
import {
  HOLDINGS_TABLE_HEADERS,
  TRANSACTIONS_TABLE_HEADERS,
} from "../../utils/constants";

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(
    {} as PortfolioData
  );

  let { id } = useParams();
  const { fetchData, loading } = useFetch<PortfolioData>();
  const { postData } = usePost();
  const navigate = useNavigate();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    if (!id) id = "-1";

    fetchData(`/portfolio/${id}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setPortfolioData(res.data);
      }
    });
  }, [id]);

  const handleLeaderboard = () => {
    navigate(`/games/${portfolioData.portfolioDetails.gameId}`);
  };

  const handleCancelOrder = (id: number | string) => {
    const body = { orderId: id };

    postData("/cancel-order", body).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        showAlert(res.msg, "success");
        setPortfolioData({
          ...portfolioData,
          pendingOrders: portfolioData.pendingOrders.filter(
            (order) => order.id !== id
          ),
        });
      }
    });
  };

  if (loading || !portfolioData.portfolioDetails) {
    return (
      <>
        {/* page title */}
        <Title title="My Portfolio" />
        <Loading />
      </>
    );
  }

  return (
    <>
      {/* page title */}
      <Title
        title="My Portfolio"
        subtitle={portfolioData.portfolioDetails.gameName}
        button="Leaderboard"
        onClick={handleLeaderboard}
      />

      {/* portfolio info */}
      <PortfolioInfo
        hasHoldings={portfolioData.portfolioHoldings.length > 0}
        data={portfolioData.portfolioDetails}
        portfolios={portfolioData.userPortfolios}
        portfolioId={portfolioData.portfolioDetails.portfolioId}
      />

      <PortfolioOrders
        pendingOrders={portfolioData.pendingOrders}
        onCancelOrder={handleCancelOrder}
      />

      {portfolioData.portfolioDetails.gameStatus === "Not Started" ? (
        <EmptyMessage
          title={`Game starts on: ${portfolioData.portfolioDetails.gameStartDate}`}
          subtitle="Add buy orders now and it will be executed when the game starts."
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
