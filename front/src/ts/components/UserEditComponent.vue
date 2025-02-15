<template>
    <div class="p-modal">
        <div v-show="viewLoaderFlg" class="p-modal__message">
            <Loader><template #body>With drawing...</template></Loader>
        </div>
        <div v-show="!viewLoaderFlg" class="p-form p-modal__form">
            <h3 class="c-sub-heading c-sub-heading--article">Change user registration</h3>
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
                        <label
                            class="p-form__error-message"
                            v-for="msg in Errors.nickname"
                            :key="msg"
                        >
                            {{ msg }}&nbsp;
                        </label>
                        <br class="c-br c-br--sp-tab" />
                    </div>
                    <label v-show="formValidation.nickname" class="p-form__error-message">
                        {{ formValidation.nickname }}
                    </label>
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
            <button
                type="button"
                v-show="
                    Form.name &&
                    Form.nickname &&
                    Form.email &&
                    !Errors.name &&
                    !formValidation.name &&
                    !Errors.nickname &&
                    !formValidation.nickname &&
                    !Errors.email &&
                    !formValidation.email
                "
                @click.prevent="toEditUser"
                class="c-button c-button--form p-form__button"
                :disabled="viewLoaderFlg"
            >
                変更する
            </button>
            <button
                type="button"
                v-show="
                    !Form.name ||
                    !Form.nickname ||
                    !Form.email ||
                    Errors.name ||
                    formValidation.name ||
                    Errors.nickname ||
                    formValidation.nickname ||
                    Errors.email ||
                    formValidation.email
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
<script setup lang="ts">
import { USER_EDIT, type canselEditEmits, type User } from '@/ts/types'
import Loader from './LoaderComponent.vue'
import { ref, onUnmounted } from 'vue'
import useAuthStore from '@/ts/stores/auth'
import useMessageStore from '@/ts/stores/message'
import { useForm } from '@/ts/methods/useForm'
import { dataReset } from '../util'

const { setSuccess, setAlert } = useMessageStore()
const { editUser, apiStatusFlg, currentUser, user, AuthErrors } = useAuthStore()

const {
    Errors,
    reset,
    Form,
    formValidation,
    ValidationFlg,
    Validate,
    candidateName,
    CreateForm,
    CreateWatch,
    WatchNickname,
    nameMax,
    nickNameMax,
    items
} = useForm<User>()

//ユーザー情報変更通信中を表すflg
const viewLoaderFlg = ref(false)

const emit = defineEmits<canselEditEmits>()
//ユーザー情報の編集を終了（中止）してフォームを閉じるメソッド
const canselEdit = () => {
    // エラーメッセージを空にする
    reset(formValidation.value)
    if (AuthErrors.value !== undefined) reset(AuthErrors.value)
    dataReset(candidateName.value)
    //親コンポーネントに編集中止を伝える（＝フォームを閉じる）
    setAlert('変更を中止しました', 3000)
    emit('canselEdit', true)
}
// ダイアログ破棄(処理終了＆中止)を察知したらDBから最新user登録情報を再取得する
onUnmounted(() => {
    currentUser()
})

//user情報を更新する
const toEditUser = async () => {
    //エラーメッセージを空にして入力内容をバリデーションする

    if (AuthErrors.value !== undefined) reset(AuthErrors.value)
    Validate()
    //バリデーションエラーなら送信処理中断
    if (!ValidationFlg.value) {
        return false
    } else {
        //全バリデーション成功ならeditUserメソッドを呼び出してユーザーデータを更新する
        viewLoaderFlg.value = true
        await editUser(Form.value)
        viewLoaderFlg.value = false
        //通信成功ならsuccessメッセージをだしてエラーをクリア、フォームを閉じる
        if (apiStatusFlg.value) {
            setSuccess('登録情報を変更しました！', 3000)
            reset(formValidation.value)
            dataReset(candidateName.value)
            emit('canselEdit', true)
        } else {
            Errors.value = JSON.parse(JSON.stringify(AuthErrors.value))
        }
    }
}
;(() => {
    items.value = USER_EDIT
    CreateForm<User>()
    CreateWatch()
    Form.value.name = user.value?.name ? user.value.name : ''
    Form.value.nickname = user.value?.nickname ? user.value.nickname : ''
    Form.value.email = user.value?.email ? user.value.email : ''
    WatchNickname()
})()
</script>
