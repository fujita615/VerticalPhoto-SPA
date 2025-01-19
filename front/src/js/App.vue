<template>
    <div class="l-wrapper">
        <NavComponent />
        <main class="l-main">
            <div v-show="isLoaderFlg" class="p-loader">
                <div class="p-loader__message">
                    <LoaderComponent>
                        <template #body>{{ setLoaderMessage }}</template></LoaderComponent
                    >
                </div>
            </div>
            <div class="p-container">
                <Message />
                <Welcome v-show="showWelcomeDialog" />
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
                            <img @click="resetSearchPhoto" src="../image/logo.png" alt="logo" />
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
                        <ContactForm v-show="showContactForm" />
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

<script setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import NavComponent from './components/NavComponent.vue'
import FooterNav from './components/FooterNav.vue'
import Message from './components/MessageComponent.vue'
import ContactForm from './components/ContactForm.vue'
import Welcome from './components/WelcomeModal.vue'
import LoaderComponent from './components/LoaderComponent.vue'
import {
    TOO_MANY_REQUEST,
    INTERNAL_SERVER_ERROR,
    UNAUTHORIZED,
    NOT_FOUND,
    Un_authorized
} from './util.js'
import { request } from './bootstrap'
import { useForm } from './methods/UseForm'
import { useAuth } from './methods/UseAuth'

//vuexのメソッドを読み込む
const store = useStore()
//vue-routerのメソッドを読み込む
const router = useRouter()
const route = useRoute()
const { isLoaderFlg } = useForm()
const { isLogin } = useAuth()
//welcomeダイアログを呼び出すflgを参照
const showWelcomeDialog = computed(() => {
    return store.state.formTab.welcomeFlg
})
//loaderで表示するmessegeを参照
const setLoaderMessage = computed(() => {
    return store.state.loader.loaderMessage
})

//絞り込み検索表示を解除するメソッドを呼び出すイベント
const resetSearchPhoto = () => {
    store.dispatch('search/searchReset')
}
//お問い合わせフォームを呼び出すイベント
const setContactForm = () => {
    if (!document.cookie) {
        router.push('/nocookie')
        return false
    }
    store.commit('formTab/setShowContactForm')
}
const showContactForm = computed(() => {
    store.commit('formTab/setMailSituation', 'edit')
    return store.state.formTab.showContactForm
})

const errorCode = computed(() => {
    return store.state.error.code
})

//クエリパラメータの変更を察知したらエラーコードをリセットする
//（URLは同じでもクエリパラメータが変わればページ遷移とみなす）
watch(route, () => {
    store.commit('error/setCode', null)
})

//errorストアのcode値(HTTPステータス)を参照・監視して表示を即時に切り替える
watch(
    errorCode,
    (newStatus) => {
        if (newStatus === INTERNAL_SERVER_ERROR) {
            router.push('/500')
            // 認証切れ
        } else if (newStatus === UNAUTHORIZED || newStatus === Un_authorized) {
            request.get('/sanctum/csrf-cookie')
            // もしログインしていた状態から認証切れになった場合は（=ランディング時は除外する）
            if (isLogin.value) {
                store.commit('auth/setUser', '')
                store.commit('message/setAlert', {
                    message: 'ログイン時間超過のため処理を中止しました',
                    timeout: 6000
                })
                store.dispatch('loader/closeLoader')
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
</script>
