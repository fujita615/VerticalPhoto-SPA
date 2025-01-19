import { useStore } from 'vuex'
import { OK } from '../util'
import { request } from '../bootstrap'
import { ref } from 'vue'
import { useAuth } from './UseAuth'

//いいね機能操作用のcompositionメソッド
export const useLike = () => {
    const store = useStore()
    const { isLogin } = useAuth()
    const completionID = ref('') //子コンポーネントに渡すいいね処理が終了したID

    //photo（子コンポーネント）から渡ってくる値からLikeをつけるのか外すのか判定するハンドラ
    const onLikeClick = async ({ id, liked, self, photos }) => {
        completionID.value = ''
        if (!isLogin.value) {
            store.commit('message/setAlert', {
                message: 'いいね機能を使うにはログインしてください',
                timeout: 3000
            })
            completionID.value = id
            return false
        }
        if (self) {
            store.commit('message/setAlert', {
                message: 'ご自身の写真にいいね機能は使えません',
                timeout: 3000
            })
            completionID.value = id
            return false
        }
        if (liked) {
            unlike(id, photos)
        } else {
            like(id, photos)
        }
    }
    //Likeをつけるメソッド
    const like = async (id, photos) => {
        //いいね登録APIと通信
        const response = await request.put(`/api/photos/${id}/like`)
        //処理エラーとなったら
        if (response.status !== OK) {
            //処理終了（中止）IDを子コンポーネントに渡す
            completionID.value = id
            //エラーコードを登録
            store.commit('error/setCode', response.status)
            return false
        }
        if (Array.isArray(photos)) {
            //photo全てに対してidをkeyにmap(繰り返し更新）処理
            photos.map((photo) => {
                if (photo.id === response.data.photo_id) {
                    //responseで返ってきた該当photo(id)だった場合にlikesカウントをプラス１
                    photo.likes_count += 1
                    photo.liked_by_user = true
                    //処理完了IDを子コンポーネントに渡す
                    completionID.value = response.data.photo_id
                }
                return
            })
        } else {
            photos.likes_count += 1
            photos.liked_by_user = true
            //処理完了IDを子コンポーネントに渡す
            completionID.value = response.data.photo_id
            return
        }
    }
    //likeを外すメソッド
    const unlike = async (id, photos) => {
        const response = await request.delete(`/api/photos/${id}/like`)
        if (response.status !== OK) {
            //処理終了（中止）IDを子コンポーネントに渡す
            completionID.value = id
            store.commit('error/setCode', response.status)
            return false
        }
        if (Array.isArray(photos)) {
            photos.map((photo) => {
                if (photo.id === response.data.photo_id) {
                    photo.likes_count -= 1
                    photo.liked_by_user = false
                    //処理完了IDを子コンポーネントに渡す
                    completionID.value = response.data.photo_id
                }
                return
            })
        } else {
            photos.likes_count -= 1
            photos.liked_by_user = false
            completionID.value = response.data.photo_id
            return
        }
    }
    return {
        completionID,
        like,
        unlike,
        onLikeClick
    }
}
