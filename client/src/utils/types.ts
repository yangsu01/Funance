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