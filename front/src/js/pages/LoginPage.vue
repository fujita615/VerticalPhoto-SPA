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
            <form @submit.prevent v-show="formFlg === 'login'" class="p-form p-form--user">
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
                        !Errors.email &&
                        !Errors.password
                    "
                    @click.prevent="login"
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
                        Errors.email ||
                        Errors.password
                    "
                    class="p-form__button c-button c-button--form c-button--disabled"
                >
                    Inputting...
                </button>
            </form>
            <!-- 会員登録フォーム -->
            <form @submit.prevent class="p-form p-form--user" v-show="formFlg === 'register'">
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
                        >写真やコメント投稿時に公開される名前です
                        <br class="c-br c-br--sp-tab" />※{{ nickNameMax }}文字以内</small
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
                            <label
                                class="p-form__error-message"
                                v-for="msg in Errors.nickname"
                                :key="msg"
                            >
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
                <div class="p-form__label">
                    <strong> Password&nbsp;</strong><small>※再入力</small>
                </div>
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
                        !Errors.name &&
                        !Errors.nickname &&
                        !Errors.email &&
                        !Errors.password &&
                        !Errors.password_confirmation
                    "
                    @click.prevent="register"
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
                        Errors.name ||
                        Errors.nickname ||
                        Errors.email ||
                        Errors.password ||
                        Errors.password_confirmation
                    "
                    class="p-form__button c-button c-button--form c-button--disabled"
                >
                    Inputting...
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { watch } from 'vue'
import { useStore } from 'vuex'
import CautionaryNote from '../components/CautionaryNote.vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../methods/UseAuth'
import { useForm } from '../methods/UseForm'

const store = useStore()
const router = useRouter()
const { authReset, apiStatusFlg, Errors } = useAuth()
const {
    isLoaderFlg,
    Form,
    WatchNickname,
    candidateName,
    Validate,
    formValidation,
    ValidationFlg,
    formFlg,
    CreateForm,
    nameMax,
    nickNameMax,
    passwordMax,
    passwordMin
} = useForm()

const chengeLoginForm = () => {
    formFlg.value = 'login'
}
const chengeRegisterForm = () => {
    formFlg.value = 'register'
}
//ログインメソッド
const login = async () => {
    //エラーメッセージを空にしてからバリデーション
    Validate()
    //バリデーションチェックを通過しなじゃったら処理中止
    if (!ValidationFlg.value) {
        return false
    } else {
        //loader画面を呼び出す
        store.dispatch('loader/showLoader', 'login...')
        //loginAPIを呼び出す
        await store.dispatch('auth/login', Form.value)
        //通信終了後loader画面を閉じる
        store.dispatch('loader/closeLoader')
        //loginメソッドが成功したら
        if (apiStatusFlg.value) {
            //    TOPページへリダイレクト
            router.push('/')
        }
    }
}
//新規登録メソッド
const register = async () => {
    //エラーメッセージを空にしてからバリデーション
    Validate()
    //バリデーションチェックを通過したら
    if (!ValidationFlg.value) {
        return false
    } else {
        //loader画面を呼び出す
        store.dispatch('loader/showLoader', 'registering..')
        //registerAPIを呼び出す
        await store.dispatch('auth/register', Form.value)
        //通信終了後loader画面を終了させる
        store.dispatch('loader/closeLoader')
        // 登録成功したら
        if (apiStatusFlg.value) {
            //TOPページへリダイレクト
            router.push('/')
        }
    }
}

//ページアクセス時はloginフォームを表示
;(() => {
    formFlg.value = 'login'
    authReset(candidateName.value)
    CreateForm()
    WatchNickname()
})()

//login・registerフォームを切り替えた時は入力値・エラーメッセージを初期化する
watch(formFlg, () => {
    authReset(candidateName.value)
    CreateForm()
})
</script>
