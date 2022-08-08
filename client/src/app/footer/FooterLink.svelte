<script>
    export let name;
    export let url;
</script>

<a class="link" target="_blank" href={url}>{name}</a>

<style>
    .link:visited,
    .link {
        color: #6D6D71;
        text-decoration: none;
        font-size: 14px;
    }

    .link:hover {
        text-decoration: underline;
    }
</style>