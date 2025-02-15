<template>
    <form @submit.prevent class="p-form p-form--user">
        <div class="p-form__label">
            <strong>Name </strong> <small>&nbsp;※{{ nameMax }}文字以内</small>
        </div>
        <div class="p-form__input">
            <i class="fa-regular fa-circle-user p-form__input-icon"></i>
            <input
                v-model="Form.name"
                type="text"
                placeholder="お名前"
                class="c-input c-input--form"
            />
            <div class="p-form__error">
                <div v-if="Errors && Errors.name" class="p-form__error-message">
                    <label v-for="msg in Errors.name" :key="msg">
                        {{ msg }}
                    </label>
                </div>
                <label v-show="formValidation.name" class="p-form__error-message">{{
                    formValidation.name
                }}</label>
            </div>
        </div>
        <div class="p-form__label">
            <strong>Username </strong><br />
            <small
                >写真やコメント投稿時に公開される名前です <br class="c-br c-br--sp-tab" />※{{
                    nickNameMax
                }}文字以内</small
            >
        </div>
        <div class="p-form__input">
            <i class="fa-solid fa-user-tag p-form__input-icon"></i>
            <input
                v-model="Form.nickname"
                type="text"
                placeholder="ユーザーネーム"
                class="c-input c-input--form"
            />
            <div class="p-form__error">
                <label v-if="candidateName.name" class="p-form__error-message">
                    ユーザーネームのご提案：{{ candidateName.name }}
                </label>
                <div v-if="Errors && Errors.nickname">
                    <label class="p-form__error-message" v-for="msg in Errors.nickname" :key="msg">
                        {{ msg }} &nbsp;
                    </label>
                    <br class="c-br c-br--sp-tab" />
                </div>

                <label v-show="formValidation.nickname" class="p-form__error-message">{{
                    formValidation.nickname
                }}</label>
            </div>
        </div>
        <div class="p-form__label"><strong>Mail </strong></div>
        <div class="p-form__input">
            <i class="fa-regular fa-envelope p-form__input-icon"></i>
            <input
                v-model="Form.email"
                type="mail"
                placeholder="メール"
                class="c-input c-input--form"
            />
            <div class="p-form__error">
                <div v-if="Errors && Errors.email" class="p-form__error-message">
                    <label v-for="msg in Errors.email" :key="msg">
                        {{ msg }}
                    </label>
                </div>
                <label v-show="formValidation.email" class="p-form__error-message">{{
                    formValidation.email
                }}</label>
            </div>
        </div>
        <div class="p-form__label">
            <strong>Password&nbsp;</strong
            ><small> ※{{ passwordMin }}文字以上{{ passwordMax }}文字以内 </small>
        </div>
        <div class="p-form__input">
            <i class="fa-solid fa-key p-form__input-icon"></i>
            <input
                v-model="Form.password"
                autocomplete="off"
                type="password"
                placeholder="パスワード"
                class="c-input c-input--form"
            />
            <div class="p-form__error">
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
        <div class="p-form__label"><strong> Password&nbsp;</strong><small>※再入力</small></div>
        <div class="p-form__input">
            <i class="fa-solid fa-key p-form__input-icon"></i>
            <input
                v-model="Form.password_confirmation"
                type="password"
                autocomplete="off"
                placeholder="パスワード再入力"
                class="c-input c-input--form"
            />
            <div class="p-form__error">
                <label
                    v-show="formValidation.password_confirmation"
                    class="p-form__error-message"
                    >{{ formValidation.password_confirmation }}</label
                >
            </div>
        </div>
        <!-- サンプルサイトとしての注意文 -->
        <CautionaryNote />
        <button
            type="button"
            :disabled="isLoaderFlg"
            v-show="
                Form.name &&
                Form.nickname &&
                Form.email &&
                Form.password &&
                Form.password_confirmation &&
                !formValidation.name &&
                !formValidation.nickname &&
                !formValidation.email &&
                !formValidation.password &&
                !formValidation.password_confirmation &&
                !Errors?.name &&
                !Errors?.nickname &&
                !Errors?.email &&
                !Errors?.password &&
                !Errors?.password_confirmation
            "
            @click.prevent="toRegister"
            class="c-button c-button--form p-form__button"
        >
            登録する
        </button>
        <button
            type="button"
            v-show="
                !Form.name ||
                !Form.nickname ||
                !Form.email ||
                !Form.password ||
                !Form.password_confirmation ||
                formValidation.name ||
                formValidation.nickname ||
                formValidation.email ||
                formValidation.password ||
                formValidation.password_confirmation ||
                Errors?.name ||
                Errors?.nickname ||
                Errors?.email ||
                Errors?.password ||
                Errors?.password_confirmation
            "
            class="p-form__button c-button c-button--form c-button--disabled"
        >
            Inputting...
        </button>
    </form>
</template>
<script setup lang="ts">
import CautionaryNote from '../components/CautionaryNote.vue'

import { useRouter } from 'vue-router'
import useLoaderStore from '@/ts/stores/loader'
import useAuthStore from '@/ts/stores/auth'

import { useForm } from '@/ts/methods/useForm'
import { REGISTER, type Register } from '../types'
import { dataReset } from '../util'

const { apiStatusFlg, register, AuthErrors } = useAuthStore()
const { isLoaderFlg, showLoader, closeLoader } = useLoaderStore()
const router = useRouter()

const {
    Form,
    CreateWatch,
    reset,
    WatchNickname,
    candidateName,
    Validate,
    formValidation,
    ValidationFlg,
    CreateForm,
    nameMax,
    nickNameMax,
    passwordMax,
    passwordMin,
    Errors,
    items
} = useForm<Register>()

//新規登録メソッド
const toRegister = async () => {
    //エラーメッセージを空にしてからバリデーション
    Validate()

    //バリデーションチェックを通過したら
    if (!ValidationFlg.value) {
        return false
    } else {
        //loader画面を呼び出す
        showLoader('registering..')
        //registerAPIを呼び出す
        await register(Form.value as Register)
        //通信終了後loader画面を終了させる
        closeLoader()
        // 登録成功したら
        if (apiStatusFlg.value) {
            //TOPページへリダイレクト
            router.push('/')
        } else {
            Errors.value = JSON.parse(JSON.stringify(AuthErrors.value))
        }
    }
}
;(() => {
    dataReset(candidateName.value)
    items.value = REGISTER
    CreateForm()
    CreateWatch()
    WatchNickname()
    reset(Form.value, formValidation.value, Errors.value)
})()
</script>
