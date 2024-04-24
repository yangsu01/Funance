import { useNavigate } from "react-router-dom";

// components
import Title from "../components/Title";
import CreateGameForm from "../components/CreateGameForm";

import api from "../utils/api";

// types
import { CreateGameFormData, AlertMessage } from "../utils/types";

type Props = {
  token: string | null;
  showAlert: (alertMessage: AlertMessage) => void;
};

const CreateGame = ({ token, showAlert }: Props) => {
  // page title
  const title = "Create Game";
  const subtitle = "Create a new game with custom rules!";
  const buttonText = "Game List";

  const navigate = useNavigate();

  const handleGameList = () => {
    navigate("/games");
  };

  const handleCreateGame = (formData: CreateGameFormData) => {
    const startDate = new Date(formData.startDate);
    const currentDate = new Date();

    // offset start date by 1 day cause its behind by 1 day for some reason??
    const startDateNum = startDate.setDate(startDate.getDate() + 1);
    const currentDateNum = currentDate.setDate(currentDate.getDate());

    // handle empty variables
    if (!formData.endDate) {
      delete formData.endDate;
    }
    if (!formData.password) {
      delete formData.password;
    }

    // form validation
    if (startDateNum <= currentDateNum) {
      showAlert({
        alert: "Start date cannot be in the past!",
        alertType: "danger",
      });
      return;
    }

    if (formData.endDate) {
      const endDate = new Date(formData.endDate);

      if (endDate <= startDate) {
        showAlert({
          alert: "End date must be after start date!",
          alertType: "danger",
        });
        return;
      }
    }

    if (formData.startingCash <= 0) {
      showAlert({
        alert: "Starting cash is too damn low!",
        alertType: "danger",
      });
      return;
    }

    if (formData.transactionFee < 0) {
      showAlert({
        alert: "Transaction fee cannot be negative!",
        alertType: "danger",
      });
      return;
    }

    postCreateGame(formData);
  };

  const postCreateGame = async (formData: CreateGameFormData) => {
    try {
      const response = await api.post(
        "/create-game",
        {
          gameName: formData.name,
          gamePassword: formData.password,
          gameStartDate: formData.startDate,
          gameEndDate: formData.endDate,
          startingCash: formData.startingCash,
          transactionFee: formData.transactionFee,
          feeType: formData.feeType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showAlert({
        alert: response.data.msg,
        alertType: "success",
      }); // change to navigate to game portfolio?
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        showAlert({
          alert: "Game name already taken!",
          alertType: "warning",
        });
      } else {
        showAlert({
          alert: "Cannot create game, please try again",
          alertType: "danger",
        });
      }
    }
  };

  return (
    <>
      <Title
        title={title}
        subtitle={subtitle}
        button={buttonText}
        onClick={handleGameList}
      ></Title>

      <CreateGameForm onSubmit={handleCreateGame}></CreateGameForm>
    </>
  );
};

export default CreateGame;
