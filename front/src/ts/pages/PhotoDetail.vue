<template>
    <section v-if="photo" class="p-detail">
        <div class="p-detail__container">
            <div class="p-detail__sub-container">
                <Transition name="fullimg">
                    <!-- //モーダル表示 -->
                    <figure
                        v-if="modal.photoFull.isShow"
                        @click.prevent="close('photoFull')"
                        class="c-figure p-detail__figure p-detail__figure--full"
                    >
                        <img
                            :src="photo.url"
                            :alt="`Photo by ${photo.owner.nickname}`"
                            class="c-figure__image c-figure__image--detail"
                            :class="{ 'c-figure__image--full': modal.photoFull.isShow }"
                        />
                        <button
                            type="button"
                            @click.stop="close('photoFull')"
                            title="close"
                            class="c-button c-button--photo c-button--close"
                        >
                            <span class="c-button__text"><i class="fa-solid fa-xmark"></i></span>
                        </button>
                    </figure>
                    <!-- //通常画面 -->
                    <figure
                        v-else
                        @click.prevent="open('photoFull')"
                        class="p-detail__figure c-figure"
                    >
                        <img
                            :src="photo.url"
                            :alt="`Photo by ${photo.owner.nickname}`"
                            class="c-figure__image c-figure__image--detail"
                        />
                        <figcaption class="c-figure__photographer">
                            Photo by {{ photo.owner.nickname }}
                        </figcaption>
                    </figure>
                </Transition>
                <!-- タグ表示 -->
                <TagComponent :photo-data="photo" v-if="!modal.photoFull.isShow" />
            </div>

            <div class="p-detail__article">
                <div class="p-detail__icon-container">
                    <!-- いいねボタン -->
                    <button
                        type="button"
                        @click="onClick()"
                        title="Like photo"
                        class="c-button c-button--photo c-button--photo-like"
                        :class="{
                            'is-liked': photo.liked_by_user
                        }"
                        :disabled="saveLikeFlg"
                    >
                        <span class="c-button__text"
                            ><i
                                class="fa-regular fa-thumbs-up"
                                :class="{
                                    'faa-tada animated': saveLikeFlg
                                }"
                            ></i
                        ></span>
                        <span class="c-button__text"> {{ photo.likes_count }}</span>
                    </button>

                    <!-- ダウンロードボタン -->
                    <a
                        v-show="isLogin"
                        tite="Download photo"
                        :href="`${API_URL}/api/photos/${photo.id}/download`"
                        class="c-button c-button--photo"
                    >
                        <span class="c-button__text"
                            ><i class="fa-solid fa-download"></i> download</span
                        >
                    </a>
                </div>

                <!-- コメント表示 -->
                <CommentComponent :photo-data="photo" />
                <CautionaryNote />
                <!-- 写真削除dialog -->
                <div class="p-detail__button-container">
                    <button
                        type="button"
                        v-show="photo.posted_by_user"
                        @click.prevent="open('photoDelete')"
                        class="c-button c-button--edit"
                    >
                        <i class="fa-solid fa-trash-can"></i>写真を削除する
                    </button>
                </div>
                <DialogComponent v-show="modal.photoDelete.isShow && !isDeleteFlg">
                    <template #header>写真の削除</template>
                    <template #body>
                        <p>
                            写真を削除するといいねやコメントのデータも同時に削除されます<br />
                            この操作は元に戻せません
                        </p>
                    </template>
                    <template #footer>
                        <button
                            type="button"
                            @click.prevent="deletePhoto"
                            class="c-button c-button--dialog"
                            :disabled="isLoaderFlg"
                        >
                            写真を完全に削除する
                        </button>
                        <button
                            type="button"
                            @click.prevent="close('photoDelete')"
                            class="c-button c-button--edit"
                            :disabled="isLoaderFlg"
                        >
                            削除を中止
                        </button>
                    </template>
                </DialogComponent>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { API_URL, request } from '../bootstrap'
import { OK } from '../util'
import CommentComponent from '@/ts/components/CommentComponent.vue'
import TagComponent from '@/ts/components/TagComponent.vue'
import DialogComponent from '@/ts/components/DialogComponent.vue'
import CautionaryNote from '@/ts/components/CautionaryNote.vue'
import useErrorStore from '@/ts/stores/error'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, computed } from 'vue'
import { useLike } from '@/ts/methods/useLike'
import useLoaderStore from '@/ts/stores/loader'
import useAuthStore from '@/ts/stores/auth'
import useMessageStore from '@/ts/stores/message'
import type { SinglePhoto } from '@/ts/types'
const { setCode } = useErrorStore()
const route = useRoute()
const router = useRouter()
const { completionID, onLikeClick } = useLike()
const { isLoaderFlg, showLoader, closeLoader } = useLoaderStore()
const { currentUser, isLogin } = useAuthStore()

const { setSuccess } = useMessageStore()
const props = defineProps<{
    id: string
}>()
const photo = ref<SinglePhoto>()

const id = computed(() => {
    return props.id
})
const self = computed(() => {
    return photo.value?.posted_by_user
})
const liked = computed(() => {
    return photo.value?.liked_by_user
})
const modal = ref({
    photoDelete: { isShow: false },
    photoFull: { isShow: false }
})
const saveLikeFlg = ref(false)
const onClick = () => {
    if (photo.value === undefined || liked.value === undefined || self.value === undefined) {
        return setCode(500)
    }
    saveLikeFlg.value = true
    onLikeClick({
        id: id.value,
        liked: liked.value,
        self: self.value,
        photos: photo.value
    })
}
const isDeleteFlg = ref(false)

//引数で指定したモーダルを開くメソッド
const open = (modalName: keyof typeof modal.value) => {
    modal.value[modalName].isShow = true
}
//引数で指定したモーダルを閉じるメソッド
const close = (modalName: keyof typeof modal.value) => {
    modal.value[modalName].isShow = false
}
//IDを指定して写真データを取得するメソッド
const fetchPhoto = async () => {
    const response = await request.get(`/api/photos/${props.id}`)
    if (response.status !== OK) {
        setCode(response.status)
        return false
    }
    //もし撮影者は既に退会しているのphotoデータだけ残ってしまっていた場合
    if (!response.data.owner) {
        router.push('/notfound')
        return false
    }
    photo.value = response.data
}

//写真データを削除するメソッド
const deletePhoto = async () => {
    isDeleteFlg.value = true
    showLoader('delete a photo...')
    const response = await request.delete(`/api/photos/${props.id}`)
    closeLoader()
    isDeleteFlg.value = false
    if (response.status !== OK) {
        setCode(response.status)
        return false
    }
    setSuccess('写真を削除しました', 3000)
    router.push('/')
}

// いいねAPI完了の写真のIDの通知を監視
watch(
    () => completionID.value,
    // いいね処理が終わった写真のIDが一致したら いいねAPI通信中flgをfalseにする
    (newValue) => {
        if (newValue !== '') {
            if (saveLikeFlg.value && id.value === newValue) {
                saveLikeFlg.value = false
            }
        }
    }
)
//ページ遷移したら現在ログイン状態か確認する
watch(
    route,
    async () => {
        if (isLogin.value) {
            await currentUser()
        }
        //あらためてデータを読み込む（キャッシュを再利用しない）
        fetchPhoto()
    },
    {
        immediate: true
    }
)
</script>
