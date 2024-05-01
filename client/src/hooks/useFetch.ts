import { useState } from 'react'

// utils
import api from '../utils/api'
// context
import { useAuth } from '../contexts/AuthContext'

type SuccessResponse<T> = {
    status: "success"
    data: T
}

type ErrorResponse = {
    status: "error"
    msg: string
}

type FetchResponse<T> = SuccessResponse<T> | ErrorResponse

export default function useFetch <T>() {
    const [loading, setLoading] = useState<boolean | null>(null)
    const { token } = useAuth()

    let responseData: FetchResponse<T> = {status: 'error', msg: 'Failed to Load'}

    const fetchData = async (route: string) => {
        setLoading(true)

        try {
            const response = await api.get(route, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            responseData = {status: 'success', data: response.data.data}
        } catch (err: any) {
            if (err.response && err.response.data.msg) {
                responseData = {status: 'error', msg: err.response.data.msg}
            } else {
                responseData = {status: 'error', msg: err.message}
            }
        } finally {
            setLoading(false)
            return responseData
        }
    }
    return { fetchData, loading }
}