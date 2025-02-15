<template>
    <form @submit.prevent class="p-form p-form--user">
        <div class="p-form__label"><strong>Mail</strong></div>
        <div class="p-form__input">
            <i class="fa-regular fa-envelope p-form__input-icon"></i>
            <input
                v-model="Form.email"
                type="mail"
                placeholder="メール"
                class="c-input c-input--form"
            />
            <div class="p-form__error">
                <label v-show="formValidation.email" class="p-form__error-message">{{
                    formValidation.email
                }}</label>
            </div>
        </div>
        <div class="p-form__label"><strong>Password </strong></div>
        <div class="p-form__input">
            <i class="fa-solid fa-key p-form__input-icon"></i>
            <input
                v-model="Form.password"
                type="password"
                autocomplete="off"
                placeholder="パスワード"
                class="c-input c-input--form"
            />
            <div class="p-form__error">
                <div v-if="Errors && Errors.email" class="p-form__error-message">
                    <label v-for="msg in Errors.email" :key="msg">
                        {{ msg }}
                    </label>
                </div>
                <div v-if="Errors && Errors.password" class="p-form__error-message">
                    <label v-for="msg in Errors.password" :key="msg">
                        {{ msg }}
                    </label>
                </div>
                <label v-show="formValidation.password" class="p-form__error-message">{{
                    formValidation.password
                }}</label>
            </div>
        </div>
        <button
            type="button"
            :disabled="isLoaderFlg"
            v-show="
                Form.email &&
                Form.password &&
                !formValidation.email &&
                !formValidation.password &&
                !Errors?.email &&
                !Errors?.password
            "
            @click.prevent="toLogin"
            title="ログイン"
            class="p-form__button c-button c-button--form"
        >
            Login
        </button>
        <button
            type="button"
            v-show="
                !Form.email ||
                !Form.password ||
                formValidation.email ||
                formValidation.password ||
                Errors?.email ||
                Errors?.password
            "
            class="p-form__button c-button c-button--form c-button--disabled"
        >
            Inputting...
        </button>
    </form>
</template>
<script setup lang="ts">
//ログインメソッド
import { useRouter } from 'vue-router'
import useLoaderStore from '@/ts/stores/loader'
import useAuthStore from '@/ts/stores/auth'
import { useForm } from '@/ts/methods/useForm'
import type { Login } from '../types'
import { LOGIN } from '../types'

const { apiStatusFlg, login, loginErrorMessage } = useAuthStore()
const { isLoaderFlg, showLoader, closeLoader } = useLoaderStore()
const router = useRouter()

const { Validate, formValidation, ValidationFlg, CreateForm, Form, Errors, items } =
    useForm<Login>()
const toLogin = async () => {
    //エラーメッセージを空にしてからバリデーション
    Validate()
    //バリデーションチェックを通過しなじゃったら処理中止
    if (!ValidationFlg.value) {
        return false
    } else {
        //loader画面を呼び出す
        showLoader('login...')
        //loginAPIを呼び出す

        await login(Form.value as Login)

        //通信終了後loader画面を閉じる
        closeLoader()
        //loginメソッドが成功したら
        if (apiStatusFlg.value) {
            //TOPページへリダイレクト
            router.push('/')
        } else {
            Errors.value = loginErrorMessage.value
        }
    }
}
;(() => {
    items.value = LOGIN
    CreateForm<Login>()
})()
</script>
