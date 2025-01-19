import { createRouter, createWebHistory, START_LOCATION } from 'vue-router'

//urlを検知して切り替えるコンポーネント達を読み込む
import PhotoList from './pages/PhotoList.vue'
import LoginPage from './pages/LoginPage.vue'
import PolicyPage from './pages/PolicyPage.vue'
import PhotoDetail from './pages/PhotoDetail.vue'
import { store } from './store/store'
import SystemError from './pages/errors/SystemError.vue'
import NotFound from './pages/errors/NotFound.vue'
import NoCookie from './pages/errors/NoCookie.vue'
import MyPage from './pages/MyPage.vue'
import TooManyRequests from './pages/errors/TooManyRequests.vue'

//ページランディング時、リロード時にwelcomeブラウザを出す処理
function skipWelcomeDialog(to, from) {
    if (from === START_LOCATION) {
        {
            store.commit('formTab/setWelcomeFlg')
        }
    }
}
//ブラウザリロードされたらTOPページへ戻る処理

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
            component: PhotoList,
            beforeEnter: skipWelcomeDialog
            //pagination
            // props: route =>
            // {
            //     const page = route.query.page
            //   return { page: /^[1-9][0-9]*$/.test(page) ? page * 1 : 1 }
            // }
        },
        {
            path: '/photolist/:photoTag',
            name: 'photolist',
            component: PhotoList,
            props: true
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
            async beforeEnter(to, from, next) {
                if (store.getters['auth/check']) {
                    next('/')
                }
                //もしcookieが無効ならcookieの有効化をお願いするページへ遷移
                else if (!document.cookie) {
                    next('/nocookie')
                } else {
                    next()
                }
            }
        },
        {
            path: '/photos/:id',
            component: PhotoDetail,
            props: true
        },
        {
            path: '/mypage',
            component: MyPage,
            name: 'mypage',
            beforeEnter(to, from, next) {
                if (!store.getters['auth/check']) {
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
