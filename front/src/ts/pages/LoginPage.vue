<template>
    <div class="p-auth">
        <div class="p-auth__container">
            <div class="p-auth__tab">
                <label
                    @click="chengeLoginForm"
                    class="c-label c-label--tab"
                    :class="{ 'is-active': formFlg === 'login' }"
                    >ログイン
                </label>
                <label
                    @click="chengeRegisterForm"
                    class="c-label c-label--tab"
                    :class="{ 'is-active': formFlg === 'register' }"
                    >会員登録
                </label>
            </div>

            <!-- ログインフォーム -->
            <LoginForm v-if="formFlg === 'login'" />
            <!-- 会員登録フォーム -->
            <RegisterForm v-if="formFlg === 'register'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import useFormTabStore from '@/ts/stores/formTab'
import RegisterForm from '../components/RegisterForm.vue'
import LoginForm from '../components/LoginForm.vue'
import type { FormFlg } from '../types'

const { hideNavFlg, showNavFlg } = useFormTabStore()
const formFlg = ref<FormFlg>('login') //入力フォームの種類

const chengeLoginForm = () => {
    formFlg.value = 'login'
}
const chengeRegisterForm = () => {
    formFlg.value = 'register'
}

//ページアクセス時はloginフォームを表示/navを非表示
;(() => {
    formFlg.value = 'login'
    hideNavFlg()
})()
//login.registerページ離脱後はnavを表示
onUnmounted(() => {
    showNavFlg()
})
</script>
