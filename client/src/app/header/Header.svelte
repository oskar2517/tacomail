<script>
    import AddressSelector from "./address/AddressSelector.svelte";
    import Description from "./Description.svelte";
    import Glow from "./stars/Glow.svelte";
    import Starfield from "./stars/Starfield.svelte";
    import Title from "./Title.svelte";

    export let username;
    export let domain;
    export let availableDomains;
</script>

<div class="header">
    <div class="background" aria-hidden="true">
        <Starfield />
        <Glow />
    </div>
    <div class="content">
        <Title />
        <AddressSelector bind:username bind:domain {availableDomains} />
        <Description />
    </div>
</div>

<style>
    .header {
        padding: 60px 20px;
        position: relative;
        overflow: hidden;
        background: radial-gradient(
            ellipse at bottom,
            #0c1116 0%,
            #090a0f 100%
        );
        user-select: none;
        z-index: 1000;
    }

    .background {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
    }

    .content {
        position: relative;
        z-index: 1;
    }
</style>
