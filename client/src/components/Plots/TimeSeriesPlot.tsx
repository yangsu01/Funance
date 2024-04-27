import React from "react";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { TimeSeriesPlotData } from "../../utils/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Props = { timeSeriesData: TimeSeriesPlotData[]; title: string };

const TimeSeriesPlot: React.FC<Props> = ({ timeSeriesData, title }) => {
  const data = {
    labels: timeSeriesData[0].x,
    datasets: timeSeriesData.map((d) => ({
      label: d.name,
      data: d.y,
      fill: false,
      borderColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
    })),
  };

  const options = {
    responsive: true,
    maintainAscpetRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white" as const,
        },
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
  };

  return <Line data={data} options={options} height={200} />;
};

export default TimeSeriesPlot;
