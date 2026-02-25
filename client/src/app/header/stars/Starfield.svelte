<script>
    import { onMount } from "svelte";

    const MAX_DPR = 2;
    const MIN_STARS_PER_LAYER = 45;
    const LAYERS = [
        {
            size: 1,
            speed: 0.008,
            density: 0.00012,
            alphaMin: 0.35,
            alphaMax: 0.95
        },
        {
            size: 2,
            speed: 0.014,
            density: 0.00006,
            alphaMin: 0.45,
            alphaMax: 0.9
        },
        {
            size: 3,
            speed: 0.021,
            density: 0.00003,
            alphaMin: 0.55,
            alphaMax: 0.85
        }
    ];

    let canvas;
    let context = null;
    let width = 1;
    let height = 1;
    let animationFrameId = null;
    let resizeObserver = null;
    let prefersReducedMotion = false;
    let motionQuery = null;
    let starsByLayer = [];
    let previousTime = 0;

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function generateLayer(layer) {
        const starCount = Math.max(
            MIN_STARS_PER_LAYER,
            Math.floor(width * height * layer.density)
        );
        const stars = [];

        for (let i = 0; i < starCount; i += 1) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                alpha: randomBetween(layer.alphaMin, layer.alphaMax)
            });
        }

        return {
            ...layer,
            stars
        };
    }

    function regenerateStars() {
        starsByLayer = LAYERS.map(generateLayer);
    }

    function updateCanvasSize() {
        if (!canvas) return;

        const bounds = canvas.getBoundingClientRect();
        width = Math.max(1, bounds.width);
        height = Math.max(1, bounds.height);

        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        context = canvas.getContext("2d");
        if (context) {
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            regenerateStars();
            renderFrame(0);
        }
    }

    function renderFrame(deltaTime) {
        if (!context) return;

        context.clearRect(0, 0, width, height);

        for (let i = 0; i < starsByLayer.length; i += 1) {
            const layer = starsByLayer[i];

            for (let j = 0; j < layer.stars.length; j += 1) {
                const star = layer.stars[j];

                if (!prefersReducedMotion && deltaTime > 0) {
                    star.y -= layer.speed * deltaTime;

                    if (star.y < -layer.size) {
                        star.x = Math.random() * width;
                        star.y = height + Math.random() * (height * 0.25);
                        star.alpha = randomBetween(
                            layer.alphaMin,
                            layer.alphaMax
                        );
                    }
                }

                context.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                context.fillRect(star.x, star.y, layer.size, layer.size);
            }
        }
    }

    function animateStars(time) {
        if (!previousTime) {
            previousTime = time;
        }

        const deltaTime = Math.min(48, time - previousTime);
        previousTime = time;

        renderFrame(deltaTime);
        animationFrameId = requestAnimationFrame(animateStars);
    }

    onMount(() => {
        if (!canvas) return undefined;

        const handleMotionPreferenceChange = (event) => {
            prefersReducedMotion = event.matches;
            renderFrame(0);
        };

        motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        prefersReducedMotion = motionQuery.matches;

        if (motionQuery.addEventListener) {
            motionQuery.addEventListener("change", handleMotionPreferenceChange);
        } else {
            motionQuery.addListener(handleMotionPreferenceChange);
        }

        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(updateCanvasSize);
            resizeObserver.observe(canvas);
        } else {
            window.addEventListener("resize", updateCanvasSize);
        }

        updateCanvasSize();
        animationFrameId = requestAnimationFrame(animateStars);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            if (resizeObserver) {
                resizeObserver.disconnect();
            } else {
                window.removeEventListener("resize", updateCanvasSize);
            }

            if (motionQuery) {
                if (motionQuery.removeEventListener) {
                    motionQuery.removeEventListener(
                        "change",
                        handleMotionPreferenceChange
                    );
                } else {
                    motionQuery.removeListener(handleMotionPreferenceChange);
                }
            }
        };
    });
</script>

<canvas class="starfield" bind:this={canvas} aria-hidden="true" />

<style>
    .starfield {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
