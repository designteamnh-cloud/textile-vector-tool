/* =====================================================
   TEXTILE VECTOR STUDIO
   PHOTO → SVG VECTOR
===================================================== */


/* =====================================================
   ELEMENTS
===================================================== */

const fileInput =
    document.getElementById("fileInput");

const browseBtn =
    document.getElementById("browseBtn");

const dropZone =
    document.getElementById("dropZone");

const vectorizeBtn =
    document.getElementById("vectorizeBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const resetBtn =
    document.getElementById("resetBtn");

const originalPreview =
    document.getElementById("originalPreview");

const vectorPreview =
    document.getElementById("vectorPreview");

const fileInfo =
    document.getElementById("fileInfo");

const originalSize =
    document.getElementById("originalSize");

const vectorSize =
    document.getElementById("vectorSize");

const processingStatus =
    document.getElementById("processingStatus");

const progressContainer =
    document.getElementById("progressContainer");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");

const colorCount =
    document.getElementById("colorCount");

const colorValue =
    document.getElementById("colorValue");

const detail =
    document.getElementById("detail");

const detailValue =
    document.getElementById("detailValue");

const simplify =
    document.getElementById("simplify");

const simplifyValue =
    document.getElementById("simplifyValue");


/* =====================================================
   STATE
===================================================== */

let currentFile = null;

let currentImageDataURL = null;

let currentSVG = null;

let vectorMode = "color";


/* =====================================================
   RANGE CONTROLS
===================================================== */

colorCount.addEventListener(
    "input",
    () => {

        colorValue.textContent =
            colorCount.value;

    }
);


detail.addEventListener(
    "input",
    () => {

        detailValue.textContent =
            detail.value;

    }
);


simplify.addEventListener(
    "input",
    () => {

        simplifyValue.textContent =
            simplify.value;

    }
);


/* =====================================================
   BROWSE
===================================================== */

browseBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        fileInput.click();

    }
);


dropZone.addEventListener(
    "click",
    () => {

        fileInput.click();

    }
);


fileInput.addEventListener(
    "change",
    (event) => {

        const file =
            event.target.files[0];

        if (file) {

            loadImage(file);

        }

    }
);


/* =====================================================
   DRAG & DROP
===================================================== */

[
    "dragenter",
    "dragover"
].forEach(
    eventName => {

        dropZone.addEventListener(
            eventName,
            event => {

                event.preventDefault();

                dropZone.classList.add(
                    "dragover"
                );

            }
        );

    }
);


[
    "dragleave",
    "drop"
].forEach(
    eventName => {

        dropZone.addEventListener(
            eventName,
            event => {

                event.preventDefault();

                dropZone.classList.remove(
                    "dragover"
                );

            }
        );

    }
);


dropZone.addEventListener(
    "drop",
    event => {

        const file =
            event.dataTransfer.files[0];

        if (!file) return;

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            showStatus(
                "Invalid file",
                true
            );

            return;

        }

        loadImage(file);

    }
);


/* =====================================================
   LOAD IMAGE
===================================================== */

