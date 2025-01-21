import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.range),
    datasets: [
      {
        label: "Number of Items",
        data: data.map((d) => d.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="bar-chart">
      <Bar data={chartData} />
    </div>
  );
};

export default BarChart;
