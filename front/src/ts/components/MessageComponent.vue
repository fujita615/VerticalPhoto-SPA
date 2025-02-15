<template>
    <div
        v-show="messageCheck"
        class="p-message"
        :class="{
            'p-message--alert': checkAlert,
            'p-message--success': checkSuccess
        }"
    >
        <div
            class="p-message__container"
            :class="{
                'p-message__container--alert': checkAlert,
                'p-message__container--success': checkSuccess
            }"
        >
            <div v-show="checkSuccess" class="p-message__mark p-message__mark--success">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <div v-show="checkAlert" class="p-message__mark p-message__mark--alert">
                <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            <div class="p-message__message">
                {{ messageCheck }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useMessageStore from '@/ts/stores/message'

const { checkAlert, checkSuccess, messageCheck } = useMessageStore()
</script>
