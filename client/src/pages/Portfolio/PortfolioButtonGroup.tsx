import React from "react";
import { NavLink } from "react-router-dom";

import { Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";

import { UserPortfolios } from "../../utils/types";

type Props = {
  buttonName: string;
  portfolios: UserPortfolios[];
  portfolioId: number;
};

const PortfolioButtonGroup: React.FC<Props> = ({
  portfolios,
  buttonName,
  portfolioId,
}) => {
  return (
    <>
      <ButtonGroup size="lg" className="flex-fill mb-4">
        <DropdownButton
          as={ButtonGroup}
          id="portfolio-selector"
          title={buttonName}
          variant="outline-light"
        >
          {portfolios.map((portfolio) => (
            <Dropdown.Item
              as={NavLink}
              to={`/portfolio/${portfolio.portfolioId}`}
              key={portfolio.portfolioId}
            >
              {portfolio.gameName}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <NavLink
          to={`/portfolio/${portfolioId}/buy`}
          className="btn btn-outline-light"
        >
          <strong>Buy</strong>
        </NavLink>
        <NavLink
          to={`/portfolio/${portfolioId}/sell`}
          className="btn btn-outline-light"
        >
          <strong>Sell</strong>
        </NavLink>
      </ButtonGroup>
    </>
  );
};

export default PortfolioButtonGroup;
