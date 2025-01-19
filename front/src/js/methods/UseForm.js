import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

//form操作用のcompositionメソッド
export const useForm = () => {
    const store = useStore()
    const Form = ref({}) //入力フォーム
    const formValidation = ref({}) //バリデーションメッセージ
    const Errors = ref({}) //APIからのレスポンスに含まれるエラーメッセージ
    const formFlg = ref('') //入力フォームの種類
    const ValidationFlg = ref(false) //バリデーションを通過したかを表すflg
    //各Formの入力項目
    const items = computed(() => {
        switch (formFlg.value) {
            case 'login':
                return ['email', 'password']
            case 'register':
                return ['name', 'nickname', 'email', 'password', 'password_confirmation']
            case 'userEdit':
                return ['name', 'nickname', 'email']
            case 'passwordEdit':
                return ['current_password', 'password', 'password_confirmation']
            case 'contact':
                return ['name', 'email', 'content']
            case 'comment':
                return ['content']
            default:
                return false
        }
    })
    const contentLimit = ref(500) //content項目の最大入力文字数
    const passwordMin = ref(8) //passwotd項目の最少文字数
    const passwordMax = ref(50) //passwotd項目の最大文字数
    const nameMax = ref(30) //name項目の最大文字数
    const nickNameMax = ref(15) //nockname項目の最大文字数
    //フォーム、バリデーション・レスポンスメッセージ用オブジェクトとフォーム入力の監視関数を生成するメソッド
    const CreateForm = () => {
        Form.value = {}
        formValidation.value = {}
        Errors.value = {}
        items.value.forEach((item) => {
            Form.value[item] = ''
            formValidation.value[item] = ''
            //新入力があった際に以前のエラーメッセージを削除するwatch関数
            watch(
                () => Form.value[item],
                (newValue) => {
                    if (newValue) {
                        if (formValidation.value[item]) formValidation.value[item] = ''
                        if (store.getters['auth/getloginErrorMessage']) {
                            store.dispatch('auth/loginErrorMessageClear')
                        } else if (store.state.auth.registerErrorMessage[item]) {
                            store.dispatch('auth/registerErrorMessageSingleClear', item)
                        } else if (Errors.value[item]) {
                            Errors.value[item] = ''
                        }
                    }
                }
            )
        })
    }
    //textArea
    const contentLengthCheck = (event) => {
        if (event.target.value.length > contentLimit.value) {
            event.target.blur()
        }
    }
    //各入力項目に対するバリデーションルール
    const ValidationRules = {
        email: () => {
            const mailPattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/
            if (!mailPattern.test(Form.value.email))
                formValidation.value.email = '有効なメールアドレスを入力してください。'
        },
        name: () => {
            if (Form.value.name.length > nameMax.value)
                formValidation.value.name = `${nameMax.value}文字以内で入力してください`
        },
        nickname: () => {
            if (Form.value.nickname.length > nickNameMax.value)
                formValidation.value.nickname = `${nickNameMax.value}文字以内で入力してください`
        },
        current_password: () => {
            if (
                Form.value.current_password.length < passwordMin.value ||
                Form.value.current_password.length > passwordMax.value
            )
                formValidation.value.current_password =
                    '入力したパスワードは現在のパスワードと一致しません。'
        },
        password: () => {
            if (
                Form.value.password.length < passwordMin.value ||
                Form.value.password.length > passwordMax.value
            )
                formValidation.value.password = `有効文字数は${passwordMin.value}〜${passwordMax.value}文字です。`
        },
        password_confirmation: () => {
            if (Form.value.password !== Form.value.password_confirmation)
                formValidation.value.password_confirmation =
                    'パスワードが再入力と一致していません。'
        },
        content: () => {
            if (!Form.value.content.match(/\S/g)) {
                formValidation.value.content = '無効な入力です'
            } else if (Form.value.content.trim().length > contentLimit.value) {
                formValidation.value.content = `${contentLimit.value}文字以内で入力してください`
            }
        },
        whitespace: () => {
            items.value.forEach((item) => {
                const space = /\s/g
                if (!Form.value[item].match(/\S/g)) {
                    formValidation.value[item] = '入力必須項目です'
                    Form.value[item] = Form.value[item].replace(space, '')
                }
            })
        }
    }
    //フォームの入力に一斉バリデーションをするメソッド
    const Validate = () => {
        ValidationFlg.value = false
        reset(candidateName.value)
        ValidationRules.whitespace()

        items.value.forEach((item) => {
            if (formValidation.value[item] !== '入力必須項目です') ValidationRules[item]()
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
    const reset = (...items) => {
        items.forEach((item) => {
            if (!item) return false
            Object.keys(item).forEach((key) => {
                item[key] = ''
            })
        })
        ValidationFlg.value = false
    }
    const contentLimitFlg = computed(() => {
        if (Form.value.content.length >= contentLimit.value) {
            return true
        } else {
            return false
        }
    })
    //API通信中,loader画面を呼び出すフラグ
    const isLoaderFlg = computed(() => {
        return store.state.loader.loaderFlg
    })
    const createNickNameFlg = computed(() => {
        return store.getters['auth/createNickNameFlg']
    })
    // nicknameの重複エラー発生時は候補名を表示する
    const WatchNickname = (nickname, candidateName) => {
        watch(
            () => createNickNameFlg.value,
            (newValue) => {
                if (newValue) {
                    createdNickname(nickname, candidateName)
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
        ValidationRules,
        Form,
        formFlg,
        ValidationFlg,
        Errors,
        contentLimitFlg,
        contentLimit,
        items,
        isLoaderFlg,
        createNickNameFlg,
        passwordMin,
        passwordMax,
        nameMax,
        nickNameMax,
        contentLengthCheck
    }
}
