<script>
    import FooterLink from "./FooterLink.svelte";
    import { _ } from "svelte-i18n";
import LanguageSelector from "./LanguageSelector.svelte";
</script>

<div class="footer">
    <FooterLink name={$_("footer.sourceCode")} url="https://github.com/oskar2517/tacomail" />
    <FooterLink name={$_("footer.APIDocs")} url="https://github.com/oskar2517/tacomail/blob/main/docs/API.md" />
    <FooterLink name={$_("footer.contact")} url="mailto:contact@admin.tacomail.de" />
    <LanguageSelector></LanguageSelector>
</div>

<style>
    .footer {
        display: flex;
        justify-content: center;
        column-gap: 20px;
        margin-bottom: 50px;
    }
</style>
