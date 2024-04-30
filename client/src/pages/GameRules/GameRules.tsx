import { Link } from "react-router-dom";

// components
import Title from "../../components/UI/Title";

type Props = {
  userAuthenticated: boolean;
};

const GameRules = ({ userAuthenticated }: Props) => {
  const title = "Investment Simulator";
  const subtitle = "Create a portfolio and watch it grow!";

  return (
    <>
      <Title title={title} subtitle={subtitle} />
      <p className="fs-5">
        Create a portfolio by creating or joining a game and start investing!
        You will be given some starting funds (depending on the specific game)
        to invest in the financial market. Some games have a time limit, while
        others are ongoing.
      </p>
      <p className="fs-5">
        Currently, only fixed income assets such as bonds and derivatives such
        as options are not available... (more to come?). Track your performance
        over time and Buy/Sell your way to victory! Assert your dominance as a
        finance bro by out-performing other peoples portfolios!
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
      <h5 className="text-white">Details:</h5>
      <ul className="fs-5">
        <li>You can only perform transactions after a game has started</li>
        <li>Starting cash depends on specific game rules</li>
        <li>
          Comission fees are applied for both buy and sell transactions see
          specific game settings for details
        </li>
        <li>No partial shares allowed</li>
        <li>
          Trades are assumed to be instant and will be executed at quoted price
        </li>
        <li>
          If buying/selling when the markets are closed, latest closing price
          will be used
        </li>
        <li>All times displayed are in EST unless otherwise stated</li>
      </ul>
      <small>
        *Note currency conversion had not been implemented yet. The default
        currency is USD, so if you buy any foreign stocks, be warned...
        <br />
        *Note<sup>2</sup> <i>yfinance</i> is used to get stock data, so the
        stock you are looking for may not be available
      </small>
    </>
  );
};

export default GameRules;
