<script>
    import { locales as registeredLocales, locale as registeredCurrentLocale, _ } from "svelte-i18n";
    
    let locales = [];
    let currentLocale;

    $: {
        registeredCurrentLocale.set(currentLocale);
        localStorage.setItem("locale", currentLocale);
    }

    registeredCurrentLocale.subscribe(l => {
        currentLocale = l;
    });

    registeredLocales.subscribe(l => {
        locales = l;
    });
</script>

<div class="language-selector">
    <label for="languageSelect">{$_("footer.language")}:</label>
    <select bind:value={currentLocale} class="language-select" id="languageSelect">
        {#each locales as l}
            <option value={l}>{l}</option>
        {/each}
    </select>
</div>

<style>
    .language-selector {
        color: #6D6D71;
        font-size: 14px;
    }

    .language-select {
        background-color: transparent;
        border: none;
        cursor: pointer;
    }
</style>