const fileInput = document.getElementById("fileInput");
const chooseBtn = document.getElementById("chooseBtn");
const dropZone = document.getElementById("dropZone");

const editor = document.getElementById("editor");

const originalImage = document.getElementById("originalImage");
const vectorPreview = document.getElementById("vectorPreview");

const convertBtn = document.getElementById("convertBtn");

const downloadSvgBtn =
    document.getElementById("downloadSvgBtn");

const downloadPngBtn =
    document.getElementById("downloadPngBtn");

const resetBtn =
    document.getElementById("resetBtn");

const status =
    document.getElementById("status");

const colorCount =
    document.getElementById("colorCount");

const colorValue =
    document.getElementById("colorValue");

const detailLevel =
    document.getElementById("detailLevel");

const tileSize =
    document.getElementById("tileSize");


let currentImage = null;
let currentSvg = null;


/* -----------------------------
   Choose Image
----------------------------- */

chooseBtn.addEventListener("click", () => {
    fileInput.click();
});


fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (file) {
        loadImage(file);
    }

});


/* -----------------------------
   Drag & Drop
----------------------------- */

dropZone.addEventListener("dragover", (event) => {

    event.preventDefault();

    dropZone.classList.add("dragover");

});


dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");

});


dropZone.addEventListener("drop", (event) => {

    event.preventDefault();

    dropZone.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
        loadImage(file);
    }

});


/* -----------------------------
   Load Image
----------------------------- */

function loadImage(file) {

    const reader = new FileReader();

    reader.onload = function(event) {

        originalImage.src = event.target.result;

        currentImage = event.target.result;

        editor.classList.remove("hidden");

        vectorPreview.innerHTML =
            "<span>Click Convert to Vector</span>";

        currentSvg = null;

        downloadSvgBtn.disabled = true;
        downloadPngBtn.disabled = true;

        status.textContent =
            "Image loaded. Ready to convert.";

    };

    reader.readAsDataURL(file);

}


/* -----------------------------
   Color slider
----------------------------- */

colorCount.addEventListener("input", () => {

    colorValue.textContent =
        colorCount.value;

});


/* -----------------------------
   Convert to Vector
----------------------------- */

convertBtn.addEventListener("click", () => {

    if (!currentImage) {

        status.textContent =
            "Please upload an image first.";

        return;
    }


    status.textContent =
        "Converting image to vector...";

    convertBtn.disabled = true;


    const colors =
        parseInt(colorCount.value);


    let pathomit = 8;

    if (detailLevel.value === "low") {
        pathomit = 20;
    }

    if (detailLevel.value === "medium") {
        pathomit = 8;
    }

    if (detailLevel.value === "high") {
        pathomit = 2;
    }


    const options = {

        ltres: 1,
        qtres: 1,

        pathomit: pathomit,

        numberofcolors: colors,

        colorsampling: 2,

        strokewidth: 0,

        blurradius: 0,

        blurdelta: 20

    };


    ImageTracer.imageToSVG(

        currentImage,

        function(svg) {

            currentSvg = svg;

            showVector(svg);

            downloadSvgBtn.disabled = false;

            downloadPngBtn.disabled = false;

            convertBtn.disabled = false;

            status.textContent =
                "Vector conversion completed.";

        },

        options

    );

});


/* -----------------------------
   Show Vector
----------------------------- */

function showVector(svg) {

    let finalSvg = svg;


    const repeat =
        tileSize.value;


    if (repeat !== "none") {

        finalSvg =
            createRepeatPattern(svg, repeat);

    }


    vectorPreview.innerHTML =
        finalSvg;

}


/* -----------------------------
   Textile Repeat
----------------------------- */

function createRepeatPattern(svg, repeat) {

    const parser =
        new DOMParser();

    const doc =
        parser.parseFromString(
            svg,
            "image/svg+xml"
        );


    const original =
        doc.documentElement;


    const width =
        original.getAttribute("width");

    const height =
        original.getAttribute("height");


    let copies = "";


    const n =
        parseInt(repeat);


    for (let y = 0; y < n; y++) {

        for (let x = 0; x < n; x++) {

            copies += `
                <g transform="translate(${x * 100}, ${y * 100})">
                    ${original.innerHTML}
                </g>
            `;

        }

    }


    return `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 ${n * 100} ${n * 100}"
            width="${width || "500"}"
            height="${height || "500"}"
        >
            ${copies}
        </svg>
    `;

}


/* -----------------------------
   Download SVG
----------------------------- */

downloadSvgBtn.addEventListener(
    "click",
    () => {

        if (!currentSvg) {
            return;
        }


        const blob =
            new Blob(
                [currentSvg],
                {
                    type:
                        "image/svg+xml"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "textile-vector.svg";


        link.click();


        URL.revokeObjectURL(url);

    }
);


/* -----------------------------
   Download PNG
----------------------------- */

downloadPngBtn.addEventListener(
    "click",
    () => {

        if (!currentSvg) {
            return;
        }


        const svgBlob =
            new Blob(
                [currentSvg],
                {
                    type:
                        "image/svg+xml"
                }
            );


        const url =
            URL.createObjectURL(svgBlob);


        const img =
            new Image();


        img.onload = function() {

            const canvas =
                document.createElement("canvas");


            canvas.width =
                img.width || 1000;

            canvas.height =
                img.height || 1000;


            const ctx =
                canvas.getContext("2d");


            ctx.drawImage(
                img,
                0,
                0
            );


            canvas.toBlob(
                function(blob) {

                    const png
