export default function useValidateDate (
    date: string,
    endDate?: string,
    nextMarketDate?: string,
) {
    const inputDate = new Date(date);
    const today = new Date();

    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // if end date is provided, check if date is beyond end date
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        
        if (inputDate > end) {
            return false;
        }
    }

    // if next market date is provided, check if date is beyond next market date
    if (nextMarketDate) {
        const nextMarket = new Date(nextMarketDate);
        nextMarket.setHours(0, 0, 0, 0);
        
        if (inputDate < nextMarket) {
            return false;
        }
    }

    // if date is in the past, return false
    if (inputDate < today) {
        return false;
    }

    return true;
}