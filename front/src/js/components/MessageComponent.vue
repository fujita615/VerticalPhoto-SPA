<template>
    <div
        v-show="message"
        class="p-message"
        :class="{
            'p-message--alert': flgCheckAlert,
            'p-message--success': flgCheckSuccess
        }"
    >
        <div
            class="p-message__container"
            :class="{
                'p-message__container--alert': flgCheckAlert,
                'p-message__container--success': flgCheckSuccess
            }"
        >
            <div v-show="flgCheckSuccess" class="p-message__mark p-message__mark--success">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <div v-show="flgCheckAlert" class="p-message__mark p-message__mark--alert">
                <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            <div class="p-message__message">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            message: ''
        }
    },
    computed: {
        //storeの値が更新されたらflgでaleartかsuccessかをFlgに代入しつつ、内容を返すメソッド
        flgCheckAlert() {
            return this.$store.getters['message/checkAlert']
        },
        flgCheckSuccess() {
            return this.$store.getters['message/checkSuccess']
        },
        messageCheck() {
            if (this.$store.state.message.alert) {
                return this.$store.state.message.alert
            } else {
                return this.$store.state.message.success
            }
        }
    },
    watch: {
        //messageCheck(storeに格納されている値)が変更されたらdataの値を更新する
        messageCheck() {
            this.message = this.messageCheck
        }
    }
}
</script>
