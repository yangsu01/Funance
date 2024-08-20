import { Document } from "@contentful/rich-text-types";

// sign up form data
export type SignUpFormData = {
    email: string;
    username: string;
    password1: string;
    password2: string;
}

// sign in form data
export type SignInFormData = {
    email: string;
    password: string;
}

// create game form
export type CreateGameFormData = {
    name: string;
    password?: string;
    startDate: string;
    endDate?: string;
    startingCash: number;
    transactionFee: number;
    feeType: string;
}

// game info card data
export type GameInfo = {
    gameId: number;
    name: string;
    creator: string;
    startDate: string;
    endDate: string;
    status: string;
    participants: number;
    joinedGame: boolean;
    details: string;
    passwordRequired: boolean;
}

// game leaderboard data
export type GameDetails = {
    name: string
    creator: string
    participants: string
    startDate: string
    endDate: string
    startingCash: string
    transactionFee: string
    feeType: string
    joinedGame: boolean
    passwordRequired: boolean
    lastUpdated: string
    gameDuration: string
    status: string
    portfolioId: number
}
export type TimeSeriesPlotData = {
    x: string[];
    y: number[];
    name: string
}
export type TopPortfolio = {
    'Rank': number | string;
    'Username': string;
    'Value': number;
    'Change': number;
    'Age (days)': number;
    'Daily Change': number;
}
export type DailyPortfolio = {
    'Rank': number | string;
    'Username': string;
    'Change': number;
    '% Change': number;
    'Value': number;
}
export type GameLeaderboardData = {
    gameDetails: GameDetails;
    dailyHistory: TimeSeriesPlotData[];
    closingHistory: TimeSeriesPlotData[];
    dailyHistoryDate: string;
    topPortfolios: TopPortfolio[];
    dailyPortfolios: DailyPortfolio[];
}

// user portfolio data
export type UserPortfolios = {
    gameName: string;
    portfolioId: string;
}
export type PortfolioDetails = {
    portfolioId: number;
    gameId: number;
    gameName: string;
    gameStatus: string;
    startingCash: number;
    participants: number;
    gameStartDate: string;
    gameEndDate: string;
    transactionFee: number;
    feeType: string;
    availableCash: number;
    portfolioValue: number;
    change: number;
    profit: number;
    lastUpdated: string;
    overallRank: number;
    dayChange: number;
    dayChangePercent: number;
}
export type LinePlotData = {
    x: string[];
    y: number[];
}
export type PiePlotData = {
    labels: string[];
    values: number[];
}
export type Transaction = {
    "Ticker": string;
    "Name": string;
    "Type": string;
    "Shares": number;
    "Share Price": number;
    "Total Value": number;
    "Currency": string;
    "Profit/Loss": string | number;
    "Date (EST)": string;
}
export type Holding = {
    'Ticker': string,
    'Shares Owned': number
    'Average Price': number
    'Current Price': number
    'Net Change': number
    'Total Change': number
    '% Change': number
    'Day Change': number
    '% Day Change ': number
    'Market Value': number
    'Currency': string
}
export type PendingOrders = {
    'id': number;
    'Order Type': string;
    'Stock Symbol': string;
    'Shares': number;
    'Target Price': number;
    'Current Price': number;
    'Expiration Date': string;
    'Order Date': string;
}
export type PortfolioData = {
    userPortfolios: UserPortfolios[];
    portfolioDetails: PortfolioDetails;
    closingHistory: LinePlotData;
    dailyHistory: LinePlotData;
    dailyHistoryDate: string;
    holdingsBreakdown: PiePlotData;
    sectorBreakdown: PiePlotData;
    portfolioTransactions: Transaction[];
    portfolioHoldings: Holding[];
    pendingOrders: PendingOrders[];
}

// info needed before buy transaction
export type BuyInfo = {
    gameName: string;
    availableCash: number;
    feeType: string;
    transactionFee: number;
    startDate: string;
    gameStatus: string;
}

// info needed before sell transaction
type HoldingsInfo = {
    [ticker: string]: {
        averagePrice: number;
        sharesOwned: number;
    }
}
export type SellInfo = {
    gameName: string;
    availableCash: number;
    feeType: string;
    transactionFee: number;
    holdings: string[];
    holdingsInfo: HoldingsInfo;
}


// ticker info
type StockNews = {
    name: string;
    url: string;
}
type TickerInfo = {
    "%DayChange": number;
    "52WeekHigh": number;
    "52WeekLow": number;
    "52WeekReturns": number;
    companyName: string;
    companySummary: string;
    currency: string;
    dayChange: number;
    industry: string;
    open: number;
    prevClose: number;
    price: number;
    sector: string;
}
export type StockData = {
    history: LinePlotData;
    news: StockNews[];
    tickerInfo: TickerInfo;
    stockId: number;
    marketClosed: boolean;
    nextMarketDate: string;
}

// games filter options
export type GameFilterOptions = "All" | "Not Started" | "In Progress" | "Completed" | "Joined" | "Not Joined";

// time series plot data for line chart labels
export type LineChartLabel  = {
    title: string;
    xLabel: string;
    yLabel: string;
    xUnit?: "minute" | "hour" | "day" | "week" | "month" | "year";
}

// leaderboard plots filter options
export type LeaderboardFilterOptions = "All" | "Top 5" | "Bottom 5";

// blog catalog data
export type BlogItem = {
    sys: {
        id: string;
        publishedAt: string;
        firstPublishedAt: string;
    };
    route: string;
    title: string;
    description: string;
}

export type BlogListData = {
    funanceBlogPostCollection: {
        items: BlogItem[];
    };
}

// blog post data
export type BlogLinks = {
    assets: {
        block: {
            sys: {
                id: string;
            };
            url: string;
            title: string;
            width: number;
            height: number;
            description: string;
        }[];
    };
}

export type BlogData = {
    title: string;
    sys: {
        publishedAt: string;
        firstPublishedAt: string;
    };
    description: string;
    body: {
        json: Document;
        links: BlogLinks;
    };
}

export type BlogPostData = {
    funanceBlogPost: BlogData;

    funanceBlogPostCollection: {
        items: BlogItem[];
    };
}

export type OrderTypes = "market buy" | "limit buy" | "market sell" | "limit sell" | "stop-loss"