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


// alert message
export type AlertMessage = {
    alert: string;
    alertType: "success" | "danger" | "warning";
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
}
export type TimeSeriesPlotData = {
    x: string[];
    y: number[];
    name: string
}
type TopPortfolio = {
    'Rank': number | string;
    'Username': string;
    'Value': number;
    'Change': number;
    'Age (days)': number;
    'Daily Change': number;
}
type DailyPortfolio = {
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
type Transaction = {
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
type Holding = {
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
