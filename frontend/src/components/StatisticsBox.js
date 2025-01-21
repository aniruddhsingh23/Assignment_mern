import React from "react";

const StatisticsBox = ({ statistics }) => {
  return (
    <div className="statistics-box">
      <div>Total Sale: ${statistics.totalSale || 0}</div>
      <div>Sold Items: {statistics.soldItems || 0}</div>
      <div>Not Sold Items: {statistics.notSoldItems || 0}</div>
    </div>
  );
};

export default StatisticsBox;
