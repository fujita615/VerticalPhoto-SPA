import {
    createRouter,
    createWebHistory,
    START_LOCATION,
    type RouteLocationNormalizedLoadedGeneric,
    type RouteLocationNormalizedGeneric
} from 'vue-router'

import useFormTabStore from '@/ts/stores/formTab'
import useAuthStore from '@/ts/stores/auth'
import PhotoList from '@/ts/pages/PhotoList.vue'
import LoginPage from '@/ts/pages/LoginPage.vue'
import PhotoDetail from '@/ts/pages/PhotoDetail.vue'
import PolicyPage from '@/ts/pages/PolicyPage.vue'
import SystemError from '@/ts/pages/errors/SystemError.vue'
import NotFound from '@/ts/pages/errors/NotFound.vue'
import NoCookie from '@/ts/pages/errors/NoCookie.vue'
import MypagePage from '@/ts/pages/MyPage.vue'
import TooManyRequests from '@/ts/pages/errors/TooManyRequests.vue'

//ページランディング時、リロード時にwelcomeモーダルを出す処理
function skipWelcomeDialog(
    to: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedLoadedGeneric
) {
    const { setWelcomeFlg } = useFormTabStore()
    if (from === START_LOCATION) {
        {
            setWelcomeFlg()
        }
    }
}

export const router = createRouter({
    //遷移時のスクロール位置
    scrollBehavior(to, from, savedPosition) {
        //戻るボタンをおしたときは前の位置を保持
        if (savedPosition) {
            return savedPosition
        } else {
            //#指定がある場合は指定位置へ
            if (to.hash) {
                return { el: to.hash, behavior: 'smooth' }
            } else {
                // それ以外の通常遷移はTOP位置へ
                return { top: 0 }
            }
        }
    },

    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'index',
            component: PhotoList
        },
        {
            path: '/photolist',
            name: 'photolist',
            component: PhotoList,
            props: (route) => ({ photoTag: route.query.photoTag })
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
            async beforeEnter(to, from, next) {
                const { logout, isLogin } = useAuthStore()
                //sessionを直接操作してログイン状態でログインページにアクセスした場合は自動ログアウト
                if (from === START_LOCATION && isLogin.value !== true) {
                    {
                        logout()
                        next()
                    }
                }
                //もしcookieが無効ならcookieの有効化を促すページへ遷移
                else if (!document.cookie) {
                    next('/nocookie')
                } else if (isLogin.value === true) {
                    next('/')
                } else {
                    next()
                }
            }
        },
        {
            path: '/photos',
            name: 'photos',
            component: PhotoDetail,
            props: (route) => ({ id: route.query.id })
        },
        {
            path: '/mypage',
            component: MypagePage,
            name: 'mypage',
            beforeEnter(to, from, next) {
                const { isLogin } = useAuthStore()
                //もしcookieが無効ならcookieの有効化を促すページへ遷移
                if (!document.cookie) {
                } else if (!isLogin.value) {
                    next('/login')
                } else {
                    next()
                }
            }
        },
        {
            path: '/policy',
            name: 'policy',
            component: PolicyPage
        },
        {
            path: '/500',
            name: 'SystemError',
            component: SystemError,
            beforeEnter: skipWelcomeDialog
        },
        {
            path: '/nocookie',
            name: 'nocookie',
            component: NoCookie,
            beforeEnter: skipWelcomeDialog
        },
        {
            path: '/429',
            name: 'TooManyRequests',
            component: TooManyRequests,
            beforeEnter: skipWelcomeDialog
        },

        {
            path: '/notfound',
            name: 'notfound',
            component: NotFound,
            beforeEnter: skipWelcomeDialog
        },
        {
            path: '/:catchAll(.*)',
            redirect: '/notfound'
        }
    ]
})
