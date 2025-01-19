<template>
    <li>
        <figure class="p-photolist__figure">
            <router-link
               
                :to="{name: 'photos', query:{id:`${item.id}`}}"
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
                            class="c-button c-button--photo c-button--photo-list c-button--photo-like"
                            :disabled="flg"
                        >
                            <span class="c-button__text">
                                <i
                                    class="fa-regular fa-thumbs-up"
                                    :class="{
                                        'faa-tada animated': flg
                                    }"
                                ></i
                            ></span>
                            <span class="c-button__text"> {{ item.likes_count }}</span>
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

<script setup>
import { API_URL } from '../bootstrap.js'
import { ref, watch } from 'vue'
import { useAuth } from '../methods/UseAuth.js'
const { isLogin } = useAuth()
const props = defineProps({
    //親コンポーネントから渡ってくる写真（１枚）データ
    item: {
        type: Object,
        required: true
    },
    photos: {
        type: Object,
        required: true
    },
    // いいね処理が完了した写真のID
    completionid: {
        type: String
    }
})
const emit = defineEmits(['like'])

//いいね処理中のflg（ボタンを非活性にしてcssを変更）
const flg = ref(false)
const URL = ref(API_URL)

//クリックされたらいいね通信中flgをtrueにして、写真のIDといいね済みかと投稿者かを親コンポーネントに知らせるメソッド
const like = () => {
    //いいねAPI通信中flg(ボタンを非活性にする)
    flg.value = true
    emit('like', {
        id: props.item.id,
        liked: props.item.liked_by_user,
        self: props.item.posted_by_user,
        photos: props.photos
    })
}
// いいねAPI完了の写真のIDの通知を監視
watch(
    // 親コンポーネントから渡ってきた いいね処理が終わった写真のIDが一致したら
    // いいねAPI通信中flgをfalseにするメソッド
    () => props.completionid,
    (newValue) => {
        if (newValue !== '') {
            if (flg.value === true && props.item.id === newValue) {
                flg.value = false
            }
        }
    }
)
</script>
