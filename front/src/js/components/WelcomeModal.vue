<template>
    <DialogComponent>
        <template #header>
            当サイトはポートフォリオサイトです<br class="c-br c-br--sp" />
        </template>
        <template #body>
            <p class="c-paragraph">
                縦型写真ストックサービスVirticalPhotoは
                ポートフォリオとして作成したWEBサービスのサンプルサイトです。<br />
                各機能は実際にご利用いただけますが、 サンプルサイトという都合上、
                ユーザー・写真・コメント・いいねなどご登録いただいた情報は 登録後一両日中に
                全て管理人が一斉削除させていただいております。<br />
                また、アップロードされた写真は、ユーザーご自身、もしくは管理人により削除されるまで
                他ユーザーが自由にダウンロードできる状態になります。<br />
                その旨をご了承の上、ご試用ください。<br /><br />
                なお当サービスのいくつかの機能はクッキーを利用しております。<br />
                利用目的など詳細についてはprivacy policyをご確認ください。
                <br />
                <br />
            </p>
        </template>
        <template #footer>
            <div @click="closeDialog()">
                <router-link to="/"><strong> TOPページへ</strong></router-link>
            </div>
        </template>
    </DialogComponent>
</template>
<script>
import DialogComponent from './DialogComponent.vue'
export default {
    components: {
        DialogComponent
    },
    methods: {
        // ダイアログを閉じるメソッド
        closeDialog() {
            this.$store.commit('formTab/setWelcomeFlg')
        }
    }
}
</script>
