<img src="img/taco.png" alt="waiting" class="spinner" />

<style>
    .spinner {
        height: 100px;
        animation: ease-in-out fly 2.5s infinite;
        filter: drop-shadow(0px 0px 4px rgb(34 36 43 / 30%));
        margin-bottom: 5px;
    }

    @keyframes fly {
        0% {
            transform: translateY(10px);
        }

        50% {
            transform: translateY(-10px);
        }

        100% {
            transform: translateY(10px);
        }
    }
</style>
