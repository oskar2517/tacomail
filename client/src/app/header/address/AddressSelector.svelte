<script>
    import CopyButton from "./CopyButton.svelte";

    export let username;
    export let domain;
    export let availableDomains;

    async function handleAddressCopy(e) {
        await navigator.clipboard.writeText(`${username}@${domain}`);
    }
</script>

<div class="address-selector-wrapper">
    <div class="address-selector">
        <input
            type="text"
            class="username"
            placeholder="Username"
            spellcheck="false"
            bind:value={username}
        />
        <select class="domain" bind:value={domain}>
            {#each availableDomains as domain}
                <option value={domain}>@{domain}</option>
            {/each}
        </select>
    </div>

    <CopyButton on:copy={handleAddressCopy} />
</div>

<style>
    .address-selector-wrapper {
        display: flex;
        justify-content: center;
        z-index: 1000;
        margin-bottom: 35px;
        gap: 15px;
    }

    .address-selector {
        display: flex;
        padding: 10px 20px;
        font-size: 20px;
        background-color: rgba(255, 255, 255, 0.103);
        border-radius: 5px;
        backdrop-filter: blur(2px);
    }

    .domain {
        background-color: transparent;
        border: none;
        color: #dbdde0;
        font-family: "Lato", sans-serif;
        font-size: inherit;
        padding: 5px 10px;
    }

    .domain option {
        color: black;
    }

    .username {
        border: none;
        background-color: transparent;
        font-family: "Lato", sans-serif;
        color: #dbdde0;
        font-size: inherit;
        padding: 5px 10px;
    }

    @media screen and (max-width: 600px) {
        .address-selector {
            padding: 10px;
        }

        .username,
        .domain {
            padding: 5px;
        }

        .address-selector-wrapper  {
            flex-direction: column;
        }
    }

    @media screen and (max-width: 425px) {
        .username,
        .domain {
            font-size: 16px;
        }
    }
</style>
