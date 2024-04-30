import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, ArcElement, Legend } from "chart.js";

// types
import { PiePlotData } from "../../utils/types";
// constants
import { PLOT_COLORS } from "../../utils/constants";

ChartJS.register(Title, Tooltip, ArcElement, Legend);

type Props = { plotData: PiePlotData; title: string };

const PieChart = ({ plotData, title }: Props) => {
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
