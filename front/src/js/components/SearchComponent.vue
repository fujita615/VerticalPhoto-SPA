<template>
    <form @submit.prevent="searchPhotos" class="p-form">
        <div class="p-form__input">
            <i class="fa-solid fa-magnifying-glass p-form__input-icon"></i>
            <input
                v-model="searchWords"
                type="text"
                placeholder="タグで絞り込み"
                class="c-input c-input--search"
            />
        </div>
    </form>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
//photolist（親コンポーネント）から全写真データを受け取る
const props = defineProps({
    allItems: {
        type: Object,
        required: true
    }
})
//検索結果データを親コンポーネントに返却
const emit = defineEmits(['searchItems'])
const searchItems = ref('') //検索結果データ

// 検索ワード（vuexで管理しつつv-modelで双方向表示）
const searchWords = computed({
    get() {
        return store.getters['search/Words']
    },
    set(newValue) {
        store.commit('search/setWords', newValue)
    }
})

const searchPhotos = () => {
    let inputWords = [] //入力ワード（複数）を格納する配列

    //親コンポーネントから受け取ったallItemsを検索対象のseartchItems配列に渡す

    searchItems.value = [...props.allItems]
    // 入力された検索ワードが空白だけではない場合は配列に変換する
    if (searchWords.value.match(/\S/g) && searchWords.value !== '') {
        inputWords = searchWords.value
            .trim()
            .split(/\s+/)
            .filter((word) => {
                return !(word === null || word === undefined || word === '')
            })
        //検索ワードの重複を削除
        inputWords = [...new Set(inputWords)]
    } else {
        //検索ワードがない場合は全データをそのまま検索結果として親コンポーネントに返却して終了
        emit('searchItems', searchItems.value)
        return false
    }
    //検索ワード（１つ）で写真データを絞り込み、絞り込んだデータを次のワードでさらに絞り込む処理をinputWordsの要素分繰り返す(forEach)
    inputWords.forEach((word) => {
        searchItems.value = searchItems.value.filter((photo) => {
            return photo.tags.some((tag) => {
                return tag.name.includes(word)
            })
        })
    })
    //photolist(親コンポーネント)に検索結果を返却
    emit('searchItems', searchItems.value)
}
//親コンポーネントから呼び出されるメソッド
defineExpose({ searchPhotos })
</script>
