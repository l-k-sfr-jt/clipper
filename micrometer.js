const partsObj = {
    main: {
        src: './img/hlavni-cast.png',
        coords: {
            x: 0.0,
            y: 0.049,
        },
        imageData: null,
        width: null,
    },
    drumFilled: {
        src: './img/buben-filled.png',
        imageData: null,
        width: null,
        coords: {
            _x: 0.313,
            y: 0.147,
            get x() {
                return this._x;
            },
            set x(value) {
                value += 0.002
                this._x = Math.min(Math.max(value, partsObj.drumFilled.range.minX), partsObj.drumFilled.range.maxX);
            }
        },
        range: {
            maxX: 0.469,
            minX: 0.313,
        },
    },
    drum: {
        src: './img/buben.png',
        coords: {
            _x: 0.311,
            y: 0.1445,
            get x() {
                return this._x;
            },
            set x(value) {
                this._x = Math.min(Math.max(value, partsObj.drum.range.minX), partsObj.drum.range.maxX);
            }
        },
        range: {
            maxX: 0.467,
            minX: 0.311
        },
        imageData: null,
        width: null,
    },
    slider: {
        src: './img/posuvnik.png',
        coords: {
            _x: -0.237,
            y: -0.09,
            get x() {
                return this._x;
            },
            set x(value) {
                this._x = Math.min(Math.max(value, partsObj.slider.range.minX), partsObj.slider.range.maxX);
            }
        },
        range: {
            maxX: -0.1,
            minX: -0.237,
        },
        imageData: null,
        width: null,
    },
    scale: {
        src: "./img/stupnice.png",
        coords: {
            _x: 0.312,
            y: -0.280,
            get x() {
                return this._x;
            },
            set x(value) {
                this._x = Math.min(Math.max(value, partsObj.scale.range.minX), partsObj.scale.range.maxX);
            },
        },
        range: {
            maxX: 0.469,
            minX: 0.312
        },

    },
    scale2: {
        src: "./img/stupnice.png",
        coords: {
            _x: 0.312,
            y: 0.270,
            get x() {
                return this._x;
            },
            set x(value) {
                this._x = Math.min(Math.max(value, partsObj.scale.range.minX), partsObj.scale.range.maxX);
            },
        },
        range: {
            maxX: 0.469,
            minX: 0.312
        },
    }
}


const canvas = document.getElementById('micrometer');
const btnUp = document.getElementById('increaseBtn');
const btnDown = document.getElementById('decreaseBtn');
const unitSelectorElm = document.getElementById("unit");
const displayElm = document.getElementById("display");

const unitMap = {
    mm: 0.002735,
    mmm: 0.00052
}
let scaleSpeed = 2.7;
let selectedUnit = "mm";
function loadImages(imagePaths) {
    return Promise.all(
        imagePaths.map(({src, key}) => {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.src = src;
                image.onload = () => resolve({image, key});
                image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            });
        })
    )
        .catch((error) => {
            console.error(error.message);
        });
}


function drawImage(image, coords, width, canvas, ) {
    const height = width * (image.naturalHeight / image.naturalWidth);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, coords.x * canvas.width, coords.y * canvas.height, width, height);
}

function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawMicrometer() {
    const ctx = canvas.getContext('2d');
    drawImage(partsObj.slider.imageData, partsObj.slider.coords, canvas.width * 0.75, canvas);
    drawImage(partsObj.main.imageData, partsObj.main.coords, canvas.width * 0.75, canvas);
    drawImage(partsObj.drumFilled.imageData, partsObj.drum.coords,canvas.width * 0.5, canvas);
    const scaleImages = document.createElement('canvas');
    const mask = document.createElement('canvas');
    const maskCtx = mask.getContext("2d");

    scaleImages.width = canvas.width;
    scaleImages.height = canvas.height;
    mask.width = canvas.width;
    mask.height = canvas.height;

    drawImage(partsObj.scale.imageData, partsObj.scale.coords, canvas.width * 0.15, scaleImages);
    drawImage(partsObj.scale2.imageData, partsObj.scale2.coords, canvas.width * 0.15, scaleImages);

    drawImage(partsObj.drumFilled.imageData, partsObj.drumFilled.coords, canvas.width * 0.49, mask);
    maskCtx.globalCompositeOperation = "source-in";
    maskCtx.drawImage(scaleImages, 0, 0);

    ctx.drawImage(mask, 0, 0);
    updateDisplay(displayElm, partsObj.slider.coords.x)

}

function resizeCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1; // Default to 1 for non-Retina displays
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width;
    canvas.style.height = height;

    clearCanvas(canvas);
    drawMicrometer()
}

function updateSliderAndDrumPosition(newXPosition) {
    const sliderNewX = (newXPosition - sliderStartX) / canvas.width;
    partsObj.slider.coords.x = sliderNewX;

    // Calculate progress for the slider
    const sliderProgress = (sliderNewX - partsObj.slider.range.minX) /
        (partsObj.slider.range.maxX - partsObj.slider.range.minX);

    // Apply the same progress to the drum
    const drumRange = partsObj.drum.range.maxX - partsObj.drum.range.minX;
    partsObj.drum.coords.x = partsObj.drum.range.minX + (drumRange * sliderProgress);
    partsObj.drumFilled.coords.x = partsObj.drum.coords.x
    partsObj.scale.coords.x = partsObj.scale.range.minX + (drumRange * sliderProgress);
    partsObj.scale2.coords.x = partsObj.scale.range.minX + (drumRange * sliderProgress);

    //Scale Y direction
    if(partsObj.drum.coords.x === partsObj.drum.range.minX || partsObj.drum.coords.x === partsObj.drum.range.maxX) {
        partsObj.scale.coords.y = -0.280;
        partsObj.scale2.coords.y = 0.270;
        return
    }

    const threshHold = 0.549497;

    let scale1Y = -0.280 + ((sliderProgress * scaleSpeed) % threshHold);
    let scale2Y = 0.270 + ((sliderProgress * scaleSpeed) % threshHold);

    if(scale1Y > 0.55) {
        if(scale2Y > 0 ) {
            scale1Y = scale2Y - 0.549
        } else {
            scale1Y = scale2Y + 0.549
        }
    }

    if(scale2Y > 0.57) {
        if(scale1Y > 0 ) {
            scale2Y = scale1Y - 0.549
        } else {
            scale2Y = scale1Y + 0.549
        }

    }

    partsObj.scale.coords.y = scale1Y
    partsObj.scale2.coords.y = scale2Y
}

//moving state
let isDragging = false;
let sliderStartX = 0;

canvas.addEventListener('mousedown', (event) => {
    sliderStartX = event.offsetX - partsObj.slider.coords.x * canvas.width;
    isDragging = true;
});

canvas.addEventListener('mousemove', (event) => {
    const ctx = canvas.getContext('2d');

    if (isDragging) {
        //xPosition =
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate slider movement
        updateSliderAndDrumPosition(event.offsetX)

        drawMicrometer()
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseout', () => {
    isDragging = false;
});

btnUp.addEventListener("click", function () {
    sliderStartX = 0
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateSliderAndDrumPosition((partsObj.slider.coords.x + unitMap[selectedUnit]) * canvas.width);
    drawMicrometer()
});

btnDown.addEventListener("click", function () {
    sliderStartX = 0
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateSliderAndDrumPosition((partsObj.slider.coords.x -unitMap[selectedUnit]) * canvas.width);
    drawMicrometer()
});

unitSelectorElm.addEventListener("change", (event) => {
    selectedUnit = event.target.value;
});

function updateDisplay(elm, value) {
    value += Math.abs(0.237);
    value = (value * 18.30).toFixed(2)
    console.log(value);
    elm.textContent = `${value}  mm`;
}

async function  init() {
    const imagePaths = Object.entries(partsObj).map(([key, part]) => ({
        src: part.src,
        key: key
    }));
    const loadedImages = await loadImages(imagePaths);

    loadedImages.forEach(({image, key}) => {
        if(partsObj[key]) {
            partsObj[key].imageData = image;
        }
    })

    resizeCanvas(canvas);
}

init()
