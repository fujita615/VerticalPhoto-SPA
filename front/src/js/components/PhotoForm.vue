<template>
    <div class="p-modal">
        <div v-show="viewLoader" class="p-modal__message">
            <Loader>Sending your photo...</Loader>
        </div>
        <div v-show="!viewLoader" ref="top" class="p-form p-form--photo p-modal__form">
            <h3 class="c-sub-heading c-sub-heading--article">Upload a photo</h3>
            <div class="p-form__label">
                <strong>Photo </strong>
                <small
                    >&nbsp;縦長の写真をUPしてください <br />※最大2MBまで
                    ファイル形式:jpeg,png,gif</small
                >
            </div>
            <div class="p-form__input p-form__input--photo">
                <img v-show="!preview.data" src="../../image/photoform.png" class="p-form__photo" />
                <input
                    @change="onFileChange"
                    type="file"
                    class="c-input c-input--photo"
                    ref="photoinput"
                />
                <output v-show="preview.data" class="p-form__output">
                    <img :src="preview.data" class="p-form__output-image" alt="" />
                </output>
            </div>
            <div class="p-form__label">
                <strong>Tag </strong>
                <small>
                    1タグ10文字まで、合計5タグ登録可能です<br />※複数入力時はスペースで区切ってください</small
                >
            </div>
            <div class="p-form__input">
                <i class="fa-solid fa-tags p-form__input-icon"></i>
                <input
                    v-model="tags.content"
                    type="text"
                    title="最大５個まで登録可能"
                    placeholder="タグ ※合計５個まで"
                    class="c-input c-input--form"
                />
            </div>
            <Note />
            <button
                v-show="
                    photoValidationFlg &&
                    !tagValidation.newPieces &&
                    !tagValidation.wordCount &&
                    !photoErrors.photo &&
                    !photoErrors.tags
                "
                @click.prevent="submitPhoto"
                class="c-button c-button--form p-form__button"
                type="button"
            >
                upload
            </button>
            <div
                v-show="
                    !photoValidationFlg ||
                    tagValidation.newPieces ||
                    tagValidation.wordCount ||
                    photoErrors
                "
                class="p-form__error p-form__error--photo"
            >
                <div v-if="photoErrors && photoErrors.photo" class="p-form__error-message">
                    <label v-for="msg in photoErrors.photo" :key="msg">
                        {{ msg }}
                    </label>
                </div>
                <div v-if="photoErrors && photoErrors.tags" class="p-form__error-message">
                    <label v-for="msg in photoErrors.tags" :key="msg">
                        {{ msg }}
                    </label>
                </div>
                <div v-show="preview.data" class="p-form__error-message">
                    <span v-show="tagValidation.wordCount"
                        >{{ tagValidation.wordCount }}<br
                    /></span>
                    <span v-show="tagValidation.newPieces">{{ tagValidation.newPieces }}</span>
                </div>
                <div v-show="validation.photo" class="p-form__error-message">
                    {{ validation.photo }}
                </div>
            </div>
            <button
                @click.prevent="changeShowPhotoForm"
                type="button"
                class="c-button c-button--edit"
            >
                投稿をキャンセル
            </button>
        </div>
    </div>
</template>
<script setup>
import { request } from '../bootstrap'
import { CREATED, UNPROCESSABLE_ENTITY } from '../util'
import Loader from './LoaderComponent.vue'
import Note from './CautionaryNote.vue'
import { useStore } from 'vuex'
import { ref, computed, watch, onUpdated } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from '../methods/UseForm'
import { useTag } from '../methods/UseTag'

const store = useStore()
const router = useRouter()
const form = useForm()
const { tagValidation, tagValidate, verifiedWord } = useTag()

const preview = ref({ data: null }) //プレビュー機能用にファイルの画像データを格納する変数
const photo = ref(null) //選択した写真ファイル自体を格納する変数
const photoErrors = ref({
    photo: null,
    tags: null
}) //サーバーからresponseされたerrorメッセージ
const viewLoader = ref(false)
const validation = ref({
    photo: '' //写真データ
})
const tags = ref({ content: '' }) //tagを格納する文字列変数
const photoValidationFlg = ref(false)
const top = ref()
const photoinput = ref() //input要素を操作するためのref属性
//フォトフォームを表示するか否かのFlg
const showPhotoForm = computed(() => {
    return store.state.formTab.showPhotoForm
})

