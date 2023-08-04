<script>
    import ControlButtonRow from "./app/control-buttons/ControlButtonRow.svelte";
    import Footer from "./app/footer/Footer.svelte";
    import Header from "./app/header/Header.svelte";
    import MailList from "./app/mail-list/MailList.svelte";
    import { generateUsername } from "unique-username-generator";
    import equal from "deep-equal";
    import { onMount } from "svelte";

    Array.prototype.sample = function () {
        return this[Math.floor(Math.random() * this.length)];
    };

    let mails = [];

    let selectedDomain;
    let selectedUsername = generateUsername();
    let availableDomains = [];

    onMount(async () => {
        availableDomains = await fetch("/api/v1/domains").then((res) =>
            res.json()
        );

        selectedDomain = availableDomains.sample();
    });
    
    function getSelectedAddress() {
        return `${selectedUsername}@${selectedDomain}`;
    }

    async function handleRefreshClick(e) {
        const result = await fetch(`/api/v1/mail/${getSelectedAddress()}`).then(
            (res) => res.json()
        );

        if (!equal(result, mails)) {
            mails = result;
        }
    }

    async function handleInboxDeleteClick(e) {
        await fetch(`/api/v1/mail/${getSelectedAddress()}`, {
            method: "DELETE",
        });
        mails = [];
    }

    function handleRemoveMail(e) {
        mails = mails.filter((m) => m.id !== e.detail.id);
    }

    function handleNewAddressClick(e) {
        mails = [];
        selectedUsername = generateUsername();
        selectedDomain = availableDomains.sample();
    }
</script>

<main>
    <Header
        bind:username={selectedUsername}
        bind:domain={selectedDomain}
        {availableDomains}
    />
    <ControlButtonRow
        on:refreshClick={handleRefreshClick}
        on:inboxDeleteClick={handleInboxDeleteClick}
        on:newAddressClick={handleNewAddressClick}
    />
    <MailList {mails} on:removeMail={handleRemoveMail} />
    <Footer />
</main>
