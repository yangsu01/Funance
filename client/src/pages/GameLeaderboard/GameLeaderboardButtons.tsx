import { Link } from "react-router-dom";
import { Button, ButtonGroup } from "react-bootstrap";

// context
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  portfolioId?: number;
  gameStatus: string;
  joinedGame: boolean;
  onJoin: () => void;
};

const GameLeaderboardButtons = ({
  portfolioId,
  gameStatus,
  joinedGame,
  onJoin,
}: Props) => {
  const { userAuthenticated } = useAuth();

  return (
    <ButtonGroup size="lg" className="mb-4">
      <Link to={`/games`} className="btn btn-outline-light">
        Game List
      </Link>
      {userAuthenticated && (
        <>
          {joinedGame ? (
            <Link
              to={`/portfolio/${portfolioId}`}
              className="btn btn-outline-light"
            >
              My Portfolio
            </Link>
          ) : gameStatus === "Completed" ? (
            <Button variant="outline-light" size="lg" disabled>
              Game has ended!
            </Button>
          ) : (
            <Button variant="outline-light" size="lg" onClick={onJoin}>
              Join Game
            </Button>
          )}
        </>
      )}
    </ButtonGroup>
  );
};

export default GameLeaderboardButtons;
