import React from "react";
import Plot from "react-plotly.js";

import { TimeSeriesPlotData } from "../../utils/types";

type Props = { data: TimeSeriesPlotData[] };

const TimeSeriesPlot: React.FC<Props> = ({ data }) => {
  return (
    <Plot
      data={data.map((plotData) => ({
        x: plotData.x,
        y: plotData.y,
        type: "scatter",
        mode: "lines",
        name: plotData.name,
      }))}
      layout={{
        title: {
          text: "Portfolio Performance",
          font: {
            size: 18,
            color: "#FFFFFF",
          },
        },
        plot_bgcolor: "rgba(0, 0, 0, 0)",
        paper_bgcolor: "rgba(0, 0, 0, 0)",

        font: {
          size: 10,
          color: "#FFFFFF",
        },

        margin: {
          l: 30,
          r: 30,
          t: 80,
          pad: 0,
        },

        showlegend: true,

        legend: {
          x: 0,
          y: 0,
          traceorder: "normal",
          font: {
            family: "sans-serif",
            size: 10,
            color: "#FFFFFF",
          },
          bgcolor: "#000",
          borderwidth: 1,
          orientation: "h",
        },

        xaxis: {
          autorange: true,
          showgrid: false,
        },

        yaxis: {
          autorange: true,
          type: "linear",
          tickangle: -45,
          showgrid: false,
        },
      }}
    />
  );
};

export default TimeSeriesPlot;
