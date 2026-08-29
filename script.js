/* =========================================================
   TEXTILE VECTOR STUDIO
   Main Application
========================================================= */


/* =========================================================
   DOM
========================================================= */

const fileInput =
    document.getElementById("fileInput");

const browseButton =
    document.getElementById("browseButton");

const emptyUploadButton =
    document.getElementById("emptyUploadButton");

const dropZone =
    document.getElementById("dropZone");

const emptyState =
    document.getElementById("emptyState");

const originalPreview =
    document.getElementById("originalPreview");

const vectorPreview =
    document.getElementById("vectorPreview");

const patternPreview =
    document.getElementById("patternPreview");

const previewStage =
    document.getElementById("previewStage");

const canvasWrapper =
    document.getElementById("canvasWrapper");

const gridOverlay =
    document.getElementById("gridOverlay");

const artworkThumb =
    document.getElementById("artworkThumb");

const artworkName =
    document.getElementById("artworkName");

const artworkDimensions =
    document.getElementById("artworkDimensions");

const imageInfo =
    document.getElementById("imageInfo");

const processingInfo =
    document.getElementById("processingInfo");

const appStatus =
    document.getElementById("appStatus");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================================
   CONTROLS
========================================================= */

const brightness =
    document.getElementById("brightness");

const contrast =
    document.getElementById("contrast");

const brightnessValue =
    document.getElementById("brightnessValue");

const contrastValue =
    document.getElementById("contrastValue");

const colorCount =
    document.getElementById("colorCount");

const colorCountValue =
    document.getElementById("colorCountValue");

const smoothness =
    document.getElementById("smoothness");

const smoothnessValue =
    document.getElementById("smoothnessValue");

const detail =
    document.getElementById("detail");

const colorMode =
    document.getElementById("colorMode");


/* =========================================================
   BUTTONS
========================================================= */

const convertButton =
    document.getElementById("convertButton");

const backgroundButton =
    document.getElementById("backgroundButton");

const bwButton =
    document.getElementById("bwButton");

const rotateButton =
    document.getElementById("rotateButton");

const cropButton =
    document.getElementById("cropButton");

const resetButton =
    document.getElementById("resetButton");

const newDesignBtn =
    document.getElementById("newDesignBtn");


/* =========================================================
   EXPORT BUTTONS
========================================================= */

const downloadSvg =
    document.getElementById("downloadSvg");

const downloadPng =
    document.getElementById("downloadPng");

const downloadHighPng =
    document.getElementById("downloadHighPng");

const downloadPdf =
    document.getElementById("downloadPdf");

const downloadDxf =
    document.getElementById("downloadDxf");


/* =========================================================
   STATE
========================================================= */

let sourceImage = null;

let sourceFileName =
    "textile-artwork";

let originalDataUrl = null;

let processedDataUrl = null;

let currentSvg = null;

let currentImageWidth = 0;

let currentImageHeight = 0;

let rotation = 0;

let zoom = 1;

let panMode = false;

let isDragging = false;

let dragStartX = 0;

let dragStartY = 0;

let panX = 0;

let panY = 0;

let currentRepeat = "straight";

let currentRepeatSize = 1;

let gridEnabled = false;

let blackWhiteEnabled = false;

let backgroundRemoved = false;


/* =========================================================
   IMAGE PROCESSING CANVAS
========================================================= */

const processingCanvas =
    document.createElement("canvas");

const processingContext =
    processingCanvas.getContext("2d");


/* =========================================================
   INITIAL VIEW
========================================================= */

previewStage.classList.add(
    "show-original"
);


/* =========================================================
   FILE UPLOAD
========================================================= */

browseButton.addEventListener(
    "click",
    () => fileInput.click()
);


emptyUploadButton.addEventListener(
    "click",
    () => fileInput.click()
);


dropZone.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );

        const file =
            event.dataTransfer.files[0];

        if (isValidImage(file)) {

            loadImage(file);

        }

    }
);


fileInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        if (isValidImage(file)) {

            loadImage(file);

        }

    }
);


function isValidImage(file) {

    if (!file) {
        return false;
    }

    if (!file.type.startsWith("image/")) {

        showToast(
            "Please upload a JPG, PNG or WEBP image."
        );

        return false;

    }

    return true;
}


/* =========================================================
   LOAD IMAGE
========================================================= */

function loadImage(file) {

    sourceFileName =
        file.name.replace(
            /\.[^/.]+$/,
            ""
        );


    const reader =
        new FileReader();


    reader.onload = event => {

        const img =
            new Image();


        img.onload = () => {

            sourceImage = img;

            currentImageWidth =
                img.naturalWidth;

            currentImageHeight =
                img.naturalHeight;


            originalDataUrl =
                event.target.result;

            processedDataUrl =
                originalDataUrl;


            rotation = 0;

            zoom = 1;

            panX = 0;

            panY = 0;

            currentSvg = null;

            blackWhiteEnabled = false;

            backgroundRemoved = false;


            brightness.value = 0;

            contrast.value = 0;

            brightnessValue.textContent =
                "0";

            cont
