// components
import InfoCard from "./UI/InfoCard";
import InfoList from "./UI/InfoList";
import TimeSeriesPlot from "./Plots/TimeSeriesPlot";
import AccordionCard from "./UI/AccordionCard";
// types
import { StockData } from "../utils/types";

type Props = {
  ticker: string;
  data: StockData;
};

const StockInfo = ({ data, ticker }: Props) => {
  return (
    <>
      <AccordionCard header={`${ticker} Info`} open={false}>
        <InfoCard
          title={ticker}
          subtitle={data.tickerInfo.companyName}
          infoList={[
            `Sector: ${data.tickerInfo.sector}`,
            `Industry: ${data.tickerInfo.industry}`,
            `Company Summary: ${data.tickerInfo.companySummary}`,
          ]}
        />
      </AccordionCard>
      <AccordionCard header={`${ticker} Performance`} open={false}>
        <TimeSeriesPlot
          plotData={data.history}
          title="Historical Prices (1y)"
        />
        <InfoList
          items={[
            `Current Price: $${data.tickerInfo.price}`,
            `Open Price: $${data.tickerInfo.open}`,
            `Prev Close: $${data.tickerInfo.prevClose}`,
            `Day Change ($): ${data.tickerInfo.dayChange}`,
            `Day Change (%): ${data.tickerInfo["%DayChange"]}`,
            `52 Week High: $${data.tickerInfo["52WeekHigh"]}`,
            `52 Week Low: $${data.tickerInfo["52WeekLow"]}`,
            `52 Week Returns: ${data.tickerInfo["52WeekReturns"]}%`,
          ]}
          breakpoint="md"
        />
      </AccordionCard>

      <AccordionCard header={`${ticker} News`} open={false}>
        <InfoList
          items={data.news.map((news) => news.name)}
          links={data.news.map((news) => news.url)}
        />
      </AccordionCard>
    </>
  );
};

export default StockInfo;
