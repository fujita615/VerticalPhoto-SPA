import { ref } from 'vue'

//Tagバリデーション用のcompositionメソッド
export const useTag = () => {
    const tagValidation = ref({
        duplication: '', //既に登録済みのタグです
        newPieces: '', //登録できるタグは５個までです
        wordCount: '' //1タグの最大文字数は10文字です
    })
    const verifiedWord = {
        content: ''
    }
    const tagValidate = (input, ...currentTags) => {
        let oldTags = [] //登録済みのTag
        if (currentTags) {
            oldTags = oldTags.concat(...currentTags)
        }
        //フォームの入力文字列inputをスペースで区切り、配列inputWordsに変換
        let inputWords = input.trim().split(/\s+/)
        //新規登録tagと登録済みtagを連結、要素から空白を取り除いて配列tagWordsにする
        let tagWords = oldTags.concat(inputWords).filter((word) => {
            return !(
                word === null ||
                word === undefined ||
                word === '' ||
                !word.toString().match(/\S/g)
            )
        })
        //重複入力を取り除く
        tagWords = [...new Set(tagWords)]
        //バリデーション
        if (
            oldTags !== '' &&
            tagWords.length === oldTags.length &&
            input !== '' &&
            input.match(/\S/g)
        ) {
            tagValidation.value.duplication = '既に登録済みのタグです'
        } else {
            tagValidation.value.duplication = ''
        }
        if (tagWords.length > 5) {
            tagValidation.value.newPieces = '登録できるタグは５個までです'
        } else {
            tagValidation.value.newPieces = ''
        }
        if (
            tagWords.find((word) => {
                return word.length > 10
            })
        ) {
            tagValidation.value.wordCount = '1タグの最大文字数は10文字です'
        } else {
            tagValidation.value.wordCount = ''
        }
        //validationメッセージがひとつでも残っていたら処理中止
        for (const property in tagValidation.value) {
            if (tagValidation.value[property]) {
                return false
            }
        }
        //バリデーションをを通過したら入力をAPIへの送信用に文字列にして代入
        verifiedWord.content = tagWords.join(' ')
    }
    return {
        tagValidate,
        tagValidation,
        verifiedWord
    }
}
