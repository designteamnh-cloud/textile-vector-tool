/* ==================================================
   TEXTILE VECTOR STUDIO
   PHOTO → SVG VECTOR
================================================== */


/* ==================================================
   ELEMENTS
================================================== */

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


/* ==================================================
   APPLICATION STATE
================================================== */

let currentFile = null;

let currentImageDataURL = null;

let currentSVG = null;

let vectorMode = "color";

let progressTimer = null;



/* ==================================================
   CHECK VECTOR ENGINE
================================================== */

window.addEventListener(
    "load",
    function () {

        if (
            typeof ImageTracer === "undefined"
        ) {

            showStatus(
                "Vector engine unavailable",
                true
            );

            console.error(
                "ImageTracerJS failed to load."
            );

        }

    }
);



/* ==================================================
   RANGE CONTROLS
================================================== */

colorCount.addEventListener(
    "input",
    function () {

        colorValue.textContent =
            colorCount.value;

    }
);


detail.addEventListener(
    "input",
    function () {

        detailValue.textContent =
            detail.value;

    }
);


simplify.addEventListener(
    "input",
    function () {

        simplifyValue.textContent =
            simplify.value;

    }
);



/* ==================================================
   BROWSE BUTTON
================================================== */

browseBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        fileInput.click();

    }
);


dropZone.addEventListener(
    "click",
    function (event) {

        if (
            event.target === browseBtn
        ) {

            return;

        }

        fileInput.click();

    }
);


fileInput.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];

        if (file) {

            loadImage(file);

        }

    }
);



/* ==================================================
   DRAG & DROP
================================================== */

dropZone.addEventListener(
    "dragenter",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "dragleave",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );


        const file =
            event.dataTransfer.files[0];


        if (!file) {

            return;

        }


        if (
            !file.type.startsWith("image/")
        ) {

            showStatus(
                "Invalid image file",
                true
            );

            return;

        }


        loadImage(file);

    }
);



/* ==================================================
   LOAD IMAGE
================================================== */

function loadImage(file) {


    /* Maximum file size */

    const maxSize =
        20 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        alert(
            "This image is larger than 20 MB."
        );

        return;

    }


    /* Supported formats */

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Please upload JPG, PNG or WEBP."
        );

        return;

    }


    currentFile =
        file;

    currentSVG =
        null;


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            currentImageDataURL =
                event.target.result;


            const image =
                new Image();


            image.onload =
                function () {

                    displayOriginalImage(
                        image
                    );


                    fileInfo.textContent =
                        `${file.name} · ${formatBytes(file.size)}`;


                    originalSize.textContent =
                        `${image.width} × ${image.height}`;


                    resetVectorPreview();


                    vectorizeBtn.disabled =
                        false;


                    downloadBtn.disabled =
                        true;


                    showStatus(
                        "Image ready"
                    );

                };


            image.onerror =
                function () {

                    showStatus(
                        "Could not read image",
                        true
                    );

                };


            image.src =
                currentImageDataURL;

        };


    reader.onerror =
        function () {

            showStatus(
                "File reading failed",
                true
            );

        };


    reader.readAsDataURL(
        file
    );

}



/* ==================================================
   DISPLAY ORIGINAL
================================================== */

function displayOriginalImage(
    image
) {

    originalPreview.classList.remove(
        "empty"
    );


    originalPreview.innerHTML =
        "";


    const img =
        document.createElement(
            "img"
        );


    img.src =
        image.src;


    img.alt =
        "Uploaded artwork";


    originalPreview.appendChild(
        img
    );

}



/* ==================================================
   VECTOR MODE
================================================== */

const modeButtons =
    document.querySelectorAll(
        ".mode-button"
    );


modeButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                modeButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                vectorMode =
                    button.dataset.mode;


                /*
                 * If an SVG already exists,
                 * require conversion again.
                 */

                if (currentImageDataURL) {

                    downloadBtn.disabled =
                        true;

                    currentSVG =
                        null;

                    resetVectorPreview();

                }

            }
        );

    }
);



/* ==================================================
   CONVERT TO VECTOR
================================================== */

vectorizeBtn.addEventListener(
    "click",
    convertToVector
);


