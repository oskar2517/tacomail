<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import dateFormat from "dateformat";
    import sanitizeHtml from "sanitize-html";
    import { onMount } from "svelte";
    import { _ } from "svelte-i18n";
    import { deleteMail } from "../../api";

    export let mail;

    let mailBodyIFrame;

    const dispatch = createEventDispatcher();

    function sanitizeHtmlWithConfig(s) {
        return sanitizeHtml(s, {
            allowedAttributes: false,
            allowedTags: [
                "a",
                "b",
                "br",
                "big",
                "blockquote",
                "caption",
                "code",
                "del",
                "div",
                "dt",
                "dd",
                "font",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "hr",
                "i",
                "img",
                "ins",
                "li",
                "map",
                "ol",
                "p",
                "pre",
                "s",
                "small",
                "strong",
                "span",
                "sub",
                "sup",
                "table",
                "tbody",
                "td",
                "tfoot",
                "th",
                "thead",
                "tr",
                "u",
                "ul",
                "html",
                "head",
                "body",
                "title",
                "style",
                "link",
            ],
        });
    }

    function handleGoBackToListClick(e) {
        dispatch("showList");
    }

    async function handleDeleteClick(e) {
        await deleteMail(mail.to.address, mail.id);
        dispatch("removeMail", mail);
        handleGoBackToListClick();
    }

    function handleViewRawClick(e) {
        window.open(`/api/v1/mail/${mail.to.address}/${mail.id}`, "_blank");
    }

    function hashAuthor(address) {
        const avatarCount = 16;
        const prime = 13;

        const hash = address.split("").reduce((acc, char) => {
            const charCode = char.charCodeAt(0);
            return (acc * prime + charCode) % avatarCount;
        }, 0);

        return hash;
    }

    onMount(() => {
        mailBodyIFrame.contentWindow.document.write('<base target="_parent">');
        if (mail.body.html !== "") {
            mailBodyIFrame.contentWindow.document.write(
                sanitizeHtmlWithConfig(mail.body.html)
            );
        } else {
            mailBodyIFrame.contentWindow.document.write(
                sanitizeHtmlWithConfig(mail.body.text)
            );
        }
    });
</script>

<div class="mail" in:fade={{ duration: 300 }}>
    <div class="action-button-row">
        <button type="button" class="action-button" on:click={handleGoBackToListClick} title={$_("mailDetails.backToListButton.description")}>
            <i class="fa-solid fa-angle-left" /> {$_("mailDetails.backToListButton.title")}
        </button>
        <div class="action-button-row-spacer" />
        <button type="button" class="action-button" on:click={handleDeleteClick} title={$_("mailDetails.deleteMailButton.description")}>
            <i class="fa-solid fa-trash-can" /> {$_("mailDetails.deleteMailButton.title")}
        </button>
        <button type="button" class="action-button" on:click={handleViewRawClick} title={$_("mailDetails.viewMailRawButton.description")}>
            <i class="fa-solid fa-code" /> {$_("mailDetails.viewMailRawButton.title")}
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
                <div class="generic-info-title">{$_("mailDetails.dateTitle")}</div>
                <div class="generic-info-value">
                    {dateFormat(
                        Date.parse(mail.date),
                        "mmmm dS, yyyy, h:MM:ss TT"
                    )}
                </div>
            </div>
        </div>

        <div class="generic-info">
            <div class="generic-info-title">{$_("mailDetails.subjectTitle")}:</div>
            <div class="generic-info-value">{mail.subject}</div>
        </div>

        {#if mail.attachments.length > 0}
            <div class="generic-info">
                <div class="generic-info-title">{$_("mailDetails.attachmentsTitle")}:</div>
                <div class="generic-info-value">
                    {#each mail.attachments as a}
                        <a
                            title={!a.present ? $_("mailDetails.attachmentUnavailable") : null }
                            class:present={a.present}
                            class="attachment-url"
                            target="_blank"
                            href={a.present ? `/api/v1/mail/${mail.to.address}/${mail.id}/attachments/${a.id}` : null }
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

    .attachment-url:not(.present) {
        opacity: .5;
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
