<template>
    <br />
    <br />
    <p>当機能はブラウザのcookie設定を有効にしてご利用ください</p>
    <br />
    <br />
    <CookiePolicy />
    <router-link class="c-link c-link--hover" to="/"> >>TOPページへ</router-link>
    <br /><br />
</template>
<script setup lang="ts">
import CookiePolicy from '@/ts/components/CookiePolicy.vue'
</script>
