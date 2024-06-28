import { Button } from "react-bootstrap";

// components
import Loading from "../../components/UI/Loading";

type Props = {
  loading: boolean | null;
  onLoadMore: () => void;
  moreGames: boolean;
};

const GameListLoad = ({ loading, moreGames, onLoadMore }: Props) => {
  const handleLoadMore = () => {
    onLoadMore();
  };

  if (loading) {
    return <Loading />;
  } else if (!moreGames) {
    return <h4 className="text-light text-center">No more games to load...</h4>;
  } else {
    return (
      <Button
        variant="outline-light"
        size="lg"
        style={{ minWidth: "100px" }}
        onClick={handleLoadMore}
      >
        More Games
      </Button>
    );
  }
};

export default GameListLoad;
