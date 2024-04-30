import { useNavigate } from "react-router-dom";

// components
import Title from "../../components/UI/Title";
import CreateGameForm from "./CreateGameForm";
// hooks
import usePost from "../../hooks/usePost";
import useCreateGame from "./useCreateGame";
// contexts
import { useShowAlert } from "../../contexts/AlertContext";
// types
import { CreateGameFormData } from "../../utils/types";

const CreateGame = () => {
  const { postData } = usePost();
  const navigate = useNavigate();
  const showAlert = useShowAlert();

  const handleGameList = () => {
    navigate("/games");
  };

  const handleCreateGame = (formData: CreateGameFormData) => {
    const response = useCreateGame(formData);

    if (response.error) {
      showAlert(response.error, "danger");
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
      if (res.status === "error") {
        showAlert(res.msg, "danger");
      } else {
        showAlert(res.msg, "success");
        navigate(`/portfolio/${res.data}`);
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
