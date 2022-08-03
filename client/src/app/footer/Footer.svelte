<script>
    import FooterLink from "./FooterLink.svelte";
</script>

<div class="footer">
    <FooterLink name="Source code" url="https://github.com/oskar2517/tacomail" />
    <FooterLink name="API docs" url="https://github.com/oskar2517/tacomail/blob/main/docs/API.md" />
    <FooterLink name="Contact" url="mailto:contact@admin.tacomail.de" />
</div>

<style>
    .footer {
        display: flex;
        justify-content: center;
        column-gap: 20px;
        margin-bottom: 50px;
    }
</style>
