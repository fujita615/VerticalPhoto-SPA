<template>
    <ul v-show="isLogin" class="c-nav">
        <li class="c-nav__item">
            <button
                type="button"
                :disabled="isLogoutFlg"
                @click="logout"
                class="c-nav__link c-nav__link--underline c-nav__link--footer"
            >
                Logout
            </button>
        </li>
    </ul>
</template>
<script>
export default {
    computed: {
        //ログイン中か(true)否(false)かを表す
        isLogin() {
            return this.$store.getters['auth/check']
        },
        //API通信が成功(true)か失敗(false)かを表すFlg
        apiStatusFlg() {
            return this.$store.state.auth.apiStatus
        },
        //logout処理中（loader呼び出し中）を表すflg（多重クリックを防ぐ）
        isLogoutFlg() {
            return this.$store.state.loader.loaderFlg
        }
    },
    methods: {
        //ログアウトメソッドを呼びだすメソッド
        async logout() {
            //loader画面を呼び出す
            await this.$store.dispatch('loader/showLoader', 'logout...')
            //logout処理
            await this.$store.dispatch('auth/logout')
            //Logout成功したらログインページへリダイレクト
            if (this.apiStatusFlg) {
                //loader画面を終了させる
                await this.$store.dispatch('loader/closeLoader')
                this.$store.commit('message/setSuccess', {
                    message: 'またのご利用を心よりお待ちしております',
                    timeout: 2000
                })
                this.$router.push('/login')
            }
        }
    }
}
</script>
