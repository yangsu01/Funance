import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

// components
import Title from "../../components/UI/Title";
// contexts
import { useAuth } from "../../contexts/AuthContext";

const GameRules = () => {
  const { userAuthenticated } = useAuth();

  return (
    <>
      <Title title="Rules" subtitle="Investment Simulator" />
      <Container>
        <p className="fs-5">
          Create a portfolio by creating or joining a game and begin investing!
          You'll receive starting funds (based on game settings) to invest in
          the financial market. Some games have time limits, while others are
          long-term.
        </p>

        <p className="fs-5">
          Track your performance over time and buy/sell your way to victory!
          Compete against others by outperforming their portfolios.
        </p>

        <p className="fs-5">
          To get started,{" "}
          {userAuthenticated ? (
            <></>
          ) : (
            <>
              <Link className="text-white" to="/sign-up">
                Create an Account
              </Link>{" "}
              and
            </>
          )}{" "}
          create/join a game by checking out the{" "}
          <Link className="text-white" to="/games">
            Game List
          </Link>
        </p>
        <h5 className="text-white">General:</h5>
        <ul className="fs-5">
          <li>All times are in EST unless otherwise stated.</li>
          <li>
            Game data updates every 5 minutes during market hours (9:30 am -
            4:00 pm EST).
          </li>
          <li>
            All prices are recorded in USD <sup>1</sup>
          </li>
          <li>
            Available asset classes to trade: <strong>Equity</strong> (more on
            the way...).
          </li>
          <li>Dividend payments are currently not supported.</li>
        </ul>

        <h5 className="text-white">Transactions:</h5>
        <ul className="fs-5">
          <li>
            Buy orders can be placed before the game begins but will only be
            executed after start date.
          </li>
          <li>
            Both buy and sell transactions incur fees. See specific game
            settings for details.
          </li>
          <li>No partial shares can be bought or sold</li>
          <li>Market orders are executed at the latest market price.</li>
          <li>
            Limit buy, sell, and stop-loss orders are checked every 5 minutes
            for fulfillment.
          </li>
          <li>
            Orders are executed chronologically based on when they were placed.
          </li>
          <li>
            Orders are partially filled if there aren't enough funds or shares.
          </li>
          <li>
            Orders placed when the market is closed will execute at the next
            market open.
          </li>
          <li>
            For foreign stocks, add the appropriate stock exchange suffix (e.g.
            ".TO" for TSX).
          </li>
        </ul>

        <h5 className="text-white">Order Types:</h5>
        <ul className="fs-5">
          <li>
            Market Buy/Sell: executes at market price when markets open or when
            game starts
          </li>
          <li>Limit Buy: executes when current price is below target price</li>
          <li>Limit Sell: executes when current price is above target price</li>
          <li>
            Stop-Loss: executes when current price falls below target price
          </li>
        </ul>

        <small>
          <sup>1</sup> There is currently no support for currency conversion.
          All prices are assumed to be USD, even for foreign-listed stocks.
        </small>
      </Container>
    </>
  );
};

export default GameRules;
