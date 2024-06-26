import { Link } from "react-router-dom";

// constants
import { EMAIL_FORM } from "../utils/constants";

const SubscribeLink = () => {
  return (
    <Link className="text-white text-center" to={EMAIL_FORM} target="_blank">
      <i>
        <strong>Subscribe</strong>
      </i>
    </Link>
  );
};

export default SubscribeLink;
