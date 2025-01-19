import {
    OK,
    CREATED,
    LOGOUT,
    UNPROCESSABLE_ENTITY //APIサーバーで受信したけどバリデーションエラーで処理中止となったリクエスト
} from '../util'
import { request } from '../bootstrap'

export default {
    namespaced: true,
    state: {
        user: '', //ログイン中のユーザーの登録情報
        apiStatus: '', //API処理の成功か失敗かを表すflg
        loginErrorMessage: '', //APIresponseに含まれたログインエラーメッセージ
        registerErrorMessage: '' // APIresponseに含まれた登録時エラーメッセージ
    },
    getters: {
        check: (state) => !!state.user, //ログインしているか否かを表すflg
        username: (state) => (state.user ? state.user.nickname : ''), //ログイン中のユーザーのnickname
        user: (state) => state.user, //ログイン中のユーザーの登録情報
        getloginErrorMessage: (state) => state.loginErrorMessage,
        getRegisterErrorMessage: (state) => state.registerErrorMessage,
        createNickNameFlg: (state) => !!state.registerErrorMessage.nickname //Nickname候補生成が必要かを表すflg
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setApiStatus(state, apiStatus) {
            state.apiStatus = apiStatus
        },
        setLoginErrorMessage(state, message) {
            state.loginErrorMessage = message
        },
        setRegisterErrorMessage(state, message) {
            state.registerErrorMessage = message
        },
        setRegisterErrorMessageSingle(state, item, message) {
            state.registerErrorMessage[item] = message
        }
    },
    actions: {
        //ログイン状態を確認してstate.userを更新するメソッド
        async currentUser(context) {
            //setApiStatusを初期化
            context.commit('setApiStatus', '')
            const response = await request.get('/api/user')
            //response（サーバーが保持しているユーザー情報）を変数apiUserに詰める（ログインしてなければ''を詰める）
            const apiUser = response.data || ''

            //通信(HTTPステータス)が成功なら
            if (response.status === OK) {
                //API通信結果を示すsetApiStatusをtrueに
                context.commit('setApiStatus', true)
                //ユーザー情報を更新
                context.commit('setUser', apiUser)
                return false
            }
            //API通信(HTTPステータス)が成功以外なら setApiStatusをfalseに
            context.commit('setApiStatus', false)

            //errorストアにHTTPステータスを渡す
            context.commit('error/setCode', response.status, {
                root: true
            })
        },
        //ユーザー新規登録メソッド
        async register(context, formUserData) {
            context.commit('setApiStatus', '')
            //registerAPIを呼び出してFormに入力された登録データを渡し、そのレスポンス（userデータ）を受け取る
            await request.get('/sanctum/csrf-cookie')
            const response = await request.post('/api/register', formUserData)
            if (response.status === CREATED) {
                context.commit('setApiStatus', true)
                context.commit('setUser', response.data)
                return false
            }
            context.commit('setApiStatus', false)
            if (response.status === UNPROCESSABLE_ENTITY) {
                context.commit('setRegisterErrorMessage', response.data.errors)
            } else {
                context.commit('error/setCode', response.status, {
                    root: true
                })
            }
        },
        //ログインメソッド
        async login(context, formUserData) {
            context.commit('setApiStatus', '')
            await request.get('/sanctum/csrf-cookie')
            const response = await request.post('/api/login', formUserData)
            if (response.status === OK) {
                context.commit('setApiStatus', true)
                context.commit('setUser', response.data)

                return false
            }
            context.commit('setApiStatus', false)
            if (response.status === UNPROCESSABLE_ENTITY) {
                context.commit('setLoginErrorMessage', response.data.errors)
            } else {
                context.commit('error/setCode', response.status, {
                    root: true
                })
            }
        },
        //ログアウトメソッド
        async logout(context) {
            context.commit('setApiStatus', '')
            const response = await request.post('/api/logout')
            if (response.status === LOGOUT) {
                context.commit('setApiStatus', true)
                context.commit('setUser', '')
                await request.get('/sanctum/csrf-cookie')
                return false
            }
            context.commit('setApiStatus', false)
            context.commit('error/setCode', response.status, { root: true })
        },
        //ユーザー情報編集メソッド
        async editUser(context, formUserData) {
            context.commit('setApiStatus', '')
            const response = await request.patch('/api/register', formUserData)
            if (response.status === CREATED) {
                context.commit('setApiStatus', true)
                await context.commit('setUser', response.data)
                return false
            }
            context.commit('setApiStatus', false)
            if (response.status === UNPROCESSABLE_ENTITY) {
                context.commit('setRegisterErrorMessage', response.data.errors)
            } else {
                context.commit('error/setCode', response.status, {
                    root: true
                })
            }
        },
        //パスワード変更メソッド
        async editPassWord(context, formUserData) {
            context.commit('setApiStatus', '')
            const response = await request.put('/api/register', formUserData)
            if (response.status === OK) {
                await context.commit('setApiStatus', true)
                //新パスワードでの再ログインを促すためにログアウト状態へ
                await context.commit('setUser', '')
                await request.get('/sanctum/csrf-cookie')
                return false
            }
            context.commit('setApiStatus', false)
            if (response.status === UNPROCESSABLE_ENTITY) {
                context.commit('setRegisterErrorMessage', response.data.errors)
            } else {
                context.commit('error/setCode', response.status, {
                    root: true
                })
            }
        },
        //ユーザー登録削除メソッド
        async deleteUser(context) {
            context.commit('setApiStatus', '')
            const response = await request.delete('/api/register')
            if (response.status === OK) {
                context.commit('setApiStatus', true)
                await context.commit('setUser', '')
                return false
            }
            context.commit('setApiStatus', false)
            context.commit('error/setCode', response.status, {
                root: true
            })
        },
        //ログインエラーメッセージを一括クリアするメソッド
        loginErrorMessageClear(context) {
            context.commit('setLoginErrorMessage', '')
        },
        //登録エラーメッセージを一括クリアするメソッド
        registerErrorMessageClear(context) {
            context.commit('setRegisterErrorMessage', '')
        },
        //登録エラーメッセージをクリアするメソッド(単体)
        registerErrorMessageSingleClear(context, item) {
            context.commit('setRegisterErrorMessageSingle', item, '')
        }
    }
}
