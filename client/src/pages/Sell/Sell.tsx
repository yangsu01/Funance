import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// components
import SellSearchForm from "./SellSearchForm";
import SellOrder from "./SellOrder";
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import StockInfo from "../../components/StockInfo";
// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
import useValidateDate from "../../hooks/useValidateDate";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { SellInfo, StockData, OrderTypes } from "../../utils/types";

const Sell = () => {
  const sellInfoRef = useRef<SellInfo>({} as SellInfo);
  const stockDataRef = useRef<StockData>({} as StockData);

  const [selectedTicker, setSelectedTicker] = useState("");
  const [stockSearched, setStockSearched] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const showAlert = useShowAlert();
  const { fetchData: fetchSellInfo, loading: loadingSellInfo } =
    useFetch<SellInfo>();
  const { fetchData: fetchStockData, loading: loadingStockData } =
    useFetch<StockData>();
  const { postData } = usePost();

  // on page load
  useEffect(() => {
    fetchSellInfo(`/sell-info/${id}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        sellInfoRef.current = res.data;
      }
    });
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (ticker: string) => {
    if (ticker.toUpperCase() === selectedTicker) return;
    fetchStockData(`/stock-info/${ticker}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
        setStockSearched(false);
      } else {
        stockDataRef.current = res.data;
        setStockSearched(true);
      }
    });

    setSelectedTicker(ticker.toUpperCase());
  };

  // market sell
  const handleSell = (shares: number) => {
    // if market is closed, submit market sell order
    if (stockDataRef.current.marketClosed) {
      const body = {
        portfolioId: id,
        stockId: stockDataRef.current.stockId,
        shares: shares,
        orderType: "market sell",
      };

      postData(`/submit-order`, body).then((res) => {
        if (res.status === "error") {
          showAlert(res.msg, "danger");
        } else {
          showAlert(res.msg, "success");
          navigate(`/portfolio/${id}`);
        }
      });

      // if market is open, submit market sell
    } else {
      const body = {
        portfolioId: id,
        stockId: stockDataRef.current.stockId,
        shares: shares,
      };

      postData(`/sell-stock`, body).then((res) => {
        if (res.status === "error") {
          showAlert(res.msg, "danger");
        } else {
          showAlert(res.msg, "success");
          navigate(`/portfolio/${id}`);
        }
      });
    }
  };

  // limit sell or stop-loss
  const handleOrder = (
    shares: number,
    orderType: OrderTypes,
    expiration: string | null,
    targetPrice: number | null
  ) => {
    // check date is valid if expiration is set
    if (
      expiration &&
      !useValidateDate(
        expiration,
        undefined,
        stockDataRef.current.nextMarketDate
      )
    ) {
      showAlert("Invalid Date!", "danger");
      return;
    }

    const body = {
      portfolioId: id,
      orderType: orderType,
      shares: shares,
      expiration: expiration,
      targetPrice: targetPrice,
      stockId: stockDataRef.current.stockId,
    };

    postData("/submit-order", body).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        showAlert(res.msg, "success");
        navigate(`/portfolio/${id}`);
      }
    });
  };

  if (loadingSellInfo || !sellInfoRef.current) {
    return (
      <>
        {/* page title */}
        <Title title="Sell Stock" button="Back" onClick={handleBack} />
        <Loading />
      </>
    );
  }

  return (
    <>
      {/* page title */}
      <Title
        title="Sell"
        subtitle={sellInfoRef.current.gameName}
        button="Back"
        onClick={handleBack}
      />

      <SellSearchForm sellInfo={sellInfoRef.current} onSubmit={handleSearch} />

      {/* stock data */}
      {stockSearched || loadingStockData ? (
        loadingStockData ? (
          <Loading />
        ) : (
          <>
            <SellOrder
              info={sellInfoRef.current}
              currentPrice={stockDataRef.current.tickerInfo.price}
              dayChange={stockDataRef.current.tickerInfo["%DayChange"]}
              ticker={selectedTicker}
              marketClosed={stockDataRef.current.marketClosed}
              nextMarketDate={stockDataRef.current.nextMarketDate}
              sharesOwned={
                sellInfoRef.current.holdingsInfo[selectedTicker].sharesOwned
              }
              averagePrice={
                sellInfoRef.current.holdingsInfo[selectedTicker].averagePrice
              }
              onSell={handleSell}
              onOrder={handleOrder}
            />
            <StockInfo data={stockDataRef.current} ticker={selectedTicker} />
          </>
        )
      ) : (
        <></>
      )}
    </>
  );
};

export default Sell;