//inputタグでファイルが選択されたらバリデーションしてpreview表示するメソッド
const onFileChange = (event) => {
    form.reset(
        preview.value,
        photoErrors.value,
        validation.value,
        tagValidation.value,
        verifiedWord
    )
    photoValidationFlg.value = false

    //ファイルが空だったら処理中止
    if (event.target.files.length === 0) {
        form.reset(photo.value, preview.value, validation.value, tagValidation.value, verifiedWord)
        photoinput.value.value = null
        photoValidationFlg.value = false
        //    preview.value = null
        return false
    }
    //ファイルが画像形式でなかったら処理中止
    if (!event.target.files[0].type.match('image.*')) {
        validation.value.photo = '画像形式のみ保存可能です'
        return false
    }
    //ファイルが画像形式でなかったら処理中止
    if (event.target.files[0].size >= 2000000) {
        validation.value.photo = 'ファイルの上限サイズ2MBを超えています'
        return false
    }
    //FileRenderのインスタンスを生成
    const reader = new FileReader()
    const image = new Image()
    reader.onload = (e) => {
        //縦横のサイズ確認用変数checkImgに画像データを格納
        const checkImg = e.target.result
        image.src = checkImg
        image.onload = () => {
            // 画像が縦長でなかったら処理終了
            if (image.naturalWidth >= image.naturalHeight) {
                validation.value.photo = '縦長の画像のみ保存可能です'
                return false
            } else {
                //縦長画像なら表示用変数previewにデータを格納してバリデーション終了
                preview.value.data = e.target.result
                photoValidationFlg.value = true
            }
        }
    }
    //ファイルのデータをdataURLに変換
    reader.readAsDataURL(event.target.files[0])
    //サーバに送信する変数photoに格納
    photo.value = event.target.files[0]
}
//写真をサーバーに送信するメソッド
const submitPhoto = async () => {
    viewLoader.value = true
    const PhotoData = new FormData()
    PhotoData.append('photo', photo.value)
    //もしtag入力があったら一緒にformdataにする
    if (tags.value.content !== '' && tags.value.content.match(/\S/g)) {
        PhotoData.append('tags', verifiedWord.content)
    }
    //APIサーバーからの返信を変数responseに格納
    const response = await request.post('/api/photos', PhotoData)
    viewLoader.value = false
    //返信がバリデーションエラーメッセージならメッセージを表示して処理中止
    if (response.status === UNPROCESSABLE_ENTITY) {
        photoErrors.value = response.data.errors
        return false
    }
    //フォームの内容やerrorメッセージを空にしてフォームを閉じる
    form.reset(
        photo.value,
        tags.value,
        preview.value,
        validation.value,
        tagValidation.value,
        verifiedWord
    )
    photoValidationFlg.value = false
    photoinput.value.value = null
    store.commit('formTab/setShowPhotoForm')
    //通信成功以外ならエラーメッセージを表示するページへ移動して終了
    if (response.status !== CREATED) {
        store.commit('error/setCode', response.status)
        return false
    }
    //通信成功ならsuccessメッセージを表示して投稿した写真の詳細ページへリダイレクト
    store.commit('message/setSuccess', {
        message: '写真を投稿しました！',
        timeout: 6000
    })
    router.push(`/photos/?id=${response.data.id}`)
}
//フォームを閉じるメソッド
const changeShowPhotoForm = () => {
    store.commit('formTab/setShowPhotoForm')
}

watch(
    //tagが入力されたら即時バリデーション
    () => tags.value.content,
    (newValue) => {
        photoErrors.value.tags = ''
        if (newValue) {
            tagValidate(newValue)
        } else if (newValue === '') {
            tagValidation.value.newPieces = ''
            tagValidation.value.wordCount = ''
        }
    }
)
//preview画像が差し代わったらinputタグのtagsをバリデーションチェックする
watch(
    () => preview.value.data,
    () => {
        tagValidate(tags.value.content)
    }
)

// 写真フォームが閉じられたら入力内容を初期化（入力項目とエラーメッセージを空にする）
watch(showPhotoForm, (newValue) => {
    if (newValue === false) {
        form.reset(
            photo.value,
            tags.value,
            validation.value,
            preview.value,
            photoErrors.value,
            tagValidation.value,
            verifiedWord
        )
        photoinput.value.value = null
        photoValidationFlg.value = false
    }
})
onUpdated(() => {
    if (!top.value) {
        // 要素が取得できなかった場合は終了
        return
    }
    top.value.scrollTop = 0
})
</script>
