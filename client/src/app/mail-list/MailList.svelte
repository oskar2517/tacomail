<script>
    import { fade } from "svelte/transition";
    import { flip } from "svelte/animate";
    import MailEntry from "./MailEntry.svelte";
    import Placeholder from "./Placeholder.svelte";
    import MailDetails from "./MailDetails.svelte";
    import { afterUpdate } from "svelte";

    export let mails;

    afterUpdate(() => {
        if (mails.length === 0) {
            currentMail = null;
        }
    });

    let currentMail = null;
    let seenMails = [];

    function handleShowMail(e) {
        currentMail = e.detail;
        seenMails.push(e.detail.id);
    }

    function handleShowList(e) {
        currentMail = null;
    }
</script>

<div class="mail-list">
    {#if mails.length == 0}
        <Placeholder />
    {:else if currentMail !== null }
        <MailDetails on:showList={handleShowList} mail={currentMail} on:removeMail />
    {:else}
        {#each mails as m, i (m)}
            <div animate:flip in:fade={{ duration: 300 }}>
                <MailEntry on:showMail={handleShowMail} mail={m} unseen={!seenMails.includes(m.id)} />
            </div>
        {/each}
    {/if}
</div>

<style>
    .mail-list {
        height: 550px;
        max-width: 95vw;
        width: 900px;
        margin: 0 auto;
        overflow-y: auto;
        resize: vertical;
        border-radius: 5px;
        border: solid 1px rgb(34 36 43 / 16%);
        margin-bottom: 100px;
        position: relative;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        min-height: 200px;
    }

    @media screen and (max-width: 500px) {
        .mail-list {
            margin-bottom: 50px;
        }
    }
</style>
