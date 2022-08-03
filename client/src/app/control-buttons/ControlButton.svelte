<script>
    import { createEventDispatcher } from "svelte";

    export let name;
    export let icon;
    export let animatable;

    let animate = false;

    const dispatch = createEventDispatcher();

    function handleClick(e) {
        dispatch("click");

        if (!animate && animatable) {
            animate = true;

            setTimeout(() => {
                animate = false;
            }, 1000);
        }
    }
</script>

<button class="button" on:click={handleClick}>
    <i class="icon fa-solid {icon}" class:animate />
    <div class="name">{name}</div>
</button>

<style>
    .icon {
        transform-origin: 50% 50%;
    }

    .icon.animate {
        animation: linear rotate 1s;
    }

    .name {
        margin-left: 7px;
    }

    /* Based on https://getcssscan.com/css-buttons-examples */
    .button {
        align-items: center;
        background: #f5f5fa;
        border: 0;
        border-radius: 5px;
        box-shadow: -10px -10px 30px 0 #fff, 10px 10px 30px 0 #1d0dca17;
        box-sizing: border-box;
        color: #1d1d1e;
        cursor: pointer;
        display: flex;
        font-family: "Lato", sans-serif;
        font-size: 16px;
        padding: 15px 20px;
        justify-content: center;
        position: relative;
        text-align: left;
        transition: 0.2s;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        white-space: pre;
        width: max-content;
        word-break: normal;
        word-spacing: normal;
    }

    .button:hover {
        background: #f8f8ff;
        box-shadow: -15px -15px 30px 0 #fff, 15px 15px 30px 0 #1d0dca17;
    }

    @keyframes rotate {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    @media screen and (max-width: 500px) {
        .button {
            padding: 15px 10px;
        }
    }

    @media screen and (max-width: 500px) {
        .button {
            width: 100%;
        }
    }
</style>
