import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// components
import BuyForm from "./BuyForm";
import Title from "../../components/UI/Title";
import Loading from "../../components/UI/Loading";
// hooks
import useFetch from "../../hooks/useFetch";
import usePost from "../../hooks/usePost";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { BuyInfo } from "../../utils/types";

const Buy = () => {
  const [buyInfo, setBuyInfo] = useState<BuyInfo>({} as BuyInfo);

  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchData, loading } = useFetch<BuyInfo>();
  const { postData } = usePost();
  const showAlert = useShowAlert();

  // on page load
  useEffect(() => {
    fetchData(`/buy-info/${id}`).then((res) => {
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        setBuyInfo(res.data);
      }
    });
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading || !buyInfo) {
    return (
      <>
        {/* page title */}
        <Title
          title="Buy Stock"
          subtitle={`For the game`}
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
        subtitle={`For Game: ${buyInfo.gameName}`}
        button="Back"
        onClick={handleBack}
      />

      {/* buy form */}
      <BuyForm buyInfo={buyInfo} />
    </>
  );
};

export default Buy;
