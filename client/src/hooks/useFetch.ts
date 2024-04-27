import { useState} from 'react'
import useToken from './useToken';

import api from '../utils/api'

type ApiResponse<T> = {
    data: T
}

export default function useFetch <T>() {
    const { token } = useToken()
    const [responseData, setResponseData] = useState<T | null>(null)
    const [loading, setLoading] = useState<boolean | null>(null)
    let fetchError = ''

    const fetchData = async (route: string) => {
        setLoading(true)

        try {
            const response = await api.get(route, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data: ApiResponse<T> = response.data
            setResponseData(data.data)
        } catch (err: any) {
            if (err.response && err.response.data.msg) {
                fetchError = err.response.data.msg
            } else {
                fetchError = err.message
            }
        } finally {
            setLoading(false)

            if (fetchError) {
                return fetchError
            }
        }
    }

    return { fetchData, responseData, loading }
}