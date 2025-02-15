import { OK } from '../util'
import { request } from '../bootstrap'
import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import type { Photos, SearchSituation } from '../types'
import useErrorStore from '@/ts/stores/error'

const useSearchStore = defineStore('search', () => {
    const allPhotos = ref<Photos[]>([]) //全写真
    const searchWords = ref<string>('') //検索ワード
    const searchFlg = ref<SearchSituation>('init') //検索の状況
    const { setCode } = useErrorStore()

    function setAllPhotos(photos: Photos[] | null) {
        if (!photos) {
            setSearchFlg('none')
            return false
        }

        allPhotos.value = photos
    }

    function setSearchFlg(searchSituation: SearchSituation) {
        searchFlg.value = searchSituation
    }

    //ロゴがクリックされたら検索ワードを空にして検索フラグをinitにするメソッド
    function searchReset() {
        searchWords.value = ''
        searchFlg.value = 'init'
    }
    //DBから全写真データを取得するメソッド
    async function fetchAllPhotos() {
        const response = await request.get(`/api/photos`)

        //接続失敗の場合はエラーコードを取得・表示
        if (response.status !== OK) {
            setCode(response.status)
            return false
        }
        if (response.data) {
            allPhotos.value = response.data as Photos[]
        } else {
            allPhotos.value = []
        }
    }

    return {
        allPhotos,
        searchWords,
        searchFlg,
        setAllPhotos,
        setSearchFlg,
        searchReset,
        fetchAllPhotos
    }
})
export default () => {
    const SearchStore = useSearchStore()
    return { ...SearchStore, ...storeToRefs(SearchStore) }
}
