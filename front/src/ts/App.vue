<template>
    <div class="l-wrapper">
        <NavComponent />
        <main class="l-main">
            <div v-show="isLoaderFlg" class="p-loader">
                <div class="p-loader__message">
                    <LoaderComponent>
                        <template #body>{{ loaderMessage }}</template></LoaderComponent
                    >
                </div>
            </div>
            <div class="p-container">
                <Message />
                <Welcome v-show="welcomeFlg" />
                <router-view />
            </div>
        </main>
        <footer class="l-footer">
            <div class="p-container">
                <div class="l-footer__nav">
                    <div class="l-footer__nav-container">
                        <FooterNav />
                    </div>
                    <div class="l-footer__link">
                        <router-link class="c-icon c-icon--footer" to="/">
                            <img @click="searchReset" src="../image/logo.png" alt="logo" />
                        </router-link>
                        <ul class="c-nav c-nav--sns">
                            <li class="c-nav__item">
                                <a
                                    href="https://github.com/fujita615"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="c-nav__link c-nav__link--sns"
                                >
                                    <i class="fab fa-github faa-shake animated-hover"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="l-footer__info">
                    <div class="l-footer__colophon">
                        <button
                            type="button"
                            @click="setContactForm"
                            class="c-link c-link--footer c-link--no-line"
                        >
                            contact
                        </button>
                        <ContactForm v-show="showContactFormFlg" />
                    </div>
                    <div class="l-footer__dot"><small>・</small></div>
                    <div class="l-footer__colophon">
                        <router-link to="/policy" class="c-link c-link--footer c-link--no-line"
                            >privacy policy
                        </router-link>
                    </div>
                    <div class="l-footer__dot"><small>・</small></div>
                    <div class="l-footer__copyright">&copy;2024 Vertical Photo</div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import NavComponent from '@/ts/components/NavComponent.vue'
import FooterNav from '@/ts/components/FooterNav.vue'
import Message from '@/ts/components/MessageComponent.vue'
import ContactForm from '@/ts/components/ContactForm.vue'
import Welcome from '@/ts/components/WelcomeModal.vue'
import LoaderComponent from '@/ts/components/LoaderComponent.vue'
import {
    TOO_MANY_REQUEST,
    INTERNAL_SERVER_ERROR,
    UNAUTHORIZED,
    NOT_FOUND,
    Un_authorized
} from './util.js'
import { request } from './bootstrap'
import useLoaderStore from '@/ts/stores/loader.js'
import useFormTabStore from '@/ts/stores/formTab.js'
import useAuthStore from '@/ts/stores/auth.js'
import useErrorStore from '@/ts/stores/error.js'
import useMessageStore from '@/ts/stores/message.js'
import useSearchStore from '@/ts/stores/search.js'

//vue-routerのメソッドを読み込む
const router = useRouter()
const route = useRoute()
const { isLoaderFlg, loaderMessage, closeLoader } = useLoaderStore()
const { userReset, currentUser, isLogin } = useAuthStore()
const { welcomeFlg, showContactFormFlg, setShowContactForm } = useFormTabStore()
const { code, setCode } = useErrorStore()
const { setAlert } = useMessageStore()
const { searchReset } = useSearchStore()

//お問い合わせフォームを呼び出すイベント
const setContactForm = () => {
    if (!document.cookie) {
        router.push('/nocookie')
        return false
    }
    setShowContactForm()
}

//クエリパラメータの変更を察知したらエラーコードをリセットする
//（URLは同じでもクエリパラメータが変わればページ遷移とみなす）
watch(route, () => {
    setCode(null)
})

//errorストアのcode値(HTTPステータス)を参照・監視して表示を即時に切り替える
watch(
    code,
    (newStatus) => {
        if (newStatus === INTERNAL_SERVER_ERROR) {
            router.push('/500')
            // 認証切れ
        } else if (newStatus === UNAUTHORIZED || newStatus === Un_authorized) {
            request.get('/sanctum/csrf-cookie')
            // もしログインしていた状態から認証切れになった場合は（=ランディング時は除外する）
            if (isLogin.value === true) {
                userReset()
                setAlert('ログイン時間超過のため処理を中止しました', 6000)
                closeLoader()
                router.push('/login')
            }
            //404エラー
        } else if (newStatus === NOT_FOUND) {
            router.push('/notfound')
        }
        //429エラー
        else if (newStatus === TOO_MANY_REQUEST) {
            router.push('/429')
        }
    },
    { immediate: true }
)
//画面生成時はまずログイン状態かを確認してuserデータを取得する
;(() => {
    currentUser()
})()
</script>
