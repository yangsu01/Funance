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
}

// info needed before buy transaction
export type BuyInfo = {
    gameName: string;
    availableCash: number;
    feeType: string;
    transactionFee: number;
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
}

// blog catalog
export type BlogCard = {
    date: string;
    description: string;
    fileName: string;
    title: string;
}

// blog post
export type BlogInfo = {
    fileName: string;
    title: string;
}
export type BlogData = {
    content: string;
    creationDate: string;
    description: string;
    fileName: string;
    title: string;
}
export type BlogPostData = {
    blogCatalog: BlogInfo[];
    blogData: BlogData;
}

// games sort options
export type GameSortOptions = "Participants" | "Start Date" | "Alphabetical";

// games filter options
export type GameFilterOptions = "All" | "Not Started" | "In Progress" | "Completed" | "Public" | "Private" | "Not Joined";

// time series plot data for line chart labels
export type LineChartLabel  = {
    title: string;
    xLabel: string;
    yLabel: string;
    xUnit?: "minute" | "hour" | "day" | "week" | "month" | "year";
}

// leaderboard plots filter options
export type LeaderboardFilterOptions = "All" | "Top 5" | "Bottom 5";