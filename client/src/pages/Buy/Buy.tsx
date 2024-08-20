import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// components
import BuySearchForm from "./BuySearchForm";
import BuyOrder from "./BuyOrder";
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
import { BuyInfo, StockData, OrderTypes } from "../../utils/types";

const Buy = () => {
  const buyInfoRef = useRef<BuyInfo>({} as BuyInfo);
  const stockDataRef = useRef<StockData>({} as StockData);

  const [searchedTicker, setSearchedTicker] = useState("");
  const [stockSearched, setStockSearched] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const showAlert = useShowAlert();
  const { fetchData: fetchBuyInfo, loading: loadingBuyInfo } =
    useFetch<BuyInfo>();
  const { fetchData: fetchStockData, loading: loadingStockData } =
    useFetch<StockData>();
  const { postData } = usePost();

  // on page load
  useEffect(() => {
    fetchBuyInfo(`/buy-info/${id}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        buyInfoRef.current = res.data;
      }
    });
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  // searching for stock data
  const handleSearch = (ticker: string) => {
    if (ticker.toUpperCase().trim() === searchedTicker) return;

    fetchStockData(`/stock-info/${ticker}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
        setStockSearched(false);
      } else {
        stockDataRef.current = res.data;
        setStockSearched(true);
      }
    });

    setSearchedTicker(ticker.toUpperCase().trim());
  };

  // market buy
  const handleBuy = (shares: number) => {
    // if market is closed, submit market buy order
    if (stockDataRef.current.marketClosed) {
      const body = {
        portfolioId: id,
        stockId: stockDataRef.current.stockId,
        shares: shares,
        orderType: "market buy",
      };

      postData(`/submit-order`, body).then((res) => {
        if (res.status === "error") {
          showAlert(res.msg, "danger");
        } else {
          showAlert(res.msg, "success");
          navigate(`/portfolio/${id}`);
        }
      });
      // if market is open, submit market buy
    } else {
      const body = {
        portfolioId: id,
        stockId: stockDataRef.current.stockId,
        shares: shares,
      };

      postData(`/buy-stock`, body).then((res) => {
        if (res.status === "error") {
          showAlert(res.msg, "danger");
        } else {
          showAlert(res.msg, "success");
          navigate(`/portfolio/${id}`);
        }
      });
    }
  };

  // limit buy
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

  if (loadingBuyInfo || !buyInfoRef.current) {
    return (
      <>
        {/* page title */}
        <Title
          title="Buy Stock"
          subtitle={`For Game`}
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
        title="Buy"
        subtitle={`For Game: ${buyInfoRef.current.gameName}`}
        button="Back"
        onClick={handleBack}
      />

      {/* buy form */}
      <BuySearchForm buyInfo={buyInfoRef.current} onSubmit={handleSearch} />

      {/* stock data */}
      {stockSearched || loadingStockData ? (
        loadingStockData ? (
          <Loading />
        ) : (
          <>
            <BuyOrder
              info={buyInfoRef.current}
              currentPrice={stockDataRef.current.tickerInfo.price}
              dayChange={stockDataRef.current.tickerInfo["%DayChange"]}
              ticker={searchedTicker}
              marketClosed={stockDataRef.current.marketClosed}
              nextMarketDate={stockDataRef.current.nextMarketDate}
              onBuy={handleBuy}
              onOrder={handleOrder}
            />
            <StockInfo data={stockDataRef.current} ticker={searchedTicker} />
          </>
        )
      ) : (
        <></>
      )}
    </>
  );
};

export default Buy;
