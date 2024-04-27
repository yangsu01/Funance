import React from "react";
import { useNavigate } from "react-router-dom";

// components
import Title from "../../components/UI/Title";
import CreateGameForm from "./CreateGameForm";

// hooks
import usePost from "../../hooks/usePost";
import useCreateGame from "./useCreateGame";

// types
import { CreateGameFormData, AlertMessage } from "../../utils/types";

type Props = {
  showAlert: (alertMessage: AlertMessage) => void;
};

const CreateGame: React.FC<Props> = ({ showAlert }) => {
  const { postData } = usePost();

  const navigate = useNavigate();

  const handleGameList = () => {
    navigate("/games");
  };

  const handleCreateGame = (formData: CreateGameFormData) => {
    const response = useCreateGame(formData);

    if (response.error) {
      showAlert({ alert: response.error, alertType: "danger" });
      return;
    } else if (response.data) {
      postCreateGame(response.data);
    }
  };

  const postCreateGame = async (formData: CreateGameFormData) => {
    const post = async () => {
      return await postData("/create-game", {
        gameName: formData.name,
        gamePassword: formData.password,
        gameStartDate: formData.startDate,
        gameEndDate: formData.endDate,
        startingCash: formData.startingCash,
        transactionFee: formData.transactionFee,
        feeType: formData.feeType,
      });
    };

    post().then((res) => {
      if (res && res.response) {
        showAlert({ alert: res.response.msg, alertType: "success" });
      } else if (res && res.error) {
        showAlert({ alert: res.error, alertType: "danger" });
      }
    });
  };

  return (
    <>
      <Title
        title="Create Game"
        subtitle="Create a new game with custom rules!"
        button="Game List"
        onClick={handleGameList}
      ></Title>

      <CreateGameForm onSubmit={handleCreateGame}></CreateGameForm>
    </>
  );
};

export default CreateGame;
