<script>
    import { createEventDispatcher } from "svelte";
    import { _ } from "svelte-i18n";

    import ControlButton from "./ControlButton.svelte";

    const dispatch = createEventDispatcher();
    let refreshButton;

    setInterval(() => {
        if (refreshButton) {
            refreshButton.firstChild.click();
        }
    }, 5000);

    function handleRefreshClick(e) {
        dispatch("refreshClick");
    }

    function handleInboxDeleteClick(e) {
        dispatch("inboxDeleteClick");
    }

    function handleNewAddressClick(e) {
        dispatch("newAddressClick");
    }
</script>

<div class="control-button-row">
    <ControlButton
        name={$_("controlButtons.newAddressButton.title")}
        description={$_("controlButtons.newAddressButton.description")}
        icon="fa-arrow-rotate-right"
        animatable={true}
        on:click={handleNewAddressClick}
    />
    <div bind:this={refreshButton}>
        <ControlButton
            name={$_("controlButtons.refreshButton.title")}
            description={$_("controlButtons.refreshButton.description")}
            icon="fa-arrows-rotate"
            animatable={true}
            on:click={handleRefreshClick}
        />
    </div>
    <ControlButton
        name={$_("controlButtons.deleteInboxButton.title")}
        description={$_("controlButtons.deleteInboxButton.description")}
        icon="fa-trash-can"
        animatable={false}
        on:click={handleInboxDeleteClick}
    />
</div>

<style>
    .control-button-row {
        background-color: #f5f5fa;
        display: flex;
        gap: 25px;
        justify-content: center;
        box-shadow: 0 2px 4px rgb(34 36 43 / 16%);
        padding: 20px 10px;
        margin-bottom: 50px;
    }

    @media screen and (max-width: 500px) {
        .control-button-row {
            gap: 10px;
        }
    }

    @media screen and (max-width: 400px) {
        .control-button-row {
            flex-direction: column;
        }
    }
</style>
