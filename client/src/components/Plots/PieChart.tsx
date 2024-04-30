import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, ArcElement, Legend } from "chart.js";

import { PiePlotData } from "../../utils/types";

import { PLOT_COLORS } from "../../utils/constants";

ChartJS.register(Title, Tooltip, ArcElement, Legend);

type Props = { plotData: PiePlotData; title: string };

const PieChart: React.FC<Props> = ({ plotData, title }) => {
  const data = {
    labels: plotData.labels,
    datasets: [
      {
        label: "Value",
        data: plotData.values,
        backgroundColor: PLOT_COLORS,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        color: "white",
      },
      legend: {
        labels: {
          color: "white",
        },
      },
    },
  };

  return <Pie data={data} options={options} height={300} />;
};

export default PieChart;
