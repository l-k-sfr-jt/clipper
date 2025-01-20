const parts = [
    {src: './img/telo.png', x: 0.03, y: 0.05, width: null, height: null, isDraggable: false, data: null},
    {src: './img/horni-rameno.png', x: -0.075, y: 0.049, width: null, height: null, isDraggable: true, data: null},
    {src: './img/spodni-rameno.png', x: -0.075, y: 0.05, width: null, height: null, isDraggable: true, data: null}
];

const canvas = document.getElementById('clipper');
const btnUp = document.getElementById('increaseBtn');
const btnDown = document.getElementById('decreaseBtn');

const margin = {top: 0, length: 0};


function init() {
    resizeCanvas(canvas, parts);
}

function loadImage(canvas, image) {
    const img = new Image();
    img.src = image.src;
    image.data = img;

    img.onload = function () {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        image.height = image.width * aspectRatio;
        drawImage(image);
    };
}

function drawImage(image) {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image.data, image.x * canvas.width, image.y * canvas.height, image.width, image.height);
}

function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas(canvas, parts) {
    const dpr = window.devicePixelRatio || 1; // Default to 1 for non-Retina displays
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width;
    canvas.style.height = height;

    clearCanvas(canvas);
    for (const part of parts) {
        part.width = canvas.width;
        loadImage(canvas, part);
    }
}

//state
let isDragging = false;
let startX = 0;
let xPosition = 0;
let closed = true;
let maxOpened = false;

canvas.addEventListener('mousedown', (event) => {
    console.log(event.offsetX);
    const mouseX = event.offsetX;

    // Check if the mouse is within the image bounds
        isDragging = true;
        startX = mouseX - (xPosition) * canvas.width;
});

// Mouse move event - drag the image
canvas.addEventListener('mousemove', (event) => {
    const ctx = canvas.getContext('2d');
    if (isDragging) {
        xPosition = (event.offsetX) / canvas.width - 0.075;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const part of parts) {
            if (!part.isDraggable) {
                drawImage(part);
                continue;
            }

            if(xPosition <=  -0.075) {
                part.x = -0.075;
            } else if (xPosition >= 0.65) {
                part.x = 0.65;
            } else {
                part.x = xPosition;
            }

            drawImage(part);
        }
    }
});

// Mouse up event - stop dragging
canvas.addEventListener('mouseup', () => {
    isDragging = false;
    for (const part of parts) {
        drawImage(part);
    }
});

// Mouse out event - stop dragging if the mouse leaves the canvas
canvas.addEventListener('mouseout', () => {
    isDragging = false;
});


btnDown.addEventListener('click', (event) => {
    maxOpened = false;
    if(closed) {
        return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const part of parts) {
        if (!part.isDraggable) {
            drawImage(part);
            continue;
        }
        part.x -= 0.0422
        if (part.x <= -0.055) {
            closed = true;
        }
        drawImage(part);
    }
});

btnUp.addEventListener('click', (event) => {
    closed = false;

    if(maxOpened) {
        return;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const part of parts) {
        if (!part.isDraggable) {
            drawImage(part);
            continue;
        }
        console.log(part.x)
        part.x = (part.x + 0.0422)

        if(part.x >= 0.6) {
            maxOpened = true;
        }
        drawImage(part);
    }
})


init();
window.addEventListener("resize", () => resizeCanvas(canvas, parts));

