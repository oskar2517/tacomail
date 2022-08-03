<script>
    import { createEventDispatcher } from "svelte";
    import dateFormat from "dateformat";

    export let mail;
    export let unseen;

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch("showMail", mail);
    }
</script>

<div class="mail" on:click={handleClick}>
    <div class="unseen" class:visible={unseen} />
    <div class="sender">
        <div class="sender-name">{mail.from.name}</div>
        <div class="sender-address">{mail.from.address}</div>
    </div>
    <div class="subject">{mail.subject}</div>
    <div class="date">{dateFormat(Date.parse(mail.date), "mmmm dS, yyyy, h:MM:ss TT")}</div>
</div>

<style>
    .mail {
        display: grid;
        grid-template-columns: max-content 25% auto max-content;
        padding: 15px;
        background-color: #f5f5fa;
        font-size: 16px;
        color: #1d1d1e;
        column-gap: 20px;
        border-bottom: solid 1px rgb(34 36 43 / 16%);
        cursor: pointer;
    }

    .unseen {
        background-color: #00c099;
        height: 8px;
        width: 8px;
        border-radius: 50%;
        align-self: center;
    }

    .unseen:not(.visible) {
        opacity: 0;
    }

    .sender-address {
        color: #8B8B90;
    }

    .subject,
    .date {
        align-self: center;
    }

    .subject,
    .sender-name,
    .sender-address {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
