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

<script>
export default {
    props: {
        currentPage: {
            type: Number,
            required: true
        },
        lastPage: {
            type: Number,
            required: true
        }
    },
    computed: {
        //今いるページが最初のページかを参照
        isFirstPage() {
            return this.currentPage === 1
        },
        //今いるページが最後のページかを参照
        isLastPage() {
            return this.currentPage === this.lastPage
        }
    }
}
</script>
