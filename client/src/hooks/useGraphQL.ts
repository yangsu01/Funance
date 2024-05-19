import { useState } from 'react'

const URL = import.meta.env.VITE_CONTENTFUL_API_URL as string
const ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN as string
const HEADERS = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
}

type SuccessResponse<T> = {
    status: "success"
    data: T
}

type ErrorResponse = {
    status: "error"
    msg: string
}

type FetchResponse<T> = SuccessResponse<T> | ErrorResponse

export default function useGraphQL <T>() {
    const [loading, setLoading] = useState<boolean | null>(null)

    let responseData: FetchResponse<T> = {status: 'error', msg: 'Failed to Load'}

    const fetchContent = async (query: string) => {
        setLoading(true)
        
        const response = await window.fetch(URL, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ query })
        })

        const data = await response.json()
        
        if (data.errors) {
            responseData = { status: 'error', msg: data.errors[0].message }
        } else if (data.data) {
            responseData = { status: 'success', data: data.data }
        }

        setLoading(false)
        return responseData;
    }

    return { loading, fetchContent }
}