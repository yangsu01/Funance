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

// game info
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

// alert message
export type AlertMessage = {
    alert: string;
    alertType: "success" | "danger" | "warning";
}

// game details
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

// closing history of a portfolio
export type TimeSeriesPlotData = {
    x: string[];
    y: number[];
    name: string
}

// portfolio performance
export type TopPortfolio = {
    'Rank': number | string;
    'Username': string;
    'Portfolio Value': number;
    'Change (%)': number;
    'Portfolio Age (days)': number;
    'Daily Change (%)': number;
}

// portfolio daily performance
export type DailyPortfolio = {
    'Rank': number | string;
    'Username': string;
    'Change (%)': number;
    'Change ($)': number;
    'Portfolio Value': number;
}

// game leaderboard data
export type GameLeaderboardData = {
    gameDetails: GameDetails;
    dailyHistory: TimeSeriesPlotData[];
    closingHistory: TimeSeriesPlotData[];
    dailyHistoryDate: string;
    topPortfolios: TopPortfolio[];
    dailyPortfolios: DailyPortfolio[];
}

// sign up form data
export type SignUpFormData = {
    email: string;
    username: string;
    password1: string;
    password2: string;
}

export type SignInFormData = {
    email: string;
    password: string;
}