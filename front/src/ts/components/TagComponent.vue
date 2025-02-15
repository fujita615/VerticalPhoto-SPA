<template>
    <div class="p-detail__tag-container">
        <div class="p-detail__tag-area">
            <ul v-if="photo.tags.length > 0" class="p-tag">
                <li v-for="tag in photo.tags" :key="tag.name" class="p-tag__item">
                    <router-link
                        v-show="!editTagFlg"
                        tite="tag"
                        :to="{ name: 'photolist', query: { photoTag: `${tag.name}` } }"
                        class="c-button c-button--tag"
                        @click="searchReset"
                    >
                        <span class="c-button__text"
                            ><i class="fa-solid fa-tags"></i>{{ tag.name }}</span
                        >
                    </router-link>
                    <button
                        type="button"
                        v-show="editTagFlg"
                        :disabled="saveTagFlg"
                        @click.prevent="deleteTag(tag.name)"
                        class="c-button c-button--tag"
                    >
                        <span class="c-button__text"
                            ><i class="fa-solid fa-trash-can"></i>{{ tag.name }}</span
                        >
                    </button>
                </li>
            </ul>
            <div v-show="saveTagFlg" class="p-detail__tag-loader">
                <div class="p-dtail__tag-loader-message">
                    <LoaderComponent />
                </div>
            </div>
        </div>
        <div v-if="photo.posted_by_user" class="p-form__error p-form__error--fulltag">
            <div v-if="editTagFlg && validationOldPieces" class="p-form__error-message">
                {{ validationOldPieces }}
            </div>
        </div>
        <div v-show="editTagFlg && !validationOldPieces" class="p-form">
            <div class="c-input__label">
                <strong>Tag </strong><br />
                <small
                    >複数入力時はスペースで区切ってください<br />1タグ10文字まで、合計5タグ登録可能です</small
                >
            </div>
            <div class="p-form__input">
                <i class="fa-solid fa-tags p-form__input-icon"></i>
                <input
                    v-model="newTags.content"
                    type="text"
                    title="最大５個まで登録可能"
                    placeholder="タグ ※合計５個まで"
                    class="c-input c-input--form"
                />
            </div>
            <button
                type="button"
                v-show="
                    !newTags.content ||
                    tagValidation.duplication ||
                    tagValidation.newPieces ||
                    tagValidation.wordCount ||
                    !checkTagValidationFlg ||
                    saveTagFlg
                "
                class="c-button c-button--form c-button--disabled"
                title="編集中..."
            >
                while editing...
            </button>
            <button
                type="button"
                v-show="
                    !(
                        !newTags.content ||
                        tagValidation.duplication ||
                        tagValidation.newPieces ||
                        tagValidation.wordCount ||
                        !checkTagValidationFlg ||
                        saveTagFlg
                    )
                "
                :disabled="saveTagFlg"
                @click.self="addTags"
                class="c-button c-button--form"
                title="タグを追加"
            >
                put tags on
            </button>
            <div class="p-form__error p-form__error--tags p-form__error-message">
                <span v-show="tagValidation.duplication">{{ tagValidation.duplication }}</span>
                <span v-show="tagValidation.newPieces">{{ tagValidation.newPieces }}<br /></span>
                <span v-show="tagValidation.wordCount">{{ tagValidation.wordCount }}</span>
                <div v-if="tagErrors && tagErrors.tags" class="p-form__error-message">
                    <label v-for="msg in tagErrors.tags" :key="msg">
                        {{ msg }}
                    </label>
                </div>
            </div>
        </div>
        <button
            v-show="photo.posted_by_user && !editTagFlg && !saveTagFlg"
            @click.self="editTagFlg = !editTagFlg"
            :disabled="saveTagFlg"
            title="edit Tag"
            type="button"
            class="c-button c-button--edit"
        >
            <i class="fa-solid fa-pencil"></i> タグを編集する
        </button>
        <button
            v-show="photo.posted_by_user && editTagFlg"
            @click.self="editTagFlg = !editTagFlg"
            type="button"
            title="Finish editing"
            class="c-button c-button--edit"
        >
            <i class="fa-solid fa-ban"></i> タグ編集を終了する
        </button>
    </div>
</template>
<script setup lang="ts">
import { OK, CREATED, UNPROCESSABLE_ENTITY } from '../util'
import { request } from '../bootstrap'
import LoaderComponent from './LoaderComponent.vue'
import useErrorStore from '@/ts/stores/error'
import { watch, ref, computed } from 'vue'
import { useForm } from '@/ts/methods/useForm'
import { useTag } from '@/ts/methods/useTag'
import useSearchStore from '@/ts/stores/search'
import type { SinglePhoto } from '@/ts/types'

