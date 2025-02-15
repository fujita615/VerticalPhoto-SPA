<template>
    <div class="p-mypage" v-if="user.nickname">
        <h3 class="c-sub-heading c-sub-heading--article">
            <i class="fa-regular fa-id-card"></i> Registration correction
        </h3>
        <div class="p-mypage__container">
            <dl class="p-mypage__table">
                <dt class="p-mypage__table-label"><strong>Name </strong></dt>
                <dd class="p-mypage__table-dd">
                    <i
                        class="fa-regular fa-circle-user p-mypage__table-icon"
                        v-if="user.nickname"
                    ></i>
                    <div class="p-mypage__table-item" v-if="user.name">{{ user.name }}</div>
                    <div class="p-mypage__table-item" v-else>&nbsp;</div>
                </dd>
                <dt class="p-mypage__table-label"><strong>Username </strong></dt>
                <dd class="p-mypage__table-dd">
                    <i class="fa-solid fa-user-tag p-mypage__table-icon" v-if="user.nickname"></i>
                    <div class="p-mypage__table-item" v-if="user.nickname">{{ user.nickname }}</div>
                    <div class="p-mypage__table-item" v-else>&nbsp;</div>
                </dd>
                <dt class="p-mypage__table-label"><strong>Mail </strong></dt>
                <dd class="p-mypage__table-dd">
                    <i class="fa-regular fa-envelope p-mypage__table-icon" v-if="user.nickname"></i>
                    <div class="p-mypage__table-item" v-if="user.email">{{ user.email }}</div>
                    <div class="p-mypage__table-item" v-else>&nbsp;</div>
                </dd>
            </dl>
            <button type="button" @click.prevent="open('userEdit')" class="c-link c-link--hover">
                >> ユーザー情報変更
            </button>
            <button
                type="button"
                @click.prevent="open('passwordEdit')"
                class="c-link c-link--hover"
            >
                >> パスワード変更
            </button>
            <button type="button" @click.prevent="open('userDelete')" class="c-link c-link--hover">
                >> ユーザー登録削除
            </button>
            <UserEdit v-if="modal.userEdit.isShow" @cansel-edit="close('userEdit')" />
            <PasswordEdit v-if="modal.passwordEdit.isShow" @cansel-edit="close('passwordEdit')" />

            <DialogComponent v-if="!isLoaderFlg" v-show="modal.userDelete.isShow">
                <template #header>ユーザー登録の削除</template>
                <template #body>
                    <p>
                        ユーザー登録を削除すると投稿した写真,コメント、ダウンロードサービスなども全て削除されます。
                        この操作は元に戻せません。
                    </p>
                </template>
                <template #footer>
                    <button
                        type="button"
                        @click.prevent="toDeleteUser"
                        class="c-button c-button--dialog"
                        :disabled="isLoaderFlg"
                    >
                        ユーザー登録を完全に削除する
                    </button>
                    <button
                        type="button"
                        @click.prevent="close('userDelete')"
                        class="c-button c-button--edit"
                    >
                        削除を中止
                    </button>
                </template>
            </DialogComponent>
        </div>
        <h3 v-show="myPhotos.length > 0" class="c-sub-heading c-sub-heading--article">
            <i class="fa-solid fa-camera-retro"></i> photos posted by me
        </h3>
        <label v-show="myPhotos.length > 0" class="p-mypage__photo-count">
            {{ myPhotos.length }} photo</label
        >
        <ul class="p-mypage__slide-container">
            <PhotoComponents
                v-for="photo in myPhotos"
                :key="photo.id"
                :item="photo"
                :completionid="completionID"
                :photos="myPhotos"
                @like="onLikeClick"
                class="p-mypage__card"
            />
        </ul>
        <h3 v-show="likedPhotos.length > 0" class="c-sub-heading c-sub-heading--article">
            <i class="fa-regular fa-thumbs-up"></i> Photos I liked
        </h3>
        <label v-show="likedPhotos.length > 0" class="p-mypage__photo-count">
            {{ likedPhotos.length }} photo</label
        >
        <ul class="p-mypage__slide-container">
            <PhotoComponents
                class="p-mypage__card"
                v-for="photo in likedPhotos"
                :key="photo.id"
                :item="photo"
                :photos="likedPhotos"
                @like="onLikeClick"
                :completionid="completionID"
            />
        </ul>
        <h3 v-show="commentedPhotos.length > 0" class="c-sub-heading c-sub-heading--article">
            <i class="fa-solid fa-comment-dots"></i> Photos I commented on
        </h3>
        <label v-show="commentedPhotos.length > 0" class="p-mypage__photo-count">
            {{ commentedPhotos.length }} photo</label
        >
        <ul class="p-mypage__slide-container">
            <PhotoComponents
                class="p-mypage__card"
                v-for="photo in commentedPhotos"
                :key="photo.id"
                :item="photo"
                :photos="commentedPhotos"
                @like="onLikeClick"
                :completionid="completionID"
            />
        </ul>
    </div>
