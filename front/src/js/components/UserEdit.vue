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
                @click.prevent="editUser"
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
<script setup>
import Loader from './LoaderComponent.vue'
import { ref, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useAuth } from '../methods/UseAuth'
import { useForm } from '../methods/UseForm'

const store = useStore()
const { authReset, apiStatusFlg, Errors } = useAuth()
const {
    Form,
    formValidation,
    ValidationFlg,
    Validate,
    candidateName,
    formFlg,
    CreateForm,
    WatchNickname,
    nameMax,
    nickNameMax
} = useForm()

//ユーザー情報変更通信中を表すflg
const viewLoaderFlg = ref(false)

//mypage(親)コンポーネントに編集中止を伝える
const emit = defineEmits(['canselEdit', true])
//ユーザー情報の編集を終了（中止）してフォームを閉じるメソッド
const canselEdit = () => {
    // エラーメッセージを空にする
    authReset(formValidation.value, candidateName.value)
    //親コンポーネントに編集中止を伝える（＝フォームを閉じる）
    store.commit('message/setAlert', {
        message: '変更を中止しました',
        timeout: 3000
    })
    emit('canselEdit', true)
}
// ダイアログ破棄(処理終了＆中止)を察知したらDBから最新user登録情報を再取得する
onUnmounted(() => {
    store.dispatch('auth/currentUser')
})

//user情報を更新する
const editUser = async () => {
    //エラーメッセージを空にして入力内容をバリデーションする
    Validate()
    //バリデーションエラーなら送信処理中断
    if (!ValidationFlg.value) {
        return false
    } else {
        //全バリデーション成功ならeditUserメソッドを呼び出してユーザーデータを更新する
        viewLoaderFlg.value = true
        await store.dispatch('auth/editUser', Form.value)
        viewLoaderFlg.value = false
        //通信成功ならsuccessメッセージをだしてエラーをクリア、フォームを閉じる
        if (apiStatusFlg.value) {
            store.commit('message/setSuccess', {
                message: '登録情報を変更しました！',
                timeout: 3000
            })
            authReset(formValidation.value, candidateName.value)
            emit('canselEdit', true)
        }
    }
}
;(() => {
    formFlg.value = 'userEdit'
    CreateForm()
    Form.value.name = store.getters['auth/user'].name ? store.getters['auth/user'].name : ''
    Form.value.nickname = store.getters['auth/user'].nickname
        ? store.getters['auth/user'].nickname
        : ''
    Form.value.email = store.getters['auth/user'].email ? store.getters['auth/user'].email : ''
    WatchNickname()
})()
</script>
