import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
//App.vueに配置したLoaderコンポーネントを操作するstore
const useLoader = defineStore('Loader', () => {
    const isLoaderFlg = ref<boolean>(false) //loader表示・非表示flg
    const loaderMessage = ref<string>('') //メッセージ

    function showLoader(message: string) {
        isLoaderFlg.value = true
        loaderMessage.value = message
    }
    function closeLoader() {
        isLoaderFlg.value = false
        loaderMessage.value = ''
    }
    return {
        isLoaderFlg,
        loaderMessage,
        showLoader,
        closeLoader
    }
})
export default () => {
    const loaderStore = useLoader()
    return { ...loaderStore, ...storeToRefs(loaderStore) }
}