function loadImage(file) {

    const maxSize =
        20 * 1024 * 1024;

    if (file.size > maxSize) {

        alert(
            "File is larger than 20 MB."
        );

        return;

    }


    currentFile = file;

    currentSVG = null;


    const reader =
        new FileReader();


    reader.onload = function(event) {

        currentImageDataURL =
            event.target.result;


        const img =
            new Image();


        img.onload = function() {

            originalPreview.classList.remove(
                "empty"
            );


            originalPreview.innerHTML = "";


            const previewImage =
                document.createElement("img");


            previewImage.src =
                currentImageDataURL;


            originalPreview.appendChild(
                previewImage
            );


            originalSize.textContent =
                `${img.width} × ${img.height}`;


            fileInfo.textContent =
                `${file.name} · ${formatBytes(file.size)}`;


            vectorPreview.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ◇
                    </div>

                    <p>
                        Ready to convert
                    </p>

                </div>

            `;


            vectorPreview.classList.add(
                "empty"
            );


            vectorSize.textContent = "—";


            vectorizeBtn.disabled =
                false;


            downloadBtn.disabled =
                true;


            showStatus(
                "Image ready"
            );

        };


        img.src =
            currentImageDataURL;

    };


    reader.readAsDataURL(file);

}


/* =====================================================
   VECTOR MODE
===================================================== */

const modeButtons =
    document.querySelectorAll(
        ".mode-button"
    );


modeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                modeButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                vectorMode =
                    button.dataset.mode;

            }
        );

    }
);


/* =====================================================
   VECTORIZE
===================================================== */

vectorizeBtn.addEventListener(
    "click",
    convertToVector
);


function convertToVector() {

    if (!currentImageDataURL) {

        return;

    }


    if (
        typeof ImageTracer ===
        "undefined"
    ) {

        alert(
            "Vector engine could not be loaded. Please check your internet connection."
        );

        return;

    }


    vectorizeBtn.disabled =
        true;


    downloadBtn.disabled =
        true;


    progressContainer.classList.remove(
        "hidden"
    );


    setProgress(
        10
    );


    showStatus(
        "Processing..."
    );


    /*
     * ImageTracer settings
     *
     * Color quantity controls
     * number of colors.
     */

    let colors =
        Number(
            colorCount.value
        );


    let detailLevel =
        Number(
            detail.value
        );


    let simplifyLevel =
        Number(
            simplify.value
        );


    let ltoptions = {

        corsenabled: false,

        colorsampling: 2,

        numberofcolors:
            colors,

        mincolorratio: 0,

        colorquantcycles: 3,

        strokewidth: 0,

        linefilter: false,

        pathomit:
            Math.max(
                0,
                8 -
                detailLevel
            ),

        roundcoords:
            Math.max(
                1,
                4 -
                Math.floor(
                    simplifyLevel / 3
                )
            ),

        blurradius:
            0,

        blurdelta:
            20,

        ltres:
            1,

        qtres:
            1,

        rightangleenhance:
            true,

        layering:
            0

    };


    /*
     * Black & White mode
     */

    if (
        vectorMode === "bw"
    ) {

        ltoptions.numberofcolors =
            2;

        ltoptions.colorsampling =
            0;

    }


    /*
     * Progress animation
     */

    let progress = 15;


    const progressTimer =
        setInterval(
            () => {

                progress +=
                    Math.random() * 8;

                if (
                    progress > 90
                ) {

                    progress = 90;

                }

                setProgress(
                    Math.round(
                        progress
                    )
                );

            },
            180
        );


    /*
     * Convert
     */

    setTimeout(
        () => {

            try {

                ImageTracer.imageToSVG(
                    currentImageDataURL,
                    function(svgString) {

                        clearInterval(
                            progressTimer
                        );


                        currentSVG =
                            svgString;


                        setProgress(
                            100
                        );


                        displaySVG(
                            svgString
                        );


                        vectorizeBtn.disabled =
                            false;


                        downloadBtn.disabled =
                            false;


                        showStatus(
                            "Vector ready"
                        );


                        setTimeout(
                            () => {

                                progressContainer.classList.add(
                                    "hidden"
                                );

                            },
                            500
                        );

                    },
                    ltoptions
                );

            }

            catch(error) {

                clearInterval(
                    progressTimer
                );


                console.error(
                    error
                );


                vectorizeBtn.disabled =
                    false;


                showStatus(
                    "Conversion failed",
                    true
                );


                alert(
                    "Vector conversion failed. Try using a smaller image or lower detail."
                );

            }

        },
        250
    );

}


/* =====================================================
   DISPLAY SVG
===================================================== */

function displaySVG(svgString) {

    vectorPreview.classList.remove(
        "empty"
    );


    vectorPreview.innerHTML =
        svgString;


    const svg =
        vectorPreview.querySelector(
            "svg"
        );


    if (svg) {

        svg.style.maxWidth =
            "94%";

        svg.style.maxHeight =
            "94%";

        svg.style.width =
            "auto";

        svg.style.height =
            "auto";

    }


    /*
     * Calculate SVG size
     */

    const bytes =
        new Blob(
            [svgString],
            {
                type:
                    "image/svg+xml"
            }
        ).size;


    vectorSize.textContent =
        formatBytes(bytes);

}


/* =====================================================
   DOWNLOAD SVG
===================================================== */

downloadBtn.addEventListener(
    "click",
    downloadSVG
);


function downloadSVG() {

    if (!currentSVG) {

        return;

    }


    const blob =
        new Blob(
            [currentSVG],
            {
                type:
                    "image/svg+xml;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const originalName =
        currentFile
            ? currentFile.name
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
            : "textile-vector";


    link.href =
        url;


    link.download =
        `${originalName}-vector.svg`;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =====================================================
   RESET
===================================================== */

resetBtn.addEventListener(
    "click",
    resetApp
);


function resetApp() {

    currentFile =
        null;

    currentImageDataURL =
        null;

    currentSVG =
        null;


    fileInput.value =
        "";


    originalPreview.classList.add(
        "empty"
    );


    originalPreview.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                +
            </div>

            <p>
                Upload an image
            </p>

        </div>

    `;


    vectorPreview.classList.add(
        "empty"
    );


    vectorPreview.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                ◇
            </div>

            <p>
                Vector preview will appear here
            </p>

        </div>

    `;


    fileInfo.textContent =
        "No image uploaded";


    originalSize.textContent =
        "—";


    vectorSize.textContent =
        "—";


    vectorizeBtn.disabled =
        true;


    downloadBtn.disabled =
        true;


    progressContainer.classList.add(
        "hidden"
    );


    showStatus(
        "Ready"
    );

}


/* =====================================================
   STATUS
===================================================== */

function showStatus(
    message,
    error = false
) {

    processingStatus.textContent =
        message;


    if (error) {

        processingStatus.style.background =
            "#fff0f0";

        processingStatus.style.color =
            "#c0392b";

    }

    else {

        processingStatus.style.background =
            "#f1f2f4";

        processingStatus.style.color =
            "#62666d";

    }

}


/* =====================================================
   PROGRESS
===================================================== */

function setProgress(
    value
) {

    progressBar.style.width =
        `${value}%`;


    progressText.textContent =
        `${value}%`;

}


/* =====================================================
   FILE SIZE
===================================================== */

function formatBytes(
    bytes
) {

    if (
        bytes === 0
    ) {

        return "0 B";

    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(2)
        )
        +
        " " +
        units[index]
    );

}
