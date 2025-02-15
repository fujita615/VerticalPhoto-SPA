import { ref, computed, watch } from 'vue'
import useAuthStore from '@/ts/stores/auth'
import type { ValidationItems, FormItems, FormType } from '../types'
import { dataReset } from '../util'

//form操作用のcompositionメソッド
export const useForm = <T extends FormType>() => {
    const ValidationFlg = ref(false) //バリデーションを通過したかを表すflg

    const items = ref<FormItems[]>() //各Formの入力項目

    const contentLimit = ref(500) //content項目の最大入力文字数
    const passwordMin = ref(8) //passwotd項目の最少文字数
    const passwordMax = ref(50) //passwotd項目の最大文字数
    const nameMax = ref(30) //name項目の最大文字数
    const nickNameMax = ref(15) //nockname項目の最大文字数
    const createNickNameFlg = computed((): boolean => {
        if (
            Errors.value === undefined ||
            Errors.value.nickname === undefined ||
            Errors.value.nickname === ''
        ) {
            return false
        } else {
            return true
        }
    }) //Nickname候補生成が必要かを表すflg
    //フォーム、バリデーション・レスポンスメッセージ用オブジェクトとフォーム入力の監視関数を生成するメソッド
    const CreateForm = <T extends FormType>(): {
        form: T
        FormValidation: T
        errors: T
    } => {
        const form = <{ [T: string]: string }>{}
        const FormValidation = <{ [T: string]: string }>{}
        const errors = <{ [T: string]: string }>{}

        if (items.value)
            items.value.forEach((key) => {
                form[key] = ''
                FormValidation[key] = ''
                errors[key] = ''
            })
        return {
            form: form as T,
            FormValidation: FormValidation as T,
            errors: errors as T
        }
    }
    const Form = ref<T>(CreateForm().form as T) //入力フォーム
    const formValidation = ref<T>(CreateForm().FormValidation as T) //バリデーションメッセージ
    const Errors = ref<T>(CreateForm().errors as T) //APIからのレスポンスに含まれるエラーメッセージ

    //新入力があった際に以前のエラーメッセージを削除するwatch関数
    const CreateWatch = () => {
        const { loginErrorMessage, loginErrorMessageClear } = useAuthStore()
        if (!items.value) return false
        items.value.forEach((key) => {
            watch(
                () => Form.value![key],
                (newValue) => {
                    if (newValue !== '') {
                        if (formValidation.value![key]) {
                            formValidation.value![key] = ''
                        }
                        if (loginErrorMessage.value) {
                            loginErrorMessageClear()
                        }
                        if (Errors.value![key]) {
                            Errors.value![key] = ''
                        }
                    }
                }
            )
        })
    }
    //各入力項目に対するバリデーションルール
    const ValidationRules: {
        [k in ValidationItems]: () => void
    } = {
        email: () => {
            if (Form.value === undefined || formValidation.value === undefined) return false
            const mailPattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/
            if (!mailPattern.test(Form.value!.email))
                formValidation.value.email = '有効なメールアドレスを入力してください。'
        },
        name: () => {
            if (Form.value === undefined || formValidation.value === undefined) return false
            if (Form.value.name.length > nameMax.value)
                formValidation.value.name = `${nameMax.value}文字以内で入力してください`
        },
        nickname: () => {
            if (Form.value === undefined || formValidation.value === undefined) return false
            if (Form.value.nickname.length > nickNameMax.value)
                formValidation.value.nickname = `${nickNameMax.value}文字以内で入力してください`
        },
        current_password: () => {
            if (Form.value === undefined || formValidation.value === undefined) return false
            if (
                Form.value.current_password.length < passwordMin.value ||
                Form.value.current_password.length > passwordMax.value
            )
                formValidation.value.current_password =
                    '入力したパスワードは現在のパスワードと一致しません。'
        },
        password: () => {
            if (Form.value === undefined || formValidation.value === undefined) return false
            if (
                Form.value.password.length < passwordMin.value ||
                Form.value.password.length > passwordMax.value
            )
                formValidation.value.password = `有効文字数は${passwordMin.value}〜${passwordMax.value}文字です。`
        },
        password_confirmation: () => {
            if (Form.value === undefined || formValidation.value === undefined) return false
            if (Form.value.password !== Form.value.password_confirmation)
                formValidation.value.password_confirmation =
                    'パスワードが再入力と一致していません。'
        },
        content: () => {
            if (Form.value === undefined || formValidation.value === undefined) return false
            if (!Form.value.content.match(/\S/g)) {
                formValidation.value.content = '無効な入力です'
            } else if (Form.value.content.trim().length > contentLimit.value) {
                formValidation.value.content = `${contentLimit.value}文字以内で入力してください`
            }
        },
        whitespace: () => {
            Object.keys(Form.value!).forEach((key) => {
                if (Form.value === undefined || formValidation.value === undefined) return false
                const space = /\s/g
                if (!Form.value[key].match(/\S/g)) {
                    formValidation.value[key] = '入力必須項目です'
                    Form.value![key] = Form.value[key].replace(space, '')
                }
            })
        }
    }
    //フォームの入力に一斉バリデーションをするメソッド
    const Validate = () => {
        ValidationFlg.value = false
        dataReset(candidateName.value)
        ValidationRules.whitespace()

        items.value!.forEach((key) => {
            if (formValidation.value && formValidation.value[key] !== '入力必須項目です')
                ValidationRules[key]()
        })

        //バリデーションメッセージがひとつでも残っていたらValidationFlgは不可のまま終了
        for (const property in formValidation.value) {
            if (formValidation.value[property]) {
                return false
            }
        }
        //validationを通過したらValidationFlgをtrueにして終了
        return (ValidationFlg.value = true)
    }

    //フォームの入力内容やエラーメッセージ/バリデーションメッセージを空にして初期化するメソッド
    const reset = (...items: { [k in FormItems | ValidationItems]?: string }[]) => {
        dataReset(...items)
        ValidationFlg.value = false
    }
    const contentLimitFlg = computed(() => {
        if (Form.value === undefined || Form.value.content === undefined) {
            return false
        } else if (!!Form.value && Form.value.content.length >= contentLimit.value) {
            return true
        } else {
            return false
        }
    })

    //textareaTagの入力文字数を確定前から計算するメソッド
    const contentLengthCheck = (event: Event) => {
        if (event.target instanceof HTMLTextAreaElement) {
            if (event.target.value.length > contentLimit.value) {
                event.target.blur()
            }
        }
    }
    // nicknameの重複エラー発生時は候補名を表示する
    const WatchNickname = () => {
        watch(
            () => createNickNameFlg.value,
            (newValue) => {
                if (newValue === true) {
                    createdNickname()
                }
            }
        )
    }

    //nicknameの重複エラー発生時に生成・表示する候補名
    const candidateName = ref({
        name: ''
    })

    // 登録不可だったnicknameの頭文字から始まる一意なnickname候補を生成するメソッド
    const createdNickname = () => {
        if (Form.value === undefined) return false
        if (!Form.value.nickname) {
            candidateName.value.name = ''
            return false
        }
        if (Form.value.nickname.length < 3) {
            candidateName.value.name = Form.value.nickname.concat(new Date().getTime().toString())
            return false
        } else {
            candidateName.value.name = Form.value.nickname
                .slice(0, 2)
                .concat(new Date().getTime().toString())
            return false
        }
    }
    return {
        candidateName,
        createdNickname,
        WatchNickname,
        reset,
        formValidation,
        Validate,
        CreateForm,
        CreateWatch,
        ValidationRules,
        Form,
        ValidationFlg,
        Errors,
        contentLimitFlg,
        contentLimit,
        contentLengthCheck,
        items,
        passwordMin,
        passwordMax,
        nameMax,
        nickNameMax
    }
}
