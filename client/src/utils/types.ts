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