</template>
<script setup lang="ts">
import PhotoComponents from '@/ts/components/PhotoComponet.vue'
import DialogComponent from '@/ts/components/DialogComponent.vue'
import PasswordEdit from '@/ts/components/PasswordEditComponent.vue'
import UserEdit from '@/ts/components/UserEditComponent.vue'
import { useRoute, useRouter } from 'vue-router'
import useLoaderStore from '@/ts/stores/loader'
import useAuthStore from '@/ts/stores/auth'
import useSearchStore from '@/ts/stores/search'
import { ref, watch, computed, onUnmounted } from 'vue'
import { useLike } from '@/ts/methods/useLike'
import useMessageStore from '@/ts/stores/message'

const { setSuccess } = useMessageStore()
const { fetchAllPhotos, allPhotos } = useSearchStore()
const route = useRoute()
const router = useRouter()
const { completionID, onLikeClick } = useLike()
const { apiStatusFlg, currentUser, user, deleteUser } = useAuthStore()
const { isLoaderFlg, showLoader, closeLoader } = useLoaderStore()
// 各モーダルを開閉するflg
const modal = ref({
    userEdit: { isShow: false },
    passwordEdit: { isShow: false },
    userDelete: { isShow: false }
})

//自分が撮影した写真を取得する関数
const myPhotos = computed(() => {
    return allPhotos.value.filter((photo) => {
        return photo.posted_by_user === true
    })
})
//自分がいいねした写真を取得する関数
const likedPhotos = computed(() => {
    return allPhotos.value.filter((photo) => {
        return photo.liked_by_user === true
    })
})
//自分がコメントした写真を取得する関数
const commentedPhotos = computed(() => {
    return allPhotos.value.filter((photo) => {
        return photo.commented_by_user === true
    })
})
//引数で指定されたモーダルを開くためにフラグをtrueにするメソッド
const open = (modalName: keyof typeof modal.value) => {
    return (modal.value[modalName].isShow = true)
}
//引数で指定されたモーダルを閉じるためにフラグをfalseにするメソッド
const close = (modalName: keyof typeof modal.value) => {
    return (modal.value[modalName].isShow = false)
}
//ユーザー登録削除メソッド
const toDeleteUser = async () => {
    //loader画面を呼び出す
    showLoader('Withdrawing...')
    await deleteUser()
    //通信終了後loader画面を閉じる
    closeLoader()

    if (apiStatusFlg.value) {
        setSuccess('またのご利用を心よりお待ちしております', 3000)

        router.push('/')
    }
}
// ページ離脱(破棄)したらDBから最新user登録情報を再取得する
onUnmounted(() => {
    currentUser()
})
// ページの変化を察知したらDBから全写真データを再取得する
watch(
    route,
    () => {
        fetchAllPhotos()
    },
    { immediate: true }
)
</script>
