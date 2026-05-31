const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");
const prizeElement = document.getElementById("prize");
const resetButton = document.getElementById("resetButton");
const result = document.getElementById("result");
const winnerSound = new Audio("assets/winner.mp3");

const scratchSound = new Audio("assets/scratch.mp3");
scratchSound.loop = true;
scratchSound.volume = 0.4;
scratchSound.preload = "auto";

const prizes = [
    "€10 Bonus",
    "Free Drink",
    "VIP Entry",
    "€25 Bonus",
    "Mystery Prize",
    "Lucky Draw"
];

let isDrawing = false;
let hasRevealed = false;

function setRandomPrize() {
    const randomIndex = Math.floor(Math.random() * prizes.length);
    prizeElement.textContent = prizes[randomIndex];
}

function drawCover() {
    ctx.globalCompositeOperation = "source-over";

    const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gradient.addColorStop(0, "#e0e0e0");
    gradient.addColorStop(0.25, "#bdbdbd");
    gradient.addColorStop(0.5, "#f5f5f5");
    gradient.addColorStop(0.75, "#9e9e9e");
    gradient.addColorStop(1, "#d6d6d6");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#8f8f8f";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH HERE", canvas.width / 2, canvas.height / 2 + 10);
}

function getPosition(event) {
    const rect = canvas.getBoundingClientRect();

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((clientY - rect.top) / rect.height) * canvas.height
    };
}

function scratch(event) {
    if (!isDrawing) return;

    event.preventDefault();

    const position = getPosition(event);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(position.x, position.y, 25, 0, Math.PI * 2);
    ctx.fill();

    checkRevealPercentage();
}

function checkRevealPercentage() {
    if (hasRevealed) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) {
            transparentPixels++;
        }
    }

    const totalPixels = canvas.width * canvas.height;
    const revealedPercentage = (transparentPixels / totalPixels) * 100;

    if (revealedPercentage > 45) {
        hasRevealed = true;

        result.innerHTML = `🎉 Congratulations! 🎉 <br> You revealed: ${prizeElement.textContent}`;

        winnerSound.currentTime = 0;
        winnerSound.play();

        confetti({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.6 }
        });
    }
}

function startScratch(event) {
    isDrawing = true;

    scratchSound.pause();
    scratchSound.currentTime = 0;

    const playPromise = scratchSound.play();

    if (playPromise !== undefined) {
        playPromise.catch((error) => {
            console.log("Scratch sound error:", error);
        });
    }

    scratch(event);
}

function stopScratch() {
    isDrawing = false;

    scratchSound.pause();
    scratchSound.currentTime = 0;
}

function resetGame() {
    hasRevealed = false;
    result.textContent = "Scratch to reveal your prize";
    setRandomPrize();
    drawCover();
}

canvas.addEventListener("mousedown", startScratch);
canvas.addEventListener("mousemove", scratch);
canvas.addEventListener("mouseup", stopScratch);
canvas.addEventListener("mouseleave", stopScratch);

canvas.addEventListener("touchstart", startScratch);
canvas.addEventListener("touchmove", scratch);
canvas.addEventListener("touchend", stopScratch);

resetButton.addEventListener("click", resetGame);

setRandomPrize();
drawCover();