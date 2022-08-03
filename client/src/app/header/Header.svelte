<script>
    import AddressSelector from "./address/AddressSelector.svelte";
    import Description from "./Description.svelte";
    import Glow from "./stars/Glow.svelte";
    import Stars1 from "./stars/Stars1.svelte";
    import Stars2 from "./stars/Stars2.svelte";
    import Stars3 from "./stars/Stars3.svelte";
    import Title from "./Title.svelte";

    export let username;
    export let domain;
    export let availableDomains;
</script>

<div class="header">
    <Stars1 />
    <Stars2 />
    <Stars3 />
    <Glow />
    <Title />
    <AddressSelector bind:username bind:domain {availableDomains} />
    <Description />
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
</style>
