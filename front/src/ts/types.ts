import { z } from 'zod'

//一覧表示される写真１枚の型
export interface Photos {
    id: string
    url: string
    likes_count: number
    liked_by_user: boolean
    posted_by_user: boolean
    commented_by_user: boolean
    owner: {
        nickname: string
    }
    tags: Tag[]
}

//詳細ページで表示される写真1枚の型
const SinglePhotoSchema = z.object({
    id: z.string(),
    url: z.string(),
    likes_count: z.number(),
    liked_by_user: z.boolean(),
    posted_by_user: z.boolean(),
    commented_by_user: z.boolean(),
    owner: z.object({
        nickname: z.string()
    }),
    comments: z.array(
        z.object({
            content: z.string(),
            commented_by_author: z.boolean(),
            author: z.object({
                nickname: z.string()
            })
        })
    ),
    tags: z.array(z.object({ name: z.string() }))
})
export type SinglePhoto = z.infer<typeof SinglePhotoSchema>
//データの型構造から写真詳細データかをcheckするメソッド
export function isSinglePhoto(value: unknown): value is SinglePhoto {
    return SinglePhotoSchema.safeParse(value).success
}
//コンタクトフォームの送信状況
export type MailSituation = 'edit' | 'send' | 'success'

//タグ検索の状況
export type SearchSituation = 'init' | 'hit' | 'none'

//editForm（子）コンポーネントからmypage(親)コンポーネントに編集中止を伝える
export interface canselEditEmits {
    (event: 'canselEdit', isCanselFlg: boolean): void
}

//ログインページのFormの切り替え
export type FormFlg = 'login' | 'register'

//tagデータ
export interface Tag {
    name: string
}

//commentデータ
export interface Comment {
    content: string
    commented_by_author: boolean
    author: {
        nickname: string
    }
}

//未入力checkvalidation項目
const WHITESPACE_KEY = ['whitespace'] as const
type WhiteSpaceItem = (typeof WHITESPACE_KEY)[number]

//formのvalidation項目のユニオン型
export type ValidationItems = FormItems | WhiteSpaceItem

//ログインフォーム
const LOGIN_KEY = ['email', 'password'] as const
//入力項目名を詰めた配列
export const LOGIN: FormItems[] = LOGIN_KEY.slice()
//入力項目の型
export type LoginItem = (typeof LOGIN_KEY)[number]
//form,validationメッセージ,errorメッセージの型
export type Login = Record<LoginItem, string>

//新規User登録フォーム
const REGISTER_KEY = ['name', 'nickname', 'email', 'password', 'password_confirmation'] as const
//入力項目名を詰めた配列
export type RegisterItem = (typeof REGISTER_KEY)[number]
//入力項目の型
export const REGISTER: FormItems[] = REGISTER_KEY.slice()
//form,validationメッセージ,errorメッセージの型
export type Register = Record<RegisterItem, string>

//ユーザーデータ（&ユーザー登録変更フォーム）
const USER_EDIT_KEY = ['name', 'nickname', 'email'] as const
//入力項目名を詰めた配列
export type userEditItem = (typeof USER_EDIT_KEY)[number]
//入力項目の型
export const USER_EDIT: FormItems[] = USER_EDIT_KEY.slice()
//form,validationメッセージ,errorメッセージの型
export type User = Record<userEditItem, string>

//パスワード変更フォーム
const PASSWORD_EDIT_KEY = ['current_password', 'password', 'password_confirmation'] as const
//入力項目名を詰めた配列
export type PassWordEditItem = (typeof PASSWORD_EDIT_KEY)[number]
//入力項目の型
export const PASSWORD_EDIT: FormItems[] = PASSWORD_EDIT_KEY.slice()
//form,validationメッセージ,errorメッセージの型
export type PassWordForm = Record<PassWordEditItem, string>

//お問い合わせフォーム
const CONTACT_KEY = ['name', 'email', 'content'] as const
//入力項目名を詰めた配列
export type ContactItem = (typeof CONTACT_KEY)[number]
//入力項目の型
export const CONTACT: FormItems[] = CONTACT_KEY.slice()
//form,validationメッセージ,errorメッセージの型
export type ContactForm = Record<ContactItem, string>

//コメント投稿フォーム
const COMMENT_KEY = ['content'] as const
//入力項目名を詰めた配列
export type CommentItem = (typeof COMMENT_KEY)[number]
//入力項目の型
export const COMMENT: FormItems[] = COMMENT_KEY.slice()
//form,validationメッセージ,errorメッセージの型
export type CommentForm = Record<CommentItem, string>

//resetメソッドの引数
export interface resetObject {
    [key: string]: string
}

//全formのユニオン型
export type FormType = Login | Register | User | PassWordForm | CommentForm | ContactForm

//全formの入力項目のユニオン型
export type FormItems =
    | LoginItem
    | RegisterItem
    | userEditItem
    | PassWordEditItem
    | CommentItem
    | ContactItem
