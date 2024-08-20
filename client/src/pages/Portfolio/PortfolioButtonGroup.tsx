import { Link } from "react-router-dom";
import { Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";

// types
import { UserPortfolios } from "../../utils/types";

type Props = {
  portfolios: UserPortfolios[];
  portfolioId: number;
  gameStatus: string;
  hasHoldings: boolean;
};

const PortfolioButtonGroup = ({
  portfolios,
  portfolioId,
  gameStatus,
  hasHoldings,
}: Props) => {
  return (
    <>
      <DropdownButton
        as={ButtonGroup}
        id="portfolio-selector"
        title="Change Portfolio"
        variant="outline-light"
        size="lg"
        className="mb-4 me-3"
      >
        {portfolios.map((portfolio) => (
          <Dropdown.Item
            as={Link}
            to={`/portfolio/${portfolio.portfolioId}`}
            key={portfolio.portfolioId}
            active={portfolioId.toString() === portfolio.portfolioId}
          >
            {portfolio.gameName}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      <ButtonGroup size="lg" className="mb-4">
        {gameStatus !== "Completed" && (
          <>
            <Link
              to={`/portfolio/${portfolioId}/buy`}
              className="btn btn-outline-light"
            >
              <strong>Buy</strong>
            </Link>
            {hasHoldings && (
              <Link
                to={`/portfolio/${portfolioId}/sell`}
                className="btn btn-outline-light"
              >
                <strong>Sell</strong>
              </Link>
            )}
          </>
        )}
      </ButtonGroup>
    </>
  );
};

export default PortfolioButtonGroup;
