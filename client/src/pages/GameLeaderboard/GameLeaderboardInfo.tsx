import { Row, Col } from "react-bootstrap";

// components
import InfoCard from "../../components/UI/InfoCard";
import AccordionCard from "../../components/UI/AccordionCard";
// types
import { GameDetails } from "../../utils/types";

type Props = {
  details: GameDetails;
};

const GameLeaderboardInfo = ({ details }: Props) => {
  let daysLeft = details.gameDuration;

  if (details.status === "In Progress" && details.endDate !== "n/a") {
    const endDate = new Date(details.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysLeft = diffDays.toString() + " days";
  } else if (details.status === "Completed") {
    daysLeft = "0";
  }

  return (
    <AccordionCard
      header="Game Info"
      open={details.status === "Not Started" ? true : false}
    >
      <Row>
        <Col md={4} className="mb-3">
          <InfoCard
            title={details.name}
            subtitle={`Created by: ${details.creator}`}
            infoList={[
              `Participants: ${details.participants}`,
              `Start Date: ${details.startDate}`,
              `End Date: ${details.endDate}`,
            ]}
          />
        </Col>
        <Col md={4} className="mb-3">
          <InfoCard
            title="Game Settings"
            infoList={[
              `Game Duration: ${details.gameDuration}`,
              `Starting Cash: ${details.startingCash}`,
              `Transaction Fee: ${details.transactionFee}`,
              `Fee Type: ${details.feeType}`,
            ]}
          />
        </Col>
        <Col md={4} className="mb-3">
          <InfoCard
            title="Game Details"
            infoList={[
              `Time Left: ${daysLeft}`,
              `Current Status: ${details.status}`,
              `Last Updated: ${details.lastUpdated}`,
            ]}
          />
        </Col>
      </Row>
    </AccordionCard>
  );
};

export default GameLeaderboardInfo;
