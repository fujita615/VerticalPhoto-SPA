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
                        @click="onLikeClick"
                        title="Like photo"
                        class="c-button c-button--photo"
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
                            ></i>
                            {{ photo.likes_count }}</span
                        >
                    </button>

                    <!-- ダウンロードボタン -->
                    <a
                        v-show="isLogin"
                        tite="Download photo"
                        :href="`${URL}/api/photos/${photo.id}/download`"
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
                <DialogComponent v-show="modal.photoDelete.isShow && !isdeleteFlg">
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
                            :disabled="isdeleteFlg"
                        >
                            写真を完全に削除する
                        </button>
                        <button
                            type="button"
                            @click.prevent="close('photoDelete')"
                            class="c-button c-button--edit"
                            :disabled="isdeleteFlg"
                        >
                            削除を中止
                        </button>
                    </template>
                </DialogComponent>
            </div>
        </div>
    </section>
</template>

<script>
import { API_URL, request } from '../bootstrap'
import { OK } from '../util'
import CommentComponent from '../components/CommentComponent.vue'
import TagComponent from '../components/TagComponent.vue'
import DialogComponent from '../components/DialogComponent.vue'
import CautionaryNote from '../components/CautionaryNote.vue'
export default {
    props: {
        id: {
            type: String,
            required: true
        }
    },
    components: {
        CommentComponent,
        TagComponent,
        DialogComponent,
        CautionaryNote
    },
    data() {
        return {
            photo: '',
            liked_by_user: false,
            likes_count: 0,
            modal: {
                photoDelete: { isShow: false },
                photoFull: { isShow: false }
            },
            saveLikeFlg: false,
            URL: API_URL
            // URL:'https://api.yf5160.com'
        }
    },
    computed: {
        isLogin() {
            return this.$store.getters['auth/check']
        },
        isdeleteFlg() {
            return this.$store.state.loader.loaderFlg
        }
    },
    methods: {
        //引数で指定したモーダルを開くメソッド
        open(modalName) {
            this.modal[modalName].isShow = true
        },
        //引数で指定したモーダルを閉じるメソッド
        close(modalName) {
            this.modal[modalName].isShow = false
        },
        //IDを指定して写真データを取得するメソッド
        async fetchPhoto() {
            const response = await request.get(`/api/photos/${this.id}`)
            if (response.status !== OK) {
                this.$store.commit('error/setCode', response.status)
                return false
            }
            //もし撮影者は既に退会しているのphotoデータだけ残ってしまっていた場合
            if (!response.data.owner) {
                this.$router.push('/notfound')
                return false
            }
            this.photo = response.data
        },
        //photo（子コンポーネント）から渡ってくる値からLikeをつけるのか外すのか判定するメソッド
        async onLikeClick() {
            if (!this.isLogin) {
                this.$store.commit('message/setAlert', {
                    message: 'いいね機能を使うにはログインが必要です',
                    timeout: 3000
                })
                return false
            }
            if (this.photo.posted_by_user) {
                this.$store.commit('message/setAlert', {
                    message: 'ご自身の写真にいいね機能は使えません',
                    timeout: 3000
                })
                return false
            }
            if (this.photo.liked_by_user) {
                this.unlike()
            } else {
                this.like()
            }
        },
        //Likeをつけるメソッド
        async like() {
            this.saveLikeFlg = true
            //DBにlikeデータを登録
            const response = await request.put(`/api/photos/${this.id}/like`)

            if (response.status !== OK) {
                this.saveLikeFlg = false
                this.$store.commit('error/setCode', response.status)
                return false
            }
            // 表示中のphotoのカウントとliked_by_userを更新する
            this.photo.likes_count += 1
            this.photo.liked_by_user = true
            this.saveLikeFlg = false
        },
        //Likeを外すメソッド
        async unlike() {
            this.saveLikeFlg = true
            const response = await request.delete(`/api/photos/${this.id}/like`)

            if (response.status !== OK) {
                this.saveLikeFlg = false
                this.$store.commit('error/setCode', response.status)
                return false
            }
            this.photo.likes_count -= 1
            this.photo.liked_by_user = false
            this.saveLikeFlg = false
        },
        //写真データを削除するメソッド
        async deletePhoto() {
            await this.$store.dispatch('loader/showLoader', 'delete a photo...')
            const response = await request.delete(`/api/photos/${this.id}`)
            await this.$store.dispatch('loader/closeLoader')
            if (response.status !== OK) {
                this.$store.commit('error/setCode', response.status)
                return false
            }
            this.$store.commit('message/setSuccess', {
                message: '写真を削除しました',
                timeout: 3000
            })
            this.$router.push('/')
        }
    },
    watch: {
        $route: {
            async handler() {
                //ページ遷移したら現在ログイン状態か確認する
                if (this.isLogin) {
                    await this.$store.dispatch('auth/currentUser')
                }
                //あらためてデータを読み込む（キャッシュを再利用しない）
                this.fetchPhoto()
            },
            immediate: true
        }
    }
}
</script>
