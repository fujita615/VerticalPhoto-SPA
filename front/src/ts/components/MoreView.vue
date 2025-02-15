<template>
    <h3 v-if="searchFlg === 'none'">no matching photos</h3>
    <div v-if="searchFlg === 'hit'" class="p-photolist__moreview-container">
        <button
            type="button"
            v-if="hasNextFlg"
            @click="load"
            class="c-button c-button-photo p-photolist__moreview-next"
        >
            もっと見る
        </button>
        <button
            type="button"
            @click="scrollTop"
            class="c-button c-button-photo p-photolist__moreview-preview"
        >
            <i class="fa-solid fa-circle-arrow-up faa-float animated"></i>
        </button>
    </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import useSearchStore from '@/ts/stores/search'
import type { Photos } from '@/ts/types'

const { searchFlg, setSearchFlg } = useSearchStore()
//photoListコンポーネント（親）から渡される値

const props = defineProps<{
    //一覧表示する写真全データ
    allItems: Photos[]

    loadNum: number
}>()

//親コンポーネントに返却するデータ
const emit = defineEmits(['viewItems'])

//まだ表示できていない写真が残っているか(true)否か
const hasNextFlg = ref(true)
//表示するデータ
const viewItems = ref<Photos[]>([])

//１クリックごとに全写真を指定個数ずつ表示用配列に格納するメソッド
const load = () => {
    if (!props.allItems) return false
    viewItems.value = viewItems.value.concat(
        props.allItems.slice(viewItems.value.length, viewItems.value.length + props.loadNum)
    )
    if (viewItems.value.length >= props.allItems.length) {
        hasNextFlg.value = false
    }
    if (viewItems.value.length === 0) {
        setSearchFlg('none')
    } else {
        setSearchFlg('hit')
    }
    // 格納した表示用写真を親コンポーネントに返却する
    emit('viewItems', viewItems.value)
}
//クリックしたら画面TOPに戻るメソッド
const scrollTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}
//表示データを初期化するメソッド(※親コンポーネントから利用)

const reset = () => {
    viewItems.value = []
    hasNextFlg.value = true
}
//親コンポーネントから呼び出されるメソッド
defineExpose({ load, reset })
</script>
