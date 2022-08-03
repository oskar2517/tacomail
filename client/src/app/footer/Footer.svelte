<script>
    import FooterLink from "./FooterLink.svelte";
</script>

<div class="footer">
    <FooterLink name="Source code" url="mailto:senkju4@gmail.com" />
    <FooterLink name="API docs" url="mailto:senkju4@gmail.com" />
    <FooterLink name="Contact" url="mailto:senkju4@gmail.com" />
</div>

<style>
    .footer {
        display: flex;
        justify-content: center;
        column-gap: 20px;
        margin-bottom: 50px;
    }
</style>
