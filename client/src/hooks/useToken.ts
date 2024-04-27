import { useState } from "react";

export default function useToken () {

    const getToken = () => {
        const accessToken = localStorage.getItem('token');
        return accessToken ? accessToken : null;
    }

    const [token, setToken] = useState(getToken());

    const saveToken = (accessToken: string) => {
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
    }

    const removeToken = () => {
        localStorage.removeItem('token');
        setToken(null);
    }

    return {
        setToken: saveToken,
        token,
        removeToken
    }
}