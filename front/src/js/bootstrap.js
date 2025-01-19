import axios from 'axios'
export const API_URL = 'http://localhost'

export const request = axios.create({
    baseURL: API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    },
    //cookieを付与
    withCredentials: true,
    withXSRFToken: true
})
request.interceptors.response.use(
    (response) => response,
    (error) => error.response || error
)
//APIサーバからのレスポンス時に挟む処理
//APIからのレスポンスがあればそのまま、errorならerrorをresponseに詰める
axios.interceptors.response.use(
    (response) => response,
    (error) => error.response || error
)
