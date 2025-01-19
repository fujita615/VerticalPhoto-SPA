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

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const message = ref('')
//storeの値が更新されたらflgでaleartかsuccessかをFlgに代入しつつ、内容を返すメソッド
const flgCheckAlert = computed(() => {
    return store.getters['message/checkAlert']
})
//storeの値が更新されたらflgでaleartかsuccessかをFlgに代入しつつ、内容を返すメソッド
const flgCheckSuccess = computed(() => {
    return store.getters['message/checkSuccess']
})

const messageCheck = computed(() => {
    if (store.state.message.alert) {
        return store.state.message.alert
    } else {
        return store.state.message.success
    }
})
//messageCheck(storeに格納されている値)が変更されたらdataの値を更新する
watch(messageCheck, (newMessage) => {
    message.value = newMessage
})
</script>
