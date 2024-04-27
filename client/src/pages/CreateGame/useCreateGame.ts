import {CreateGameFormData} from "../../utils/types";

export default function useCreateGame (formData: CreateGameFormData) {
    const startDate = new Date(formData.startDate);
    const currentDate = new Date();

    // offset start date by 1 day cause its behind by 1 day for some reason??
    const startDateNum = startDate.setDate(startDate.getDate() + 1);
    const currentDateNum = currentDate.setDate(currentDate.getDate());

    // handle empty variables
    if (!formData.endDate) {
        delete formData.endDate;
    }
    if (!formData.password) {
        delete formData.password;
    }
    if (startDateNum <= currentDateNum) {
        return {error: "Start date cannot be in the past!"}
    }
    if (formData.endDate) {
        const endDate = new Date(formData.endDate);
        if (endDate <= startDate) {
            return {error: "End date must be after start date!"}
        }
    }
    if (formData.startingCash <= 0) {
        return {error: "Starting cash must be greater than 0!"}
    }
    if (formData.transactionFee < 0) {
        return {error: "Transaction fee cannot be negative!"}
    }

    return {data: formData}
}