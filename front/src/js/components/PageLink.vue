<template>
    <div class="pagination">
        <RouterLink v-if="!isFirstPage" :to="`/?page=${currentPage - 1}`" class="button"
            >&laquo; prev
        </RouterLink>
        <RouterLink v-if="!isLastPage" :to="`/?page=${currentPage + 1}`" class="button"
            >next &raquo;
        </RouterLink>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    currentPage: {
        type: Number,
        required: true
    },
    lastPage: {
        type: Number,
        required: true
    }
})

//今いるページが最初のページかを参照
const isFirstPage = computed(() => {
    return props.currentPage === 1
})
//今いるページが最後のページかを参照
const isLastPage = computed(() => {
    return props.currentPage === props.lastPage
})
</script>
