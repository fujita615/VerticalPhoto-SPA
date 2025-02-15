<template>
    <h3 class="c-sub-heading c-sub-heading--article">comment</h3>
    <label v-show="photo.comments.length > 0 && !loadingFlg" class="p-detail__comment-count">
        {{ photo.comments.length }}件</label
    >
    <ul v-if="photo.comments.length > 0" class="p-detail__comment-container">
        <li
            v-for="comment in photo.comments"
            :key="comment.content"
            class="p-detail__comment"
            :class="{
                'p-detail__comment--by-author': comment.commented_by_author,
                'p-detail__comment--by-author--none': comment.commented_by_author && loadingFlg
            }"
        >
            <p class="c-paragraph c-paragraph--comment">{{ comment.content }}</p>
            <p class="c-paragraph__commenter">{{ comment.author.nickname }}</p>

            <button
                v-show="comment.commented_by_author && !loadingFlg"
                @click="showEditForm"
                class="c-button c-button--photo"
                title="edit comment"
                type="button"
                :disabled="showEditFormFlg"
            >
                <span class="c-button__text">編集</span>
            </button>
            <button
                v-show="comment.commented_by_author && !loadingFlg"
                @click="deleteComment"
                class="c-button c-button--photo"
                title="Delete comment"
                type="button"
                :disabled="loadingFlg"
            >
                <span class="c-button__text">削除</span>
            </button>
        </li>
    </ul>
    <p v-else-if="isLogin && !photo.posted_by_user">最初のコメントをどうぞ！</p>
    <p v-else>現在コメントはありません</p>

    <!-- コメント投稿フォーム -->
    <button
        @click.self="showEditForm"
        type="button"
        title="Finish editing"
        class="c-button c-button--edit"
        :disabled="showEditFormFlg"
        v-show="
            isLogin &&
            !showEditFormFlg &&
            !loadingFlg &&
            !photo.commented_by_user &&
            !photo.posted_by_user
        "
    >
        <i class="fa-regular fa-comment-dots"></i> コメントする !
    </button>
    <div v-show="showEditFormFlg && !loadingFlg" class="p-form">
        <div class="p-form__textarea">
            <textarea
                v-model="Form.content"
                cols="30"
                rows="10"
                placeholder="コメントする！"
                @input="contentLengthCheck"
                :maxlength="contentLimit"
                class="c-textarea c-textarea--comment"
            >
            </textarea>
            <p class="c-count" :class="{ 'c-count--error': contentLimitFlg }">
                {{ Form.content === undefined ? 0 : Form.content.length }}/ {{ contentLimit }}字まで
            </p>
        </div>

        <button
            type="button"
            v-show="!Form.content || formValidation.content"
            class="c-button c-button--form c-button--disabled"
        >
            Please comment
        </button>
        <button
            type="button"
            v-show="Form.content && !formValidation.content"
            @click.prevent="editComment"
            class="c-button c-button--form"
            :class="{ 'c-button--disabled': loadingFlg }"
            :disabled="loadingFlg"
        >
            Submit a comment
        </button>
        <button
            @click.self="canselEdit"
            type="button"
            title="Finish editing"
            class="c-button c-button--edit"
        >
            <i class="fa-solid fa-ban"></i> コメント編集を中止する
        </button>
    </div>
    <div class="p-form__error">
        <div v-if="Errors && Errors.content" class="p-form__error-message">
            <label v-for="msg in Errors.content" :key="msg">
                {{ msg }}
            </label>
        </div>
        <div v-show="formValidation.content" class="p-form__error-message">
            {{ formValidation.content }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { OK, CREATED, UNPROCESSABLE_ENTITY } from '../util'
import { request } from '../bootstrap'
import useErrorStore from '@/ts/stores/error'
import { ref, computed } from 'vue'
import { useForm } from '@/ts/methods/useForm'
import useAuthStore from '@/ts/stores/auth'
import type { SinglePhoto, Comment, CommentForm } from '../types'
import { COMMENT } from '../types'

import type { AxiosResponse } from 'axios'

const { setCode } = useErrorStore()
const {
    reset,
    Errors,
    Form,
    formValidation,
    items,
    Validate,
    ValidationFlg,
    CreateForm,
    CreateWatch,
    contentLimit,
    contentLimitFlg,
    contentLengthCheck
} = useForm<CommentForm>()
const { isLogin } = useAuthStore()
const props = defineProps<{
    photoData: SinglePhoto
}>()
let oldComment: Comment = {
    content: '',
    commented_by_author: true,
    author: {
        nickname: ''
    }
}
const showEditFormFlg = ref(false)
const loadingFlg = ref(false)
let currentComment: Comment = {
    content: '',
    commented_by_author: true,
    author: {
        nickname: ''
    }
}
const photo = computed(() => {
    return props.photoData
})

//コメントを編集するためのフォームを表示するメソッド
const showEditForm = () => {
    showEditFormFlg.value = !showEditFormFlg.value
    currentComment = {
        content: '',
        commented_by_author: false,
        author: {
            nickname: ''
        }
    } //投稿済の自分のコメント

    // 【認証切れ対策】CSRFトークンを更新する
    request.get('/sanctum/csrf-cookie')
    if (photo.value.commented_by_user) {
        currentComment = photo.value.comments.find(
            (comment) => comment.commented_by_author === true
        ) as Comment
    }
    if (currentComment) {
        //編集中止に備えてDBに保存されているコメント情報をformの値と切り離して一時保存する
        oldComment = JSON.parse(JSON.stringify(currentComment))
        //DBに保存されている編集前のコメントをformに代入する
        Form.value.content = currentComment.content
    }

    //自分のコメント以外を表示する
    photo.value.comments = photo.value.comments.filter(
        (comment) => !(comment.commented_by_author === true)
    )
}
//コメント編集を中止してフォームを閉じるメソッド
const canselEdit = () => {
    loadingFlg.value = true
    if (oldComment) {
        //一時保存していた編集前のコメントを再代入
        photo.value.comments = [currentComment, ...photo.value.comments]
    }
    loadingFlg.value = false
    showEditFormFlg.value = !showEditFormFlg.value
    reset(Errors.value, formValidation.value, Form.value)
    oldComment = {
        content: '',
        commented_by_author: true,
        author: {
            nickname: ''
        }
    }
}
//コメントをバリデーション後、投稿、新投稿を追加してコメントを再表示する
const editComment = async () => {
    loadingFlg.value = true
    Validate()
    if (!ValidationFlg.value) {
        loadingFlg.value = false
        return false
    }
    let response = <AxiosResponse>{}
    if (photo.value.commented_by_user) {
        response = await request.put(`/api/photos/${photo.value.id}/comments`, {
            content: Form.value.content
        })
    } else {
        response = await request.post(`/api/photos/${photo.value.id}/comments`, {
            content: Form.value.content
        })
    }
    loadingFlg.value = false
    if (response.status === UNPROCESSABLE_ENTITY) {
        Errors.value = response.data.errors
        return false
    }
    reset(Form.value, Errors.value)
    if (response.status !== CREATED) {
        setCode(response.status)
        return false
    }
    photo.value.comments = [response.data, ...photo.value.comments]
    showEditFormFlg.value = !showEditFormFlg.value
    photo.value.commented_by_user = true
}
//投稿コメントを消去するメソッド
const deleteComment = async () => {
    loadingFlg.value = true
    const response = await request.delete(`/api/photos/${photo.value.id}/comments`)
    loadingFlg.value = false
    if (response.status !== OK) {
        setCode(response.status)
        return false
    }
    //表示中のコメント(photo.comments)から自分のコメントを消す
    photo.value.comments = photo.value.comments.filter(
        (elem) => !(elem.commented_by_author === true)
    )
    photo.value.commented_by_user = false
    reset(Errors.value)
}
//commentFormを生成
;(() => {
    items.value = COMMENT
    CreateForm()
    CreateWatch()
})()
</script>
