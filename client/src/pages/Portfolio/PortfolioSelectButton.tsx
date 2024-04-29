import React from 'react'
import { NavLink } from 'react-router-dom'

import { Dropdown, DropdownButton } from 'react-bootstrap'

import { UserPortfolios } from '../../utils/types'

type Props = {
  buttonName: string
  portfolios: UserPortfolios[]
}

const PortfolioSelectButton: React.FC<Props> = ({portfolios, buttonName}) => {
  return (
    <DropdownButton id="portfolio-selector" title={buttonName} variant="outline-light" size="lg" className="mb-4">
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
  )
}

export default PortfolioSelectButton