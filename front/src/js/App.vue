<template>
    <div class="l-wrapper">
        <NavComponent />
        <main class="l-main">
            <div v-show="showLoaderFlg" class="p-loader">
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
                                    href=""
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

<script>
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

export default {
    components: {
        NavComponent,
        FooterNav,
        Message,
        ContactForm,
        Welcome,
        LoaderComponent
    },
    computed: {
        //errorストアのcode値(HTTPステータス)を参照するメソッド
        errorCode() {
            return this.$store.state.error.code
        },
        showPhotoForm() {
            return this.$store.state.formTab.showPhotoForm
        },
        showContactForm() {
            this.$store.commit('formTab/setMailSituation', 'edit')
            return this.$store.state.formTab.showContactForm
        },
        showWelcomeDialog() {
            return this.$store.state.formTab.welcomeFlg
        },
        showLoaderFlg() {
            return this.$store.state.loader.loaderFlg
        },
        setLoaderMessage() {
            return this.$store.state.loader.loaderMessage
        }
    },
    methods: {
        //logoをクリックしたら絞り込み検索表示を解除するメソッドを呼び出す
        resetSearchPhoto() {
            this.$store.dispatch('search/searchReset')
        },
        async setContactForm() {
            if (!document.cookie) {
                this.$router.push('/nocookie')
                return false
            }
            this.$store.commit('formTab/setShowContactForm')
        }
    },
    watch: {
        // errorCodeを監視してステータスによってリダイレクト先を指定
        errorCode: {
            async handler(status) {
                //500エラー
                if (status === INTERNAL_SERVER_ERROR) {
                    this.$router.push('/500')

                    // 認証切れ
                } else if (status === UNAUTHORIZED || status === Un_authorized) {
                    await request.get('/sanctum/csrf-cookie')
                    if (this.$store.getters['auth/check']) {
                        this.$store.commit('auth/setUser', '')
                        await this.$store.commit('message/setAlert', {
                            message: 'ログイン時間超過のため処理を中止しました',
                            timeout: 6000
                        })
                        this.$router.push('/login')
                    }
                    //404エラー
                } else if (status === NOT_FOUND) {
                    this.$router.push('/notfound')
                }
                //500エラー
                else if (status === TOO_MANY_REQUEST) {
                    this.$router.push('/429')
                }
            },
            immediate: true
        },
        //クエリパラメータの変更を察知したらエラーコードをリセットする
        //（URLは同じでもクエリパラメータが変わればページ遷移とみなす）
        $route() {
            this.$store.commit('error/setCode', null)
        }
    }
}
</script>
