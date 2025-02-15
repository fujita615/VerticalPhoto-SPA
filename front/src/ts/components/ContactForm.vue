<template>
    <div class="p-modal">
        <div v-show="mailSituationFlg === 'send'" class="p-modal__message">
            <LoaderComponent>
                <template #body>Sending your mail...</template>
            </LoaderComponent>
        </div>
        <div v-show="mailSituationFlg === 'edit'" class="p-form p-form--contact p-modal__form">
            <h3 class="c-sub-heading c-sub-heading--article">お問い合わせフォーム</h3>
            <div class="p-form__label">
                <strong>Name</strong><small> &nbsp;※{{ nameMax }}文字以内で入力してください</small>
            </div>
            <div class="p-form__input p-form__input--contact">
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
            <div class="p-form__label"><strong>Mail</strong></div>
            <div class="p-form__input p-form__input--contact">
                <i class="fa-regular fa-envelope p-form__input-icon"></i>
                <input
                    v-model="Form.email"
                    type="mail"
                    placeholder="mail"
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
                <strong>Message</strong>
                <small> &nbsp;※{{ contentLimit }}文字以内で入力してください</small>
            </div>
            <div class="p-form__textarea">
                <textarea
                    v-model="Form.content"
                    cols="30"
                    rows="10"
                    placeholder="お問い合わせ内容"
                    @input="contentLengthCheck"
                    :maxlength="contentLimit"
                    class="c-textarea c-textarea--contact"
                >
                </textarea>
                <p class="c-count" :class="{ 'c-count--error': contentLimitFlg }">
                    {{ Form.content === undefined ? 0 : Form.content.length }}/
                    {{ contentLimit }}字まで
                </p>
                <div class="p-form__error">
                    <div v-if="Errors && Errors.content" class="p-form__error-message">
                        <label v-for="msg in Errors.content" :key="msg">
                            {{ msg }}
                        </label>
                    </div>
                    <label v-show="formValidation.content" class="p-form__error-message">{{
                        formValidation.content
                    }}</label>
                </div>
            </div>
            <button
                v-show="
                    Form.name &&
                    Form.email &&
                    Form.content &&
                    !formValidation.name &&
                    !formValidation.email &&
                    !formValidation.content &&
                    !Errors.name &&
                    !Errors.email &&
                    !Errors.content
                "
                @click.prevent="submitFormMail"
                type="button"
                class="c-button c-button--form p-form__button"
            >
                submit
            </button>
            <button
                v-show="
                    !(Form.name && Form.email && Form.content) ||
                    formValidation.name ||
                    formValidation.email ||
                    formValidation.content ||
                    Errors.name ||
                    Errors.email ||
                    Errors.content
                "
                class="c-button c-button--form c-button--disabled p-form__button"
                type="button"
            >
                全項目入力必須です
            </button>
            <button @click.prevent="closeContactForm" type="button" class="c-button c-button--edit">
                お問い合わせを中止
            </button>

            お預かりする個人情報についてはprivacy policyをご確認ください
        </div>
        <div class="p-modal__message" v-show="mailSituationFlg === 'success'">
            <Thanks />
        </div>
    </div>
</template>
<script setup lang="ts">
import useErrorStore from '@/ts/stores/error'
import useFormTabStore from '@/ts/stores/formTab'
import { request } from '../bootstrap'
import { OK, UNPROCESSABLE_ENTITY } from '../util'
import LoaderComponent from './LoaderComponent.vue'
import Thanks from '@/ts/components/ThanksModal.vue'
import { useForm } from '@/ts/methods/useForm'
import { CONTACT, type ContactForm } from '../types'

const { setCode } = useErrorStore()
const { mailSituationFlg, setShowContactForm, setMailSituation } = useFormTabStore()
//form操作用のcompositionメソッド
const {
    reset,
    Validate,
    formValidation,
    CreateForm,
    CreateWatch,
    Form,
    items,
    ValidationFlg,
    Errors,
    contentLimit,
    contentLimitFlg,
    nameMax,
    contentLengthCheck
} = useForm<ContactForm>()

//メール作成を中止してフォームを閉じるメソッド
const closeContactForm = () => {
    reset(Form.value, Errors.value, formValidation.value)
    setShowContactForm()
}
//メール送信メソッド
const submitFormMail = async () => {
    //send mail..の画面を表示
    setMailSituation('send')
    //各項目をバリデーション
    Validate()
    //バリデーションエラーがあったら送信処理を中止して編集画面に戻る
    if (!ValidationFlg.value) {
        setMailSituation('edit')
        return false
    }
    const FormMailData = new FormData()
    if (Form.value === undefined) return false
    FormMailData.append('name', Form.value.name)
    FormMailData.append('email', Form.value.email)
    FormMailData.append('content', Form.value.content)
    const response = await request.post('/api/contact', FormMailData)
    if (response.status === UNPROCESSABLE_ENTITY) {
        Errors.value = response.data.errors
        setMailSituation('edit')
        return false
    }
    //通信成功以外ならエラーメッセージを表示するページへ移動して終了
    if (response.status !== OK) {
        closeContactForm()
        setCode(response.status)
        return false
    }
    setMailSituation('success')
    reset(Form.value, Errors.value, formValidation.value)
}
//contactFormを生成
;(() => {
    items.value = CONTACT
    CreateForm<ContactForm>()
    CreateWatch()
})()
</script>
