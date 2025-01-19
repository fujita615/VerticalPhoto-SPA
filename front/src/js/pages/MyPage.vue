<template>
    <div class="p-mypage">
        <h3 class="c-sub-heading c-sub-heading--article">
            <i class="fa-regular fa-id-card"></i> Registration correction
        </h3>
        <div class="p-mypage__container">
            <dl class="p-mypage__table">
                <dt class="p-mypage__table-label"><strong>Name </strong></dt>
                <dd class="p-mypage__table-dd">
                    <i class="fa-regular fa-circle-user p-mypage__table-icon"></i>
                    <div class="p-mypage__table-item">{{ registerForm.name }}</div>
                </dd>
                <dt class="p-mypage__table-label"><strong>Username </strong></dt>
                <dd class="p-mypage__table-dd">
                    <i class="fa-solid fa-user-tag p-mypage__table-icon"></i>
                    <div class="p-mypage__table-item">{{ registerForm.nickname }}</div>
                </dd>
                <dt class="p-mypage__table-label"><strong>Mail </strong></dt>
                <dd class="p-mypage__table-dd">
                    <i class="fa-regular fa-envelope p-mypage__table-icon"></i>
                    <div class="p-mypage__table-item">{{ registerForm.email }}</div>
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

            <DialogComponent v-show="modal.userDelete.isShow">
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
                        @click.prevent="deleteUser"
                        class="c-button c-button--dialog"
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
                @like="onLikeClick"
                :completionid="completionID"
            />
        </ul>
    </div>
</template>
<script>
import { OK } from '../util'
import PhotoComponents from '../components/PhotoComponent.vue'
import DialogComponent from '../components/DialogComponent.vue'
import PasswordEdit from '../components/PasswordEdit.vue'
import UserEdit from '../components/UserEdit.vue'
import { request } from '../bootstrap'

export default {
    components: {
        PhotoComponents,
        DialogComponent,
        PasswordEdit,
        UserEdit
    },
    data() {
        return {
            completionID: '', //子コンポーネントに渡すいいね処理が終了したID
            // 各モーダルを開閉するflg
            modal: {
                userEdit: { isShow: false },
                passwordEdit: { isShow: false },
                userDelete: { isShow: false }
            }
        }
    },
    computed: {
        //DBにある全写真データの算出
        photos: {
            get() {
                return this.$store.getters['search/allPhotos']
            },
            set(newValue) {
                return this.$store.commit('search/setAllPhotos', newValue)
            }
        },
        //ユーザー情報フォームにDBから取得済みのユーザー情報を表示する
        registerForm: {
            get() {
                return this.$store.getters['auth/user']
            }
        },
        //自分が撮影した写真を取得する関数
        myPhotos() {
            return this.$store.getters['search/allPhotos'].filter((photo) => {
                return photo.posted_by_user === true
            })
        },
        //自分がいいねした写真を取得する関数
        likedPhotos() {
            return this.$store.getters['search/allPhotos'].filter((photo) => {
                return photo.liked_by_user === true
            })
        },
        //自分がコメントした写真を取得する関数
        commentedPhotos() {
            return this.$store.getters['search/allPhotos'].filter((photo) => {
                return photo.commented_by_user === true
            })
        },
        //API通信後のレスポンスを取得する関数
        apiStatus() {
            return this.$store.state.auth.apiStatus
        },
        registerErrors() {
            return this.$store.state.auth.registerErrorMessage
        }
    },
    methods: {
        //引数で指定されたモーダルを開くメソッド
        open(modalName) {
            this.modal[modalName].isShow = true
        },
        //引数で指定されたモーダルを閉じるメソッド
        close(modalName) {
            this.modal[modalName].isShow = false
        },
        //ユーザー登録削除メソッド
        async deleteUser() {
            await this.$store.dispatch('auth/deleteUser')
            if (this.apiStatus) {
                this.$store.commit('message/setSuccess', {
                    message: 'またのご利用を心よりお待ちしております',
                    timeout: 3000
                })
                this.$router.push('/')
            }
        },
        //photo（子コンポーネント）から渡ってくる値からLikeをつけるのか外すのか判定するメソッド
        async onLikeClick({ id, liked, self }) {
            this.completionID = ''
            if (!this.$store.getters['auth/check']) {
                await this.$store.commit('message/setAlert', {
                    message: 'いいね機能を使うにはログインをお願いします',
                    timeout: 3000
                })
                this.completionID = id
                return false
            }
            if (self) {
                await this.$store.commit('message/setAlert', {
                    message: 'ご自身の写真にいいね機能は使えません',
                    timeout: 3000
                })
                this.completionID = id
                return false
            }
            if (liked) {
                this.unlike(id)
            } else {
                this.like(id)
            }
        },
        //Likeをつけるメソッド
        async like(id) {
            //DBにlikeデータを登録
            const response = await request.put(`/api/photos/${id}/like`)
            if (response.status !== OK) {
                //処理終了（中止）IDを子コンポーネントに渡す
                this.completionID = id
                this.$store.commit('error/setCode', response.status)
                return false
            }
            //表示中のphoto全てに対してidをkeyにmap(繰り返し更新）処理
            this.photos = this.photos.map((photo) => {
                if (photo.id === response.data.photo_id) {
                    //responseで返ってきた該当photo(id)だった場合に表示されるlikesカウントをプラス１
                    photo.likes_count += 1
                    //「いいねをしたuserである」をtrue
                    photo.liked_by_user = true
                    //処理完了IDを子コンポーネントに渡す
                    this.completionID = response.data.photo_id
                }
                return photo
            })
        },
        //Likeを外すメソッド
        async unlike(id) {
            //DBからlikeデータを削除
            const response = await request.delete(`/api/photos/${id}/like`)
            if (response.status !== OK) {
                //処理終了（中止）IDを子コンポーネントに渡す
                this.completionID = id
                this.$store.commit('error/setCode', response.status)
                return false
            }
            this.photos = this.photos.map((photo) => {
                if (photo.id === response.data.photo_id) {
                    photo.likes_count -= 1
                    photo.liked_by_user = false
                    //処理完了IDを子コンポーネントに渡す
                    this.completionID = response.data.photo_id
                }
                return photo
            })
        }
    },
    watch: {
        // ページの変化を察知したらDBから最新全写真データを再取得する
        $route: {
            handler() {
                this.$store.dispatch('search/fetchAllPhotos')
            },
            immediate: true
        }
    }
}
</script>
