import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";

// custom types
import { GameInfo } from "../utils/types";

type Props = {
  gameInfo: GameInfo;
  onJoin: () => void;
};

const GameCard = ({ gameInfo, onJoin }: Props) => {
  return (
    <Card>
      <Card.Header>
        <strong>{status}</strong>
      </Card.Header>
      <Card.Body>
        <Card.Title>
          <h3>{gameInfo.name}</h3>
        </Card.Title>
        <Card.Subtitle className="pb-3 text-muted">
          {`Created by: ${gameInfo.creator}`}
        </Card.Subtitle>
        <Card.Text>
          {`Current participants: ${gameInfo.participants}`}
          <br />
          {`${
            status === "Not Started"
              ? `Starts on: ${gameInfo.startDate}`
              : status === "In Progress"
              ? `Ends on: ${gameInfo.endDate}`
              : `Ended on: ${gameInfo.endDate}`
          }`}
          <br /> <br />
          <strong>Details:</strong> {""}
          {gameInfo.details}
        </Card.Text>
        {gameInfo.joinedGame ? (
          <Button variant="outline-light" disabled>
            You already joined this game!
          </Button>
        ) : status === "Completed" ? (
          <Button variant="outline-light" disabled>
            Game already ended!
          </Button>
        ) : (
          <Button variant="outline-light" onClick={onJoin}>
            Join Game
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default GameCard;
