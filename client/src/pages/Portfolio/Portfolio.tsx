import React from "react";

import { useParams } from "react-router-dom";

const Portfolio: React.FC = () => {
  const { id } = useParams();
  return <div>Portfolio {id}</div>;
};

export default Portfolio;
