import { useMediaQuery } from "react-responsive";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeSeriesScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-moment";

// types
import { LinePlotData } from "../../utils/types";

ChartJS.register(
  TimeSeriesScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

type Props = { plotData: LinePlotData; title: string };

const MultiTimeSeriesPlot = ({ plotData, title }: Props) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });
  const chartHeight = isSmallScreen ? 200 : "auto";

  const data = {
    datasets: [
      {
        data: plotData.x.map((value, index) => ({
          x: value,
          y: plotData.y[index],
        })),
        fill: false,
        borderColor: "rgb(14, 209, 69)" as const,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAscpetRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: "white" as const,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
          color: "white" as const,
        },
        type: "timeseries" as const,
        ticks: { color: "white" as const },
      },
      y: {
        title: {
          display: true,
          text: "Value ($)",
          color: "white" as const,
        },
        type: "linear" as const,
        ticks: { color: "white" as const },
      },
    },
  };

  return <Line data={data} options={options} height={chartHeight} />;
};

export default MultiTimeSeriesPlot;
