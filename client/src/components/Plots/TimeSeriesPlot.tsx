import { useMediaQuery } from "react-responsive";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeSeriesScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-moment";

// types
import { LinePlotData, LineChartLabel } from "../../utils/types";

ChartJS.register(TimeSeriesScale, LinearScale, LineElement, Title, Tooltip);

type Props = {
  plotData: LinePlotData;
  label: LineChartLabel;
  radius?: number;
};

const TimeSeriesPlot = ({
  plotData,
  label: { title, xLabel, yLabel },
  radius = 0,
}: Props) => {
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
        radius: radius,
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
          text: xLabel,
          color: "white" as const,
        },
        type: "timeseries" as const,
        ticks: { color: "white" as const },
      },
      y: {
        title: {
          display: true,
          text: yLabel,
          color: "white" as const,
        },
        type: "linear" as const,
        ticks: { color: "white" as const },
      },
    },
  };

  return <Line data={data} options={options} height={chartHeight} />;
};

export default TimeSeriesPlot;
