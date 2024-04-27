import { SignUpFormData} from "../../utils/types";

export default function useSignUp (formData: SignUpFormData) {
    if (formData.email.length < 3) {
        return {error: "Email too short"};
    } else if (formData.password1 !== formData.password2) {
        return {error: "Passwords do not match"};
    } else if (formData.password1.length < 6) {
        return {error: "Password too short"};
    } else if (formData.username.length < 4) {
        return {error: "Username too short"};
    } else {
        return {};
    }
}