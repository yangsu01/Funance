// utils
import useToken from './useToken';
import api from '../utils/api'

type SuccessResponse = {
    status: "success"
    msg: string
    data: string
}

type ErrorResponse = {
    status: "error"
    msg: string
}

type PostResponse = SuccessResponse | ErrorResponse

export default function usePost <T>() {
    const { token } = useToken()
    let responseData: PostResponse = {status: 'error', msg: 'Failed to Submit'}

    const postData = async (route: string, data: T) => {
        try {
            const response = await api.post(route, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            responseData = {status: "success", msg: response.data.msg, data: response.data.data}
        } catch (err: any) {
            if (err.response && err.response.data.msg) {
                responseData = {status: "error", msg: err.response.data.msg}
            } else {
                responseData = {status: "error", msg: err.message}
            }
        } finally {
            return responseData
        }
    }
    return {postData}
}