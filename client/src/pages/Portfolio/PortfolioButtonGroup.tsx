import { Link } from "react-router-dom";
import { Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";

// types
import { UserPortfolios } from "../../utils/types";

type Props = {
  portfolios: UserPortfolios[];
  portfolioId: number;
  gameStatus: string;
};

const PortfolioButtonGroup = ({
  portfolios,
  portfolioId,
  gameStatus,
}: Props) => {
  return (
    <ButtonGroup size="lg" className="mb-4">
      <DropdownButton
        as={ButtonGroup}
        id="portfolio-selector"
        title="Change Portfolio"
        variant="outline-light"
      >
        {portfolios.map((portfolio) => (
          <Dropdown.Item
            as={Link}
            to={`/portfolio/${portfolio.portfolioId}`}
            key={portfolio.portfolioId}
          >
            {portfolio.gameName}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      {gameStatus === "In Progress" && (
        <>
          <Link
            to={`/portfolio/${portfolioId}/buy`}
            className="btn btn-outline-light"
          >
            <strong>Buy</strong>
          </Link>
          <Link
            to={`/portfolio/${portfolioId}/sell`}
            className="btn btn-outline-light"
          >
            <strong>Sell</strong>
          </Link>
        </>
      )}
    </ButtonGroup>
  );
};

export default PortfolioButtonGroup;
