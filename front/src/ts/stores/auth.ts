import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import {
    dataReset,
    OK,
    CREATED,
    LOGOUT,
    UNPROCESSABLE_ENTITY //APIサーバーで受信したけどバリデーションエラーで処理中止となったリクエスト
} from '../util.ts'
import { request } from '../bootstrap.ts'
import type { User, Register, Login, RegisterItem, PassWordForm } from '@/ts/types.ts'
import useErrorStore from '@/ts/stores/error.ts'
import { useForm } from '@/ts/methods/useForm.ts'
const { Errors } = useForm()

const useAuthStore = defineStore(
    'auth',
    () => {
        const user = ref<User>({
            name: '',
            email: '',
            nickname: ''
        }) //ログイン中のユーザーの登録情報
        const apiStatusFlg = ref<boolean>(false) //API処理の成功か失敗かを表すflg
        const { setCode } = useErrorStore()
        const loginErrorMessage = ref<Login>({ email: '', password: '' }) //APIresponseに含まれたログインエラーメッセージ
        const registerErrorMessage = ref<Register>({
            name: '',
            email: '',
            password: '',
            nickname: '',
            password_confirmation: ''
        })
        // APIresponseに含まれた登録時エラーメッセージ
        const AuthErrors = ref<User | Register | PassWordForm>()
        function setAuthErrors<T extends User | Register | PassWordForm>(errorObj: T): void {
            AuthErrors.value = errorObj
        }

        // ログインしているか否かを表すflg
        const isLogin = ref<boolean>(false)
        //isLoginを更新するメソッド
        function isLoginUpdaate() {
            if (user.value.email !== '') {
                isLogin.value = true
            } else isLogin.value = false
        }
        //認証切れの際にUserデータを空にするメソッド
        function userReset() {
            user.value = { nickname: '', name: '', email: '' }
            isLoginUpdaate()
        }
        //ログイン状態を確認してstate.userを更新するメソッド
        async function currentUser() {
            //setapiStatusFlgを初期化
            apiStatusFlg.value = false
            const response = await request.get('/api/user')
            //response（サーバーが保持しているユーザー情報）を変数apiUserに詰める（ログインしてなければ''を詰める）
            const apiUser = response.data || ''
            //通信(HTTPステータス)がOKなら
            if (response.status === OK) {
                //API通信結果を示すsetapiStatusFlgをtrueに
                apiStatusFlg.value = true
                //ユーザー情報を更新して処理終了
                user.value = apiUser
                isLoginUpdaate()
                return false
            }
            //通信がOK以外ならerrorストアにHTTPステータスを渡す
            setCode(response.status)
        }
        //ユーザー新規登録メソッド
        async function register(formUserData: Register) {
            apiStatusFlg.value = false
            //registerAPIを呼び出してFormに入力された登録データを渡し、そのレスポンス（userデータ）を受け取る
            await request.get('/sanctum/csrf-cookie')
            const response = await request.post('/api/register', formUserData)
            if (response.status === CREATED) {
                apiStatusFlg.value = true
                user.value = response.data
                isLoginUpdaate()
                return false
            }
            if (response.status === UNPROCESSABLE_ENTITY) {
                setAuthErrors<Register>(response.data.errors)
            } else {
                setCode(response.status)
            }
        }

        //ログインメソッド
        async function login(formUserData: Login) {
            apiStatusFlg.value = false
            await request.get('/sanctum/csrf-cookie')
            const response = await request.post('/api/login', formUserData)
            if (response.status === OK) {
                apiStatusFlg.value = true
                user.value = response.data
                isLoginUpdaate()
                return false
            }
            apiStatusFlg.value = false
            if (response.status === UNPROCESSABLE_ENTITY) {
                loginErrorMessage.value = response.data.errors
            } else {
                setCode(response.status)
            }
        }
        //ログアウトメソッド
        async function logout() {
            apiStatusFlg.value = false
            const response = await request.post('/api/logout')
            if (response.status === LOGOUT) {
                apiStatusFlg.value = true
                userReset()
                await request.get('/sanctum/csrf-cookie')
                return false
            }
            apiStatusFlg.value = false
            const { setCode } = useErrorStore()
            setCode(response.status)
        }
        //ユーザー情報編集メソッド
        async function editUser(formUserData: User) {
            apiStatusFlg.value = false

            const response = await request.patch('/api/register', formUserData)
            if (response.status === CREATED) {
                apiStatusFlg.value = true
                user.value = response.data
                isLoginUpdaate()
                return false
            }
            if (response.status === UNPROCESSABLE_ENTITY) {
                setAuthErrors<PassWordForm>(response.data.errors)
            } else {
                setCode(response.status)
            }
        }
        //パスワード変更メソッド
        async function editPassWord(formUserData: PassWordForm) {
            apiStatusFlg.value = false

            const response = await request.put('/api/register', formUserData)
            if (response.status === OK) {
                apiStatusFlg.value = true
                //新パスワードでの再ログインを促すためにログアウト状態へ
                userReset()
                await request.get('/sanctum/csrf-cookie')
                return false
            }
            if (response.status === UNPROCESSABLE_ENTITY) {
                AuthErrors.value = response.data.errors
            } else {
                setCode(response.status)
            }
        }
        //ユーザー登録削除メソッド
        async function deleteUser() {
            apiStatusFlg.value = false
            const response = await request.delete('/api/register')
            if (response.status === OK) {
                apiStatusFlg.value = true
                userReset()
                return false
            }
            setCode(response.status)
        }
        // ログインエラーメッセージを一括クリアするメソッド
        function loginErrorMessageClear() {
            dataReset(loginErrorMessage.value)
        }
        //登録エラーメッセージを一括クリアするメソッド
        function registerErrorMessageClear() {
            dataReset(registerErrorMessage.value)
        }
        // 登録エラーメッセージをクリアするメソッド(単体)
        function registerErrorMessageSingleClear(item: RegisterItem) {
            registerErrorMessage.value[item] = ''
        }
        return {
            user,
            apiStatusFlg,
            isLoginUpdaate,
            isLogin,
            loginErrorMessage,
            registerErrorMessage,
            loginErrorMessageClear,
            registerErrorMessageClear,
            registerErrorMessageSingleClear,
            currentUser,
            userReset,
            register,
            login,
            logout,
            editUser,
            editPassWord,
            deleteUser,
            Errors,
            AuthErrors,
            setAuthErrors
        }
    },
    {
        persist: {
            storage: sessionStorage,
            pick: ['isLogin']
        }
    }
)
export default () => {
    const authStore = useAuthStore()
    return { ...authStore, ...storeToRefs(authStore) }
}
