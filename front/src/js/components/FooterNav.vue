<template>
    <ul v-show="isLogin" class="c-nav">
        <li class="c-nav__item">
            <button
                type="button"
                :disabled="isLoaderFlg"
                @click="logout"
                class="c-nav__link c-nav__link--underline c-nav__link--footer"
            >
                Logout
            </button>
        </li>
    </ul>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useAuth } from '../methods/UseAuth'
import { useForm } from '../methods/UseForm'

const store = useStore()
const router = useRouter()
const { apiStatusFlg, isLogin } = useAuth()
const { isLoaderFlg } = useForm()

//ログアウトメソッドを呼びだすメソッド
const logout = async () => {
    //loader画面を呼び出す
    await store.dispatch('loader/showLoader', 'logout...')
    //logout処理
    await store.dispatch('auth/logout')
    //Logout成功したらログインページへリダイレクト
    if (apiStatusFlg.value) {
        //loader画面を終了させる
        await store.dispatch('loader/closeLoader')
        store.commit('message/setSuccess', {
            message: 'またのご利用を心よりお待ちしております',
            timeout: 2000
        })
        router.push('/login')
    }
}
</script>
