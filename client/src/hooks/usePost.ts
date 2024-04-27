import useToken from './useToken';

import api from '../utils/api'

import { PostResponse } from '../utils/types';

export default function usePost <T>() {
    const { token } = useToken()
    let postResponse: PostResponse
    let postError = ''

    const postData = async (route: string, data: T) => {
        try {
            const response = await api.post(route, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            postResponse = response.data
        } catch (err: any) {
            if (err.response && err.response.data.msg) {
                postError = err.response.data.msg
            } else {
                postError = err.message
            }
        } finally {
            if (postError) {
                return {error: postError}
            } else {
                return {response: postResponse}
            }
        }
    }

    return {postData}
}