<template>
    <li>
        <figure class="p-photolist__figure">
            <router-link
                :to="`/photos/${item.id}`"
                :title="`View the photo by ${item.owner.nickname}`"
                class="c-figure c-figure--zoom-mask"
            >
                <span class="c-figure__mask">
                    <img
                        :src="item.url"
                        :alt="`Photo By ${item.owner.nickname}`"
                        class="c-figure__image c-figure__image--photolist c-figure__image--zoom-mask"
                    />
                    <span class="c-figure__mask-area">
                        <!-- ダウンロードボタン -->
                        <a
                            v-show="isLogin"
                            @click.stop
                            title="Download photo"
                            :href="`${URL}/api/photos/${item.id}/download`"
                            class="c-button c-button--photo c-button--photo-list"
                        >
                            <span class="c-button__text"
                                ><i class="fa-regular fa-circle-down"></i
                            ></span>
                            <span class="c-button__hover-text c-button__hover-text--form">
                                <i class="fa-solid fa-circle-down"></i>
                            </span>
                        </a>
                        <!-- いいねボタン -->
                        <button
                            type="button"
                            @click.prevent="like"
                            title="Like photo"
                            :class="{
                                'is-liked': item.liked_by_user
                            }"
                            class="c-button c-button--photo c-button--photo-list"
                            :disabled="this.flg"
                        >
                            <span class="c-button__text">
                                <i
                                    class="fa-regular fa-thumbs-up"
                                    :class="{
                                        'faa-tada animated': this.flg
                                    }"
                                ></i>
                                {{ item.likes_count }}</span
                            >
                        </button>
                        <div
                            v-show="item.posted_by_user"
                            class="c-figure__photographer c-figure__photographer--mask"
                        >
                            MY PHOTO
                        </div>
                        <div
                            v-show="!item.posted_by_user"
                            class="c-figure__photographer c-figure__photographer--mask"
                        >
                            {{ item.owner.nickname }}
                        </div>
                    </span>
                </span>
            </router-link>
        </figure>
    </li>
</template>

<script>
import { API_URL } from '../bootstrap.js'

export default {
    //親コンポーネントから渡ってくる写真（１枚）データ
    props: {
        item: {
            type: Object,
            required: true
        },
        // いいね処理が完了した写真のID
        completionid: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            //いいね処理中のflg（ボタンを非活性にしてcssを変更）
            flg: false,
            URL: API_URL
        }
    },
    computed: {
        //ログイン中か否か
        isLogin() {
            return this.$store.getters['auth/check']
        }
    },
    methods: {
        //クリックされたらいいね通信中flgをtrueにして、写真のIDといいね済みかと投稿者かを親コンポーネントに知らせるメソッド
        like() {
            //いいねAPI通信中flg(ボタンを非活性にする)
            this.flg = true
            this.$emit('like', {
                id: this.item.id,
                liked: this.item.liked_by_user,
                self: this.item.posted_by_user
            })
        },
        // 親コンポーネントから渡ってきた いいね処理が終わった写真のIDが一致したら
        // いいねAPI通信中flgをfalseにするメソッド
        enableLikes(completionID) {
            if (this.flg && this.item.id === completionID) {
                this.flg = false
            }
        }
    },
    // いいねAPI完了の写真のIDの通知を監視
    watch: {
        completionid(newValue) {
            if (newValue !== '') {
                this.enableLikes(newValue)
            }
        }
    }
}
</script>
