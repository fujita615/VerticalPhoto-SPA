<template>
    <header class="l-header">
        <div class="l-header__container">
            <div @click="resetSearchPhoto" class="l-header__icon">
                <router-link to="/" class="c-icon c-icon--header">
                    <img src="../../image/logo.png" alt="logo" />
                </router-link>
            </div>
            <nav class="l-header__nav">
                <ul v-show="isLogin" class="c-nav">
                    <li class="c-nav__item">
                        <button
                            type="button"
                            @click="changeShowPhotoForm"
                            class="c-nav__link c-nav__link--header"
                        >
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                        </button>
                    </li>
                    <li class="c-nav__item">
                        <router-link to="/mypage" class="c-nav__link c-nav__link--header"
                            ><i class="fa-solid fa-user-check"></i
                        ></router-link>
                    </li>
                </ul>

                <ul v-show="!isLogin" class="c-nav">
                    <li class="c-nav__item">
                        <router-link to="/login" class="c-nav__link c-nav__link--header"
                            ><i class="fa-solid fa-right-to-bracket"></i
                        ></router-link>
                    </li>
                </ul>
            </nav>
        </div>
        <PhotoForm v-show="showPhotoForm" />
    </header>
</template>
<script setup>
import PhotoForm from './PhotoForm.vue'
import { request } from '../bootstrap'
import { useStore } from 'vuex'
import { computed } from 'vue'
import { useAuth } from '../methods/UseAuth'
const store = useStore()
const { isLogin } = useAuth()

//写真投稿フォームを表示するか(true)か否(false)かを表す
const showPhotoForm = computed(() => {
    return store.state.formTab.showPhotoForm
})

//写真投稿フォームを表示するFlgをtrueにするメソッド
const changeShowPhotoForm = async () => {
    // 【認証切れ対策】CSRFトークンを更新する
    await request.get('/sanctum/csrf-cookie')
    store.commit('formTab/setShowPhotoForm')
    return false
}
//検索窓の入力値を空にするメソッド
const resetSearchPhoto = () => {
    store.dispatch('search/searchReset')
    return false
}
</script>
