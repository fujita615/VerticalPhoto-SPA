<template>
    <ul v-show="isLogin" class="c-nav">
        <li class="c-nav__item">
            <button
                type="button"
                v-show="navFlg"
                :disabled="isLoaderFlg"
                @click="clickLogout"
                class="c-nav__link c-nav__link--underline c-nav__link--footer"
            >
                Logout
            </button>
        </li>
    </ul>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import useAuthStore from '@/ts/stores/auth'
import useLoaderStore from '@/ts/stores/loader'
import useMessageStore from '@/ts/stores/message'
import useFormTabStore from '@/ts/stores/formTab'
const { navFlg } = useFormTabStore()

const router = useRouter()
const { logout, apiStatusFlg, isLogin } = useAuthStore()
const { isLoaderFlg, showLoader, closeLoader } = useLoaderStore()
const { setSuccess } = useMessageStore()

//ログアウトメソッドを呼びだすメソッド
const clickLogout = async () => {
    //loader画面を呼び出す
    showLoader('logout...')
    //logout処理
    await logout()
    //Logout成功したらログインページへリダイレクト
    if (apiStatusFlg.value) {
        //loader画面を終了させる
        closeLoader()
        setSuccess('またのご利用を心よりお待ちしております', 2000)
        router.push('/login')
    }
}
</script>
