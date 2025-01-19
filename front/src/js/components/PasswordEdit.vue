<template>
    <div class="p-modal">
        <div v-show="viewLoaderFlg" class="p-modal__message">
            <Loader><template #body>With drawing...</template></Loader>
        </div>
        <div v-show="!viewLoaderFlg" class="p-form p-modal__form">
            <h3 class="c-sub-heading c-sub-heading--article">Change Password</h3>
            <div class="p-form__label">
                <strong>Password&nbsp;</strong>
                <small> ※{{ passwordMin }}文字以上{{ passwordMax }}文字以内</small>
            </div>
            <div class="p-form__input">
                <i class="fa-solid fa-key p-form__input-icon"></i>
                <input
                    v-model="Form.current_password"
                    type="password"
                    placeholder="現パスワード"
                    class="c-input c-input--form"
                />
                <div class="p-form__error">
                    <div v-if="Errors && Errors.current_password" class="p-form__error-message">
                        <label v-for="msg in Errors.current_password" :key="msg">
                            {{ msg }}
                        </label>
                    </div>
                    <label v-show="formValidation.current_password" class="p-form__error-message">{{
                        formValidation.current_password
                    }}</label>
                </div>
            </div>
            <div class="p-form__label">
                <strong>New Password&nbsp;</strong>
                <small> ※{{ passwordMin }}文字以上{{ passwordMax }}文字以内</small>
            </div>
            <div class="p-form__input">
                <i class="fa-solid fa-key p-form__input-icon"></i>
                <input
                    v-model="Form.password"
                    type="password"
                    placeholder="新パスワード"
                    class="c-input c-input--form"
                />
                <div class="p-form__error">
                    <label v-show="formValidation.password" class="p-form__error-message">{{
                        formValidation.password
                    }}</label>
                </div>
            </div>
            <div class="p-form__label">
                <strong>New Password&nbsp;</strong><small>※再入力</small>
            </div>
            <div class="p-form__input">
                <i class="fa-solid fa-key p-form__input-icon"></i>
                <input
                    v-model="Form.password_confirmation"
                    type="password"
                    placeholder="新パスワード再入力"
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
            <button
                type="button"
                v-show="
                    Form.current_password &&
                    Form.password &&
                    Form.password_confirmation &&
                    !formValidation.current_password &&
                    !formValidation.password &&
                    !formValidation.password_confirmation &&
                    !Errors.current_password &&
                    !Errors.password &&
                    !Errors.password_confirmation
                "
                @click.prevent="editPassWord"
                :disabled="viewLoaderFlg"
                class="c-button c-button--form p-form__button"
            >
                変更する
            </button>
            <button
                type="button"
                v-show="
                    !Form.current_password ||
                    !Form.password ||
                    !Form.password_confirmation ||
                    formValidation.current_password ||
                    formValidation.password ||
                    formValidation.password_confirmation ||
                    Errors.current_password ||
                    Errors.password ||
                    Errors.password_confirmation
                "
                class="c-button c-button--form p-form__button c-button--disabled"
            >
                Inputting...
            </button>
            <button type="button" @click.prevent="canselEdit" class="c-button c-button--edit">
                変更をキャンセル
            </button>
        </div>
    </div>
</template>
<script setup>
import Loader from './LoaderComponent.vue'
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useAuth } from '../methods/UseAuth'
import { useForm } from '../methods/UseForm'

const store = useStore()
const router = useRouter()
const { authReset, apiStatusFlg, Errors } = useAuth()
const {
    formValidation,
    Validate,
    ValidationFlg,
    Form,
    formFlg,
    CreateForm,
    passwordMax,
    passwordMin
} = useForm()

//mypage(親)コンポーネントに編集中止を伝える
const emit = defineEmits(['canselEdit', true])
//パスワード編集作業を中止してalertメッセージとフォームを閉じるflg(true)を親コンポーネントに渡すメソッド
const canselEdit = () => {
    authReset(formValidation.value)
    store.commit('message/setAlert', {
        message: '変更を中止しました',
        timeout: 3000
    })
    emit('canselEdit', true)
}
//パスワード変更通信中を表すflg
const viewLoaderFlg = ref(false)
//パスワードフォームでバリデーションをして、パスワード変更メソッドを呼び出すメソッド
const editPassWord = async () => {
    //残っているエラーメッセージを空にしてからバリデーション
    Validate()
    if (!ValidationFlg.value) {
        return false
    } else {
        viewLoaderFlg.value = true
        await store.dispatch('auth/editPassWord', Form.value)
        viewLoaderFlg.value = false

        //APIサーバーから通信成功flgが通知されたら
        if (apiStatusFlg.value) {
            // エラーメッセージを空にしてsuccessメッセージを出してloguinページへリダイレクト
            store.commit('message/setSuccess', {
                message: 'パスワードを変更しました！再ログインをお願いします',
                timeout: 3000
            })
            router.push('/login')
            authReset(formValidation.value)
            emit('canselEdit', true)
        }
    }
}
;(() => {
    formFlg.value = 'passwordEdit'
    CreateForm()
})()
</script>
