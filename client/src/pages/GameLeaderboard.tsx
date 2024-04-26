import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Row, Col, Button, Container, Accordion } from "react-bootstrap";

import api from "../utils/api";

import Title from "../components/Title";
import TimeSeriesPlot from "../components/TimeSeriesPlot";
import InfoList from "../components/InfoList";
import SimpleTable from "../components/SimpleTable";
import PopupForm from "../components/PopupForm";
import InfoCard from "../components/InfoCard";
import Loading from "../components/Loading";

import {
  GameDetails,
  DailyHistory,
  ClosingHistory,
  AlertMessage,
  TopPortfolio,
  DailyPortfolio,
} from "../utils/types";

type Props = {
  token: string | null;
  showAlert: (alertMessage: AlertMessage) => void;
};

const GameLeaderboard = ({ token, showAlert }: Props) => {
  const { id } = useParams();

  const [pageTitle, setPageTitle] = useState({
    title: "Leaderboard",
    subtitle: "Leaderboard for the game",
    buttonText: "Game List",
  });
  const [loading, setLoading] = useState(true);
  const [gameDetails, setGameDetails] = useState<GameDetails>(
    {} as GameDetails
  );
  const [dailyHistory, setDailyHistory] = useState<DailyHistory[]>([]);
  const [closingHistory, setClosingHistory] = useState<ClosingHistory[]>([]);
  const [dailyHistoryDate, setDailyHistoryDate] = useState("");
  const [topPortfolios, setTopPortfolios] = useState<TopPortfolio[]>([]);
  const [dailyPortfolios, setDailyPortfolios] = useState<DailyPortfolio[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  const topPortfoliosColumns = [
    "Rank",
    "Username",
    "Portfolio Value",
    "Change (%)",
    "Portfolio Age (days)",
    "Daily Change (%)",
  ];

  const dailyPortfoliosColumns = [
    "Rank",
    "Username",
    "Change (%)",
    "Change ($)",
    "Portfolio Value",
  ];

  const navigate = useNavigate();

  // get game leaderboard
  const getGameLeaderboard = async () => {
    try {
      const response = await api.get(`/game-leaderboard/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPageTitle({
        title: "Leaderboard",
        subtitle: `For ${response.data.data.gameDetails.name}`,
        buttonText: "Game List",
      });

      setGameDetails(response.data.data.gameDetails);
      setDailyHistory(response.data.data.performanceHistory.dailyHistory);
      setClosingHistory(response.data.data.performanceHistory.closingHistory);
      setDailyHistoryDate(response.data.data.dailyHistoryDate);
      setTopPortfolios(response.data.data.topPerformers);
      setDailyPortfolios(response.data.data.topDailyPerformers);

      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getGameLeaderboard();
    }
  }, []);

  const handleGameList = () => {
    navigate("/games");
  };

  const handleJoin = () => {
    if (gameDetails.passwordRequired) {
      setShowPopup(true);
    } else {
      joinGame(gameDetails.name);
    }
  };

  const joinGame = async (name: string, password?: string) => {
    try {
      const response = await api.post(
        "/join-game",
        {
          gameName: name,
          gamePassword: password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showAlert({ alert: response.data.msg, alertType: "success" }); // change to navigate to game portfolio?
    } catch (error: any) {
      showAlert({ alert: error.response.data.msg, alertType: "danger" });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {/* page title */}
      <Title
        title={pageTitle.title}
        subtitle={pageTitle.subtitle}
        button={pageTitle.buttonText}
        onClick={handleGameList}
      />

      {/* popup */}
      <PopupForm
        show={showPopup}
        name={gameDetails.name}
        content="Please enter the password to join the game."
        submitName="Join Game"
        onClose={() => setShowPopup(false)}
        onSubmit={joinGame}
      />

      {/* game info */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <strong>Game Info</strong>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={4} className="mb-3">
                <InfoCard
                  title={gameDetails.name}
                  subtitle={`Created by: ${gameDetails.creator}`}
                  infoList={[
                    `Participants: ${gameDetails.participants}`,
                    `Start Date: ${gameDetails.startDate}`,
                    `End Date: ${gameDetails.endDate}`,
                  ]}
                />
              </Col>
              <Col md={4} className="mb-3">
                <InfoCard
                  title="Game Settings"
                  infoList={[
                    `Game Duration: ${gameDetails.gameDuration}`,
                    `Starting Cash: ${gameDetails.startingCash}`,
                    `Transaction Fee: ${gameDetails.transactionFee}`,
                    `Fee Type: ${gameDetails.feeType}`,
                  ]}
                />
              </Col>
              <Col md={4} className="mb-3">
                <InfoCard
                  title="Game Details"
                  infoList={[
                    `Status: ${gameDetails.status}`,
                    `Updated: ${gameDetails.lastUpdated}`,
                  ]}
                />
                <Container className="d-flex justify-content-end mt-4">
                  {gameDetails.status !== "Completed" &&
                    !gameDetails.joinedGame && (
                      <Button
                        variant="outline-light"
                        size="lg"
                        onClick={handleJoin}
                      >
                        Join Game
                      </Button>
                    )}
                </Container>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Row className="mb-4">
        <SimpleTable
          tableName="Top Performers"
          headers={topPortfoliosColumns}
          content={topPortfolios}
        />
      </Row>

      <Row className="mb-4">
        <SimpleTable
          tableName="Todays Top Performers"
          headers={dailyPortfoliosColumns}
          content={dailyPortfolios}
        />
      </Row>
    </>
  );
};

export default GameLeaderboard;
