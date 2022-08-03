<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import dateFormat from "dateformat";
    import sanitizeHtml from "sanitize-html";
    import { onMount } from "svelte";

    export let mail;

    let mailBodyIFrame;

    const dispatch = createEventDispatcher();

    function handleGoBackToListClick(e) {
        dispatch("showList");
    }

    async function handleDeleteClick(e) {
        await fetch(`/api/v1/mail/${mail.to.address}/${mail.id}`, {
            method: "DELETE",
        });
        dispatch("removeMail", mail);
        handleGoBackToListClick();
    }

    function handleViewRawClick(e) {
        window.open(`/api/v1/mail/${mail.to.address}/${mail.id}`, "_blank");
    }

    function hashAuthor(address) {
        const avatarCount = 7;
        const index =
            address
                .split("")
                .reduce((p, c) => p + (c.charCodeAt(0) % avatarCount), 0) %
            avatarCount;

        return index;
    }

    onMount(() => {
        if (mail.body.html !== "") {
            mailBodyIFrame.contentWindow.document.write(
                sanitizeHtml(mail.body.html)
            );
        } else {
            mailBodyIFrame.contentWindow.document.write(sanitizeHtml(mail.body.text));
        }
    });
</script>

<div class="mail" in:fade={{ duration: 300 }}>
    <div class="action-button-row">
        <button class="action-button" on:click={handleGoBackToListClick}>
            <i class="fa-solid fa-angle-left" /> Back to list
        </button>
        <div class="action-button-row-spacer" />
        <button class="action-button" on:click={handleDeleteClick}>
            <i class="fa-solid fa-trash-can" /> Delete
        </button>
        <button class="action-button" on:click={handleViewRawClick}>
            <i class="fa-solid fa-code" /> View raw
        </button>
    </div>
    <div class="mail-info">
        <div class="from-info">
            <div class="sender">
                <img
                    src="img/authors/{hashAuthor(mail.from.address)}.png"
                    alt="avatar"
                    class="sender-avatar"
                />
                <div class="sender-name">{mail.from.name}</div>
                <div class="sender-address">{mail.from.address}</div>
            </div>

            <div class="date">
                <div class="generic-info-title">Date</div>
                <div class="generic-info-value">
                    {dateFormat(
                        Date.parse(mail.date),
                        "mmmm dS, yyyy, h:MM:ss TT"
                    )}
                </div>
            </div>
        </div>

        <div class="generic-info">
            <div class="generic-info-title">Subject:</div>
            <div class="generic-info-value">{mail.subject}</div>
        </div>

        {#if mail.attachments.length > 0}
            <div class="generic-info">
                <div class="generic-info-title">Attachments:</div>
                <div class="generic-info-value">
                    {#each mail.attachments as a}
                        <a
                            class="attachment-url"
                            target="_blank"
                            href="/api/v1/mail/{mail.to
                                .address}/{mail.id}/attachments/{a.id}"
                        >
                            {a.fileName}
                        </a>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    <div class="mail-body">
        <iframe title="body" bind:this={mailBodyIFrame} />
    </div>
</div>

<style>
    .attachment-url:visited,
    .attachment-url {
        color: #1d1d1e;
    }

    .attachment-url::after {
        content: ", ";
    }

    .attachment-url:last-of-type:after {
        content: "";
    }

    .mail-body {
        border-top: solid 1px rgb(34 36 43 / 16%);
        padding: 15px 25px;
        overflow: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .mail-body iframe {
        flex: 1;
        border: none;
    }

    .mail {
        color: #1d1d1e;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .generic-info {
        display: flex;
        padding: 15px 0;
        border-bottom: solid 1px rgb(34 36 43 / 16%);
    }

    .generic-info:last-of-type {
        border-bottom: none;
    }

    .generic-info-title {
        color: #8b8b90;
        padding-right: 10px;
    }

    .date {
        display: grid;
        grid-template-rows: 1fr 1fr;
    }

    .mail-info {
        margin: 15px 25px 0 25px;
    }

    .from-info {
        display: flex;
        justify-content: space-between;
        padding: 10px 0 20px 0;
        border-bottom: solid 1px rgb(34 36 43 / 16%);
    }

    .date .generic-info-title {
        text-align: right;
        display: flex;
        align-self: flex-end;
        flex-direction: column;
        padding-right: 0;
    }

    .date .generic-info-value {
        text-align: right;
    }

    .sender {
        display: grid;
        grid-template-areas:
            "a b"
            "a c";
        grid-template-columns: max-content max-content;
        column-gap: 15px;
    }

    .sender-avatar {
        height: 50px;
        width: 50px;
        border-radius: 50%;
        filter: drop-shadow(0px 0px 4px rgb(34 36 43 / 30%));
        grid-area: a;
    }

    .sender-name {
        grid-area: b;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    .sender-address {
        grid-area: c;
        color: #8b8b90;
    }

    .action-button-row {
        background-color: #f5f5fa;
        padding: 10px;
        display: flex;
        border-bottom: solid 1px rgb(34 36 43 / 16%);
    }

    .action-button-row-spacer {
        flex: 1;
    }

    .action-button {
        background-color: transparent;
        font-family: "Lato", sans-serif;
        border: none;
        font-size: 16px;
        color: #1d1d1e;
        cursor: pointer;
        margin: 5px 10px;
    }

    .action-button .fa-solid {
        margin-right: 4px;
    }
</style>
