import { Card, Button } from "react-bootstrap";

type Props = {
  status: string;
  name: string;
  creator: string;
  participants: number;
  startDate: string;
  endDate: string;
  details: string;
  joinedGame: boolean;
  onJoin: () => void;
};

const GameCard = (props: Props) => {
  const {
    status,
    name,
    creator,
    participants,
    startDate,
    endDate,
    details,
    joinedGame,
    onJoin,
  } = props;

  return (
    <Card>
      <Card.Header>
        <strong>{status}</strong>
      </Card.Header>
      <Card.Body>
        <Card.Title>
          <h3>{name}</h3>
        </Card.Title>
        <Card.Subtitle className="pb-3 text-muted">
          {`Created by: ${creator}`}
        </Card.Subtitle>
        <Card.Text>
          {`Current participants: ${participants}`}
          <br />
          {`${
            status === "Not Started"
              ? `Starts on: ${startDate}`
              : status === "In Progress"
              ? `Ends on: ${endDate}`
              : `Ended on: ${endDate}`
          }`}
          <br /> <br />
          <strong>Details:</strong> {""}
          {details}
        </Card.Text>
        {joinedGame ? (
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
