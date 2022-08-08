<script>
    import Spinner from "./Spinner.svelte";
    import { _ } from "svelte-i18n";
</script>

<div class="placeholder">
    <Spinner />
    <div class="title">{$_("listPlaceholder.title")}</div>
    <div class="description">{$_("listPlaceholder.description")}</div>
</div>

<style>
    .placeholder {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: #1D1D1E;
    }

    .title {
        font-weight: 700;
    }

    .description {
        font-size: 14px;
    }
</style>
