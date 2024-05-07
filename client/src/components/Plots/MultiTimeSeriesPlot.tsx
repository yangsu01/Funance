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
  Legend,
} from "chart.js";
import "chartjs-adapter-moment";

// types
import { TimeSeriesPlotData } from "../../utils/types";
//constants
import { PLOT_COLORS } from "../../utils/constants";

ChartJS.register(
  TimeSeriesScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Props = { timeSeriesData: TimeSeriesPlotData[]; title: string };

const MultiTimeSeriesPlot = ({ timeSeriesData, title }: Props) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });
  const chartHeight = isSmallScreen ? 400 : "auto";

  const data = {
    datasets: timeSeriesData.map((d) => ({
      label: d.name,
      data: d.x.map((value, index) => ({ x: value, y: d.y[index] })),
      fill: false,
      borderColor: PLOT_COLORS,
      border: 1,
      radius: 0,
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