function convertToVector() {


    if (
        !currentImageDataURL
    ) {

        alert(
            "Please upload an image first."
        );

        return;

    }


    if (
        typeof ImageTracer === "undefined"
    ) {

        alert(
            "Vector engine is not loaded. Please refresh the page and try again."
        );

        return;

    }


    vectorizeBtn.disabled =
        true;


    downloadBtn.disabled =
        true;


    showProgress();


    showStatus(
        "Processing..."
    );


    const colors =
        Number(
            colorCount.value
        );


    const detailLevel =
        Number(
            detail.value
        );


    const simplifyLevel =
        Number(
            simplify.value
        );


    /*
     * ImageTracer configuration
     */

    const options = {

        corsenabled:
            false,

        colorsampling:
            2,

        numberofcolors:
            colors,

        mincolorratio:
            0,

        colorquantcycles:
            3,

        strokewidth:
            0,

        linefilter:
            false,

        pathomit:
            Math.max(
                0,
                12 -
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
            Math.max(
                0.5,
                2 -
                detailLevel * 0.12
            ),

        qtres:
            Math.max(
                0.5,
                2 -
                detailLevel * 0.12
            ),

        rightangleenhance:
            true,

        layering:
            0

    };


    /*
     * Black & White
     */

    if (
        vectorMode === "bw"
    ) {

        options.numberofcolors =
            2;

        options.colorsampling =
            0;

    }


    /*
     * Start progress
     */

    startProgressAnimation();


    /*
     * Give browser time to update UI
     */

    setTimeout(
        function () {

            try {

                ImageTracer.imageToSVG(
                    currentImageDataURL,
                    function (svgString) {

                        finishProgress();


                        if (
                            !svgString
                        ) {

                            throw new Error(
                                "SVG generation failed."
                            );

                        }


                        currentSVG =
                            cleanSVG(
                                svgString
                            );


                        displaySVG(
                            currentSVG
                        );


                        vectorizeBtn.disabled =
                            false;


                        downloadBtn.disabled =
                            false;


                        showStatus(
                            "Vector ready"
                        );

                    },
                    options
                );

            }

            catch (error) {

                console.error(
                    "Vectorization error:",
                    error
                );


                finishProgress();


                vectorizeBtn.disabled =
                    false;


                showStatus(
                    "Conversion failed",
                    true
                );


                alert(
                    "Vector conversion failed. Try reducing the image size or lowering the Detail setting."
                );

            }

        },
        200
    );

}



/* ==================================================
   CLEAN SVG
================================================== */

function cleanSVG(
    svgString
) {

    /*
     * Remove unnecessary XML whitespace.
     */

    return svgString
        .replace(
            /<\?xml[\s\S]*?\?>/gi,
            ""
        )
        .trim();

}



/* ==================================================
   DISPLAY SVG
================================================== */

function displaySVG(
    svgString
) {

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

        svg.removeAttribute(
            "width"
        );

        svg.removeAttribute(
            "height"
        );


        svg.style.maxWidth =
            "94%";

        svg.style.maxHeight =
            "94%";

        svg.style.width =
            "auto";

        svg.style.height =
            "auto";

        svg.style.display =
            "block";

    }


    const size =
        new Blob(
            [svgString],
            {
                type:
                    "image/svg+xml"
            }
        ).size;


    vectorSize.textContent =
        formatBytes(size);

}



/* ==================================================
   DOWNLOAD SVG
================================================== */

downloadBtn.addEventListener(
    "click",
    downloadSVG
);


function downloadSVG() {


    if (
        !currentSVG
    ) {

        alert(
            "Please convert the image first."
        );

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


    let fileName =
        "textile-vector";


    if (
        currentFile
    ) {

        fileName =
            currentFile.name
                .replace(
                    /\.[^/.]+$/,
                    ""
                );

    }


    link.href =
        url;


    link.download =
        `${fileName}-vector.svg`;


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



/* ==================================================
   RESET
================================================== */

resetBtn.addEventListener(
    "click",
    resetApplication
);


function resetApplication() {


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

        <div class="empty-content">

            <div class="empty-icon">
                +
            </div>

            <p>
                Upload an image
            </p>

        </div>

    `;


    resetVectorPreview();


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


    finishProgress();


    showStatus(
        "Ready"
    );

}



/* ==================================================
   RESET VECTOR PREVIEW
================================================== */

function resetVectorPreview() {

    vectorPreview.classList.add(
        "empty"
    );


    vectorPreview.innerHTML = `

        <div class="empty-content">

            <div class="empty-icon">
                ◇
            </div>

            <p>
                Vector preview will appear here
            </p>

        </div>

    `;


    vectorSize.textContent =
        "—";

}



/* ==================================================
   STATUS
================================================== */

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



/* ==================================================
   PROGRESS START
================================================== */

function showProgress() {

    progressContainer.classList.remove(
        "hidden"
    );


    progressBar.style.width =
        "5%";


    progressText.textContent =
        "5%";

}



/* ==================================================
   PROGRESS ANIMATION
================================================== */

function startProgressAnimation() {


    let progress =
        5;


    clearInterval(
        progressTimer
    );


    progressTimer =
        setInterval(
            function () {

                progress +=
                    Math.random() * 7;


                if (
                    progress > 92
                ) {

                    progress =
                        92;

                }


                setProgress(
                    Math.round(
                        progress
                    )
                );

            },
            180
        );

}



/* ==================================================
   FINISH PROGRESS
================================================== */

function finishProgress() {


    clearInterval(
        progressTimer
    );


    setProgress(
        100
    );


    setTimeout(
        function () {

            progressContainer.classList.add(
                "hidden"
            );


            setProgress(
                0
            );

        },
        500
    );

}



/* ==================================================
   SET PROGRESS
================================================== */

function setProgress(
    value
) {

    progressBar.style.width =
        `${value}%`;


    progressText.textContent =
        `${value}%`;

}



/* ==================================================
   FILE SIZE
================================================== */

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
