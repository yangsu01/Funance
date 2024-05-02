import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// components
import BuySearchForm from "./BuySearchForm";
import BuyForm from "./BuyForm";
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import StockInfo from "../../components/StockInfo";
// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { BuyInfo, StockData } from "../../utils/types";

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

  const handleSearch = (ticker: string) => {
    if (ticker.toUpperCase() === searchedTicker) return;

    fetchStockData(`/stock-info/${ticker}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
        setStockSearched(false);
      } else {
        stockDataRef.current = res.data;
        setStockSearched(true);
      }
    });

    setSearchedTicker(ticker.toUpperCase());
  };

  const handleBuy = (shares: number, price: number, ticker: string) => {
    const body = {
      portfolioId: id,
      ticker: ticker,
      shares: shares,
      price: price,
    };

    postData(`/buy-stock`, body).then((res) => {
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
        title="Buy Stock"
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
            <BuyForm
              info={buyInfoRef.current}
              currentPrice={stockDataRef.current.tickerInfo.price}
              ticker={searchedTicker}
              onSubmit={handleBuy}
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
