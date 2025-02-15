<template>
    <header class="l-header">
        <div class="l-header__container">
            <div @click="searchReset" class="l-header__icon">
                <router-link to="/" class="c-icon c-icon--header">
                    <img src="../../image/logo.png" alt="logo" />
                </router-link>
            </div>

            <nav class="l-header__nav" v-show="navFlg">
                <ul v-if="isLogin === true" class="c-nav">
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

                <ul v-else class="c-nav">
                    <li class="c-nav__item">
                        <router-link to="/login" class="c-nav__link c-nav__link--header"
                            ><i class="fa-solid fa-right-to-bracket"></i
                        ></router-link>
                    </li>
                </ul>
            </nav>
        </div>
        <PhotoForm v-show="showPhotoFormFlg" />
    </header>
</template>
<script setup lang="ts">
import PhotoForm from '@/ts/components/PhotoForm.vue'
import { request } from '@/ts/bootstrap'
import useFormTabStore from '@/ts/stores/formTab'
import useSearchStore from '@/ts/stores/search'
import useAuthStore from '@/ts/stores/auth'
const { showPhotoFormFlg, setShowPhotoForm, navFlg } = useFormTabStore()
const { isLogin } = useAuthStore()
const { searchReset } = useSearchStore()

//写真投稿フォームを表示するFlgをtrueにするメソッド
const changeShowPhotoForm = async () => {
    // 【認証切れ対策】CSRFトークンを更新する
    await request.get('/sanctum/csrf-cookie')
    setShowPhotoForm()
    return false
}
</script>
