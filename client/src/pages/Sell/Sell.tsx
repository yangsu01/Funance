import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// components
import SellSearchForm from "./SellSearchForm";
import SellForm from "./SellForm";
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
import StockInfo from "../../components/StockInfo";
// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { SellInfo, StockData } from "../../utils/types";

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

  const handleSell = (shares: number, price: number, ticker: string) => {
    const body = {
      portfolioId: id,
      ticker: ticker,
      shares: shares,
      price: price,
    };

    postData(`/sell-stock`, body).then((res) => {
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
        <Title
          title="Sell Stock"
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
        title="Sell Stock"
        subtitle={`For Game: ${sellInfoRef.current.gameName}`}
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
            <SellForm
              info={sellInfoRef.current}
              currentPrice={stockDataRef.current.tickerInfo.price}
              ticker={selectedTicker}
              onSubmit={handleSell}
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
