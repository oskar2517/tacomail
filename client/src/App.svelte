<script>
    import ControlButtonRow from "./app/control-buttons/ControlButtonRow.svelte";
    import Footer from "./app/footer/Footer.svelte";
    import Header from "./app/header/Header.svelte";
    import MailList from "./app/mail-list/MailList.svelte";
    import equal from "deep-equal";
    import { onMount } from "svelte";
    import { getDomains, getRandomUsername, getInbox, deleteInbox } from "./api";

    Array.prototype.sample = function () {
        return this[Math.floor(Math.random() * this.length)];
    };

    let mails = [];

    let selectedDomain = "";
    let selectedUsername = "";
    let availableDomains = [];

    onMount(async () => {
        availableDomains = await getDomains();
        selectedDomain = availableDomains.sample();

        selectedUsername = (await getRandomUsername()).username;
    });

    function getSelectedAddress() {
        return `${selectedUsername}@${selectedDomain}`;
    }

    async function handleRefreshClick(e) {
        const result = await getInbox(getSelectedAddress());

        if (!equal(result, mails)) {
            mails = result;
        }
    }

    async function handleInboxDeleteClick(e) {
        await deleteInbox(getSelectedAddress());
        mails = [];
    }

    function handleRemoveMail(e) {
        mails = mails.filter((m) => m.id !== e.detail.id);
    }

    async function handleNewAddressClick(e) {
        mails = [];
        selectedUsername = (await getRandomUsername()).username;
        selectedDomain = availableDomains.sample();
    }
</script>

<main>
    <Header bind:username={selectedUsername} bind:domain={selectedDomain} {availableDomains} />
    <ControlButtonRow on:refreshClick={handleRefreshClick} on:inboxDeleteClick={handleInboxDeleteClick} on:newAddressClick={handleNewAddressClick} />
    <MailList {mails} on:removeMail={handleRemoveMail} />
    <Footer />
</main>
