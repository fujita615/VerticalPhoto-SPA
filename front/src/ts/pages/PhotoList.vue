<template>
    <SearchComponent ref="searchRef" :all-items="allPhotos" @search-items="fetchSearchPhoto" />
    <h3 v-if="searchTag()" class="c-sub-heading c-sub-heading--article">
        <i class="fa-solid fa-tag"></i>{{ searchTag() }}
    </h3>
    <label v-show="photos.length > 0" class="p-mypage__photo-count">
        {{ photos.length }} photo</label
    >
    <div class="p-photolist">
        <ul class="p-photolist__container">
            <PhotoComponent
                v-for="photo in viewPhotos"
                :key="photo.id"
                :item="photo"
                :photos="photos"
                @like="onLikeClick"
                :completionid="completionID"
                class="p-photolist__card"
            />
        </ul>
    </div>
    <MoreViewComponent
        ref="MoreView"
        :all-items="photos"
        :load-num="loadNum"
        @view-items="loadMoreView"
    />
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Photos } from '@/ts/types'
import PhotoComponent from '@/ts/components/PhotoComponet.vue'
import MoreViewComponent from '@/ts/components/MoreView.vue'
import SearchComponent from '@/ts/components/SearchComponent.vue'
import useFormTabStore from '@/ts/stores/formTab'
import useSearchStore from '@/ts/stores/search'
import { useLike } from '@/ts/methods/useLike'

const { searchFlg, allPhotos, fetchAllPhotos, setAllPhotos, setSearchFlg } = useSearchStore()
const route = useRoute()
const router = useRouter()
const { onLikeClick, completionID } = useLike()

const props = defineProps({
    photoTag: {
        type: String,
        required: false,
        default: ''
    }
})
const photos = ref<Photos[]>([]) //moreview(分割加工コンポーネント)に渡すためのデータ
const viewPhotos = ref<Photos[]>() //表示するために分割加工したデータ
const loadNum = ref(12) //一度に表示する写真の個数
const MoreView = ref()
const searchRef = ref()

// タグ指定があった場合、全写真から絞り込み検索をするメソッド
const fetchTagPhotos = async () => {
    if (props.photoTag === '' || !allPhotos.value) {
        return false
    }
    if (props.photoTag !== '') {
        setAllPhotos(
            allPhotos.value.filter((photo) => {
                return photo.tags.some((tag) => {
                    return tag.name === props.photoTag
                })
            })
        )
    }
    // 絞り込み検索の結果,データがなかった場合（=urlの直接入力時）検索結果flgをnoneにして、TOP画面へリダイレクト
    if (allPhotos.value.length === 0) {
        setSearchFlg('none')
        router.push('/')
    }
}

//searchコンポーネント（子コンポーネント）から返却された写真データを取得するメソッド
const fetchSearchPhoto = async (searchItems: Photos[]) => {
    photos.value = searchItems
    //写真撮影者が退会している写真は除外する
    photos.value = photos.value.filter((photo) => {
        return photo?.owner !== null
    })
    //分割データを初期化して,あらためて取得しデータを分割し直す
    await MoreView.value.reset()
    MoreView.value.load()
}
//写真一覧データを分割するコンポーネントから返却された分割データを取得するメソッド
const loadMoreView = (viewItems: Photos[]) => {
    viewPhotos.value = viewItems
}
//fetchTagPhotosの後、写真データが存在する時だけtag名を表示する（=urlの直接入力対策）
const searchTag = () => {
    if (searchFlg.value === 'hit' || searchFlg.value === 'none') {
        return props.photoTag
    }
}
//$routeオブジェクトを監視して、変化を察知したら(=遷移やリロード)
watch(
    route,
    async () => {
        //DBから写真一覧データを取得
        await fetchAllPhotos()
        //tagの入力があった場合は取得した写真を一覧をフロントエンドでさらに絞り込む
        await fetchTagPhotos()
        //searchコンポーネント（子コンポーネント）の関数を呼び出して検索ワードで絞り込む
        if (searchRef.value) {
            await searchRef.value.searchPhotos()
            //moreviewコンポーネント（子コンポーネント）の関数を呼び出して一度に表示する個数に写真データを分割する
            MoreView.value.load()
        }
    },
    { immediate: true }
)
//検索flgがinitになった際は(=ロゴクリックされた際は)

watch(searchFlg, async (newValue) => {
    if (newValue === 'init') {
        // DBからデータ取得して全データを表示
        await fetchAllPhotos()
        if (searchRef.value) {
            await searchRef.value.searchPhotos()

            MoreView.value.reset()
            MoreView.value.load()
        }
    }
})
</script>