const { setCode } = useErrorStore()
const { searchReset } = useSearchStore()
const form = useForm()
const { tagValidation, tagValidate, verifiedWord } = useTag()
const props = defineProps<{
    //photodetail(親コンポーネント）から渡される写真(１枚)データ
    photoData: SinglePhoto
}>()

const newTags = ref({ content: '' }) //フォームの入力値
const tagErrors = ref()
const editTagFlg = ref(false) //編集フォームのon・off
const saveTagFlg = ref(false) //TagAPIの通信状態
const checkTagValidationFlg = ref(false) //バリデーションのon・off
const validationOldPieces = ref('')

//親コンポーネントから受け取る写真（１枚）データ
const photo = computed(() => {
    return props.photoData
})
//写真データに紐付け済みのTags
const fetchOldTags = computed((): string[] => {
    //紐付けされたTagがない場合は空文字を返却
    if (!photo.value.tags) {
        return ['']
    }
    //紐付けされたTagを一つずつ string型に変換して配列を新たに生成
    return photo.value.tags.map((tag) => {
        return tag.name.toString()
    })
})

//TagをDBに登録するメソッド
const addTags = async () => {
    saveTagFlg.value = true
    editTagFlg.value = false
    const response = await request.patch(`/api/photos/${photo.value.id}/tags`, {
        tags: verifiedWord.content
    })
    saveTagFlg.value = false
    if (response.status === UNPROCESSABLE_ENTITY) {
        editTagFlg.value = true
        tagErrors.value = response.data.errors
        return false
    }
    if (response.status !== CREATED) {
        setCode(response.status)
        return false
    }
    //登録成功したらサーバからresponseされるtagデータを表示用変数photo.tagに代入
    photo.value.tags = response.data.tags
    //フォームを初期化して処理終了
    form.reset(newTags.value, tagValidation.value, tagErrors.value, verifiedWord)
}
//現在登録済みのTag数をバリデーションするメソッド
const countOldTags = () => {
    if (fetchOldTags.value.length === 5) {
        validationOldPieces.value = '登録できるタグは５個までです'
        //編集処理中止(フォームのバリデーション非活性)
        checkTagValidationFlg.value = false
    } else {
        validationOldPieces.value = ''
        //フォームのバリデーション活性
        checkTagValidationFlg.value = true
    }
}
//Tagの紐付けを解除するメソッド
const deleteTag = async (tagName: string) => {
    saveTagFlg.value = true
    const response = await request.delete(`/api/photos/${photo.value.id}/tags/${tagName}`)
    saveTagFlg.value = false
    if (response.status !== OK) {
        setCode(response.status)
        return false
    }
    //APIから登録成功のresponseが届いたら、表示中のtagを格納しているphoto.tagsから消去した要素(tag名)を除去する
    photo.value.tags = photo.value.tags.filter((elem) => !(elem.name === tagName))
    validationOldPieces.value = ''
    tagValidate(newTags.value.content, fetchOldTags.value)
}

//編集するボタンが押されるかを監視
watch(editTagFlg, (newValue) => {
    if (newValue === true) {
        //登録済みTag数をバリデーションする
        countOldTags()
    } else {
        // 編集終了(中止）したら入力とバリデーションメッセージを空にする
        form.reset(newTags.value, tagValidation.value, tagErrors.value)
    }
})
//フォームに入力されるかを監視
watch(
    () => newTags.value.content,
    (newValue) => {
        //文字入力があった時はバリデーションを開始
        if (newValue.match(/\S/g) && newValue !== '') {
            tagErrors.value = ''
            checkTagValidationFlg.value = true
            tagValidate(newValue, fetchOldTags.value)
        } else {
            checkTagValidationFlg.value = false
            tagValidation.value.duplication = ''
            tagErrors.value = ''
        }
    }
)
//photoデータの変更を監視
watch(photo, (newValue, oldValue) => {
    //photo.IDが変わった（＝別の写真の詳細ページへ遷移した）ときはフォームを閉じる(input内容をリセットする)
    if (newValue.id !== oldValue.id) {
        editTagFlg.value = false
    } else {
        //それ以外(=photo.tagを更新した時)はバリデーションの引数を入れ直してバリデーションを行う
        tagValidate(newTags.value.content, fetchOldTags.value)
    }
})
</script>
