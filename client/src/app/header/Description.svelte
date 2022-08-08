<script>
    import { _ } from "svelte-i18n";
</script>

<div class="description">{$_("pageDescription")}</div>

<style>
    .description {
        text-align: center;
        color: #dbdde0a9;
        max-width: 500px;
        margin: 0 auto;
        font-size: 16px;
        z-index: 1000;
    }
</style>