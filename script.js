/* =========================================================
   TEXTILE VECTOR STUDIO
   PHOTO -> CLEAN VECTOR -> TEXTILE REPEAT
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const photoInput = document.getElementById("photoInput");

const mainCanvas = document.getElementById("mainCanvas");
const ctx = mainCanvas.getContext("2d", {
  willReadFrequently: true
});

const canvasWrapper =
  document.getElementById("canvasWrapper");

const canvasArea =
  document.getElementById("canvasArea");

const emptyState =
  document.getElementById("emptyState");

const patternPreview =
  document.getElementById("patternPreview");

const fileName =
  document.getElementById("fileName");

const statusText =
  document.getElementById("statusText");

const imageInfo =
  document.getElementById("imageInfo");

const vectorStatus =
  document.getElementById("vectorStatus");


/* =========================================================
   CONTROLS
========================================================= */

const brightness =
  document.getElementById("brightness");

const contrast =
  document.getElementById("contrast");

const detail =
  document.getElementById("detail");

const smoothness =
  document.getElementById("smoothness");

const colorCount =
  document.getElementById("colorCount");

const colorMode =
  document.getElementById("colorMode");

const repeatType =
  document.getElementById("repeatType");


const brightnessValue =
  document.getElementById("brightnessValue");

const contrastValue =
  document.getElementById("contrastValue");

const detailValue =
  document.getElementById("detailValue");

const smoothnessValue =
  document.getElementById("smoothnessValue");

const colorCountValue =
  document.getElementById("colorCountValue");


/* =========================================================
   BUTTONS
========================================================= */

const removeBgBtn =
  document.getElementById("removeBgBtn");

const cropBtn =
  document.getElementById("cropBtn");

const rotateLeftBtn =
  document.getElementById("rotateLeftBtn");

const rotateRightBtn =
  document.getElementById("rotateRightBtn");

const vectorizeBtn =
  document.getElementById("vectorizeBtn");

const resetBtn =
  document.getElementById("resetBtn");

const saveProjectBtn =
  document.getElementById("saveProjectBtn");

const downloadSvgBtn =
  document.getElementById("downloadSvgBtn");

const downloadPngBtn =
  document.getElementById("downloadPngBtn");

const downloadDxfBtn =
  document.getElementById("downloadDxfBtn");

const printPdfBtn =
  document.getElementById("printPdfBtn");

const highResBtn =
  document.getElementById("highResBtn");


/* =========================================================
   VIEW BUTTONS
========================================================= */

const originalTab =
  document.getElementById("originalTab");

const vectorTab =
  document.getElementById("vectorTab");

const patternTab =
  document.getElementById("patternTab");

const zoomInBtn =
  document.getElementById("zoomInBtn");

const zoomOutBtn =
  document.getElementById("zoomOutBtn");

const fitBtn =
  document.getElementById("fitBtn");

const gridBtn =
  document.getElementById("gridBtn");

const panBtn =
  document.getElementById("panBtn");

const zoomValue =
  document.getElementById("zoomValue");

const gridOverlay =
  document.getElementById("gridOverlay");


/* =========================================================
   STATE
========================================================= */

let originalImage = null;

let sourceCanvas = null;

let vectorCanvas = null;

let vectorSvg = null;

let vectorized = false;

let rotation = 0;

let zoom = 1;

let repeatCount = 2;

let currentView = "original";

let panMode = false;

let backgroundRemoved = false;


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

let settings = {

  brightness: 0,

  contrast: 0,

  detail: 50,

  smoothness: 20,

  colorCount: 8,

  colorMode: "rgb",

  repeatType: "straight"
};


/* =========================================================
   UTILITY
========================================================= */

function setStatus(message) {

  statusText.textContent = message;
}


function clamp(value, min, max) {

  return Math.min(
    Math.max(value, min),
    max
  );
}


function downloadBlob(blob, filename) {

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);
}


/* =========================================================
   UPLOAD IMAGE
========================================================= */

photoInput.addEventListener(
  "change",
  handlePhotoUpload
);


function handlePhotoUpload(event) {

  const file =
    event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {

    alert(
      "Please select a JPG, PNG or WebP image."
    );

    return;
  }


  fileName.textContent =
    file.name;


  setStatus(
    "Loading image..."
  );


  const reader =
    new FileReader();


  reader.onload = function(e) {

    const img =
      new Image();


    img.onload = function() {

      originalImage = img;

      rotation = 0;

      vectorized = false;

      vectorCanvas = null;

      vectorSvg = null;

      backgroundRemoved = false;

      sourceCanvas =
        createCanvasFromImage(img);


      drawSourceCanvas();


      emptyState.classList.add(
        "hidden"
      );

      canvasWrapper.classList.remove(
        "hidden"
      );


      updateImageInfo();

      setStatus(
        "Photo loaded successfully"
      );

      vectorStatus.textContent =
        "Not Vectorized";


      updatePatternPreview();

    };


    img.src =
      e.target.result;

  };


  reader.readAsDataURL(file);
}


/* =========================================================
   CREATE SOURCE CANVAS
========================================================= */

function createCanvasFromImage(img) {

  const canvas =
    document.createElement("canvas");

  const maxSize = 1600;

  let width = img.naturalWidth;
  let height = img.naturalHeight;


  if (width > maxSize || height > maxSize) {

    const scale =
      Math.min(
        maxSize / width,
        maxSize / height
      );

    width =
      Math.round(width * scale);

    height =
      Math.round(height * scale);
  }


  canvas.width = width;
  canvas.height = height;


  const c =
    canvas.getContext("2d");

  c.drawImage(
    img,
    0,
    0,
    width,
    height
  );


  return canvas;
}


/* =========================================================
   DRAW SOURCE
========================================================= */

function drawSourceCanvas() {

  if (!sourceCanvas) return;


  mainCanvas.width =
    sourceCanvas.width;

  mainCanvas.height =
    sourceCanvas.height;


  ctx.clearRect(
    0,
    0,
    mainCanvas.width,
    mainCanvas.height
  );


  ctx.drawImage(
    sourceCanvas,
    0,
    0
  );


  applyAdjustments();

  fitCanvas();

  currentView =
    "original";


  setActiveTab(
    originalTab
  );
}


/* =========================================================
   IMAGE ADJUSTMENTS
========================================================= */

brightness.addEventListener(
  "input",
  updateAdjustments
);

contrast.addEventListener(
  "input",
  updateAdjustments
);

detail.addEventListener(
  "input",
  updateAdjustments
);

smoothness.addEventListener(
  "input",
  updateAdjustments
);

colorCount.addEventListener(
  "input",
  updateAdjustments
);

colorMode.addEventListener(
  "change",
  updateAdjustments
);


function updateAdjustments() {

  settings.brightness =
    Number(brightness.value);

  settings.contrast =
    Number(contrast.value);

  settings.detail =
    Number(detail.value);

  settings.smoothness =
    Number(smoothness.value);

  settings.colorCount =
    Number(colorCount.value);

  settings.colorMode =
    colorMode.value;


  brightnessValue.textContent =
    settings.brightness;

  contrastValue.textContent =
    settings.contrast;

  detailValue.textContent =
    settings.detail;

  smoothnessValue.textContent =
    settings.smoothness;

  colorCountValue.textContent =
    settings.colorCount;


  if (
    sourceCanvas &&
    currentView === "original"
  ) {

    drawSourceCanvas();
  }


  updateInfoPanel();
}


/* =========================================================
   APPLY BRIGHTNESS / CONTRAST
========================================================= */

function applyAdjustments() {

  const imageData =
    ctx.getImageData(
      0,
      0,
      mainCanvas.width,
      mainCanvas.height
    );


  const data =
    imageData.data;


  const b =
    settings.brightness * 2.55;


  const contrastFactor =
    (259 *
      (settings.contrast + 255))
    /
    (255 *
      (259 - settings.contrast));


  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {

    data[i] =
      clamp(
        contrastFactor *
          (data[i] - 128)
          + 128
          + b,
        0,
        255
      );

    data[i + 1] =
      clamp(
        contrastFactor *
          (data[i + 1] - 128)
          + 128
          + b,
        0,
        255
      );

    data[i + 2] =
      clamp(
        contrastFactor *
          (data[i + 2] - 128)
          + 128
          + b,
        0,
        255
      );
  }


  ctx.putImageData(
    imageData,
    0,
    0
  );
}


/* =========================================================
   ROTATE
========================================================= */

rotateLeftBtn.addEventListener(
  "click",
  () => rotateImage(-90)
);

rotateRightBtn.addEventListener(
  "click",
  () => rotateImage(90)
);


function rotateImage(degrees) {

  if (!sourceCanvas) {

    alert(
      "Please upload a photo first."
    );

    return;
  }


  rotation =
    (rotation + degrees + 360)
    % 360;


  const oldCanvas =
    sourceCanvas;


  const canvas =
    document.createElement("canvas");


  if (
    Math.abs(rotation) === 90 ||
    Math.abs(rotation) === 270
  ) {

    canvas.width =
      oldCanvas.height;

    canvas.height =
      oldCanvas.width;

  } else {

    canvas.width =
      oldCanvas.width;

    canvas.height =
      oldCanvas.height;
  }


  const c =
    canvas.getContext("2d");


  c.translate(
    canvas.width / 2,
    canvas.height / 2
  );


  c.rotate(
    degrees * Math.PI / 180
  );


  c.drawImage(
    oldCanvas,
    -oldCanvas.width / 2,
    -oldCanvas.height / 2
  );


  sourceCanvas =
    canvas;


  vectorized = false;

  vectorCanvas = null;

  vectorSvg = null;


  drawSourceCanvas();

  setStatus(
    "Image rotated"
  );
}


/* =========================================================
   REMOVE BACKGROUND
========================================================= */

removeBgBtn.addEventListener(
  "click",
  removeBackground
);


function removeBackground() {

  if (!sourceCanvas) {

    alert(
      "Please upload a photo first."
    );

    return;
  }


  setStatus(
    "Removing background..."
  );


  const canvas =
    document.createElement("canvas");

  canvas.width =
    sourceCanvas.width;

  canvas.height =
    sourceCanvas.height;


  const c =
    canvas.getContext("2d");

  c.drawImage(
    sourceCanvas,
    0,
    0
  );


  const imageData =
    c.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );


  const data =
    imageData.data;


  /*
    Estimate background color
    using the four corners.
  */

  const points = [

    0,

    (canvas.width - 1) * 4,

    ((canvas.height - 1) *
      canvas.width) * 4,

    (
      (canvas.height - 1) *
      canvas.width +
      canvas.width - 1
    ) * 4

  ];


  let r = 0;
  let g = 0;
  let b = 0;


  points.forEach(index => {

    r += data[index];
    g += data[index + 1];
    b += data[index + 2];

  });


  r /= points.length;
  g /= points.length;
  b /= points.length;


  const threshold = 55;


  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {

    const distance =
      Math.sqrt(
        Math.pow(data[i] - r, 2) +
        Math.pow(data[i + 1] - g, 2) +
        Math.pow(data[i + 2] - b, 2)
      );


    if (distance < threshold) {

      data[i + 3] = 0;
    }
  }


  c.putImageData(
    imageData,
    0,
    0
  );


  sourceCanvas =
    canvas;

  backgroundRemoved = true;

  vectorized = false;

  vectorCanvas = null;

  vectorSvg = null;


  drawSourceCanvas();


  setStatus(
    "Background removed"
  );
}


/* =========================================================
   CROP
========================================================= */

cropBtn.addEventListener(
  "click",
  cropImage
);


function cropImage() {

  if (!sourceCanvas) {

    alert(
      "Please upload a photo first."
    );

    return;
  }


  const width =
    sourceCanvas.width;

  const height =
    sourceCanvas.height;


  const cropWidth =
    Math.round(width * 0.85);

  const cropHeight =
    Math.round(height * 0.85);


  const x =
    Math.round(
      (width - cropWidth) / 2
    );

  const y =
    Math.round(
      (height - cropHeight) / 2
    );


  const canvas =
    document.createElement("canvas");


  canvas.width =
    cropWidth;

  canvas.height =
    cropHeight;


  const c =
    canvas.getContext("2d");


  c.drawImage(
    sourceCanvas,

    x,
    y,
    cropWidth,
    cropHeight,

    0,
    0,
    cropWidth,
    cropHeight
  );


  sourceCanvas =
    canvas;


  vectorized = false;

  vectorCanvas = null;

  vectorSvg = null;


  drawSourceCanvas();


  setStatus(
    "Centered crop applied"
  );
}


/* =========================================================
   VECTORIZE
========================================================= */

vectorizeBtn.addEventListener(
  "click",
  createVector
);


function createVector() {

  if (!sourceCanvas) {

    alert(
      "Please upload a photo first."
    );

    return;
  }


  setStatus(
    "Creating clean vector..."
  );


  /*
    Reduce working resolution
    for faster browser processing.
  */

  const maxVectorSize = 220;

  let width =
    sourceCanvas.width;

  let height =
    sourceCanvas.height;


  const scale =
    Math.min(
      1,
      maxVectorSize /
      Math.max(width, height)
    );


  width =
    Math.max(
      1,
      Math.round(width * scale)
    );

  height =
    Math.max(
      1,
      Math.round(height * scale)
    );


  const small =
    document.createElement("canvas");

  small.width = width;
  small.height = height;


  const sc =
    small.getContext("2d");

  sc.drawImage(
    sourceCanvas,
    0,
    0,
    width,
    height
  );


  const imageData =
    sc.getImageData(
      0,
      0,
      width,
      height
    );


  const pixels =
    imageData.data;


  const colors =
    getPalette(
      pixels,
      settings.colorCount
    );


  const output =
    document.createElement("canvas");


  output.width =
    width;

  output.height =
    height;


  const oc =
    output.getContext("2d");


  /*
    Pixel quantization
  */

  for (
    let y = 0;
    y < height;
    y++
  ) {

    for (
      let x = 0;
      x < width;
      x++
    ) {

      const index =
        (y * width + x) * 4;


      const alpha =
        pixels[index + 3];


      if (alpha < 30) {

        continue;
      }


      const nearest =
        findNearestColor(
          pixels[index],
          pixels[index + 1],
          pixels[index + 2],
          colors
        );


      oc.fillStyle =
        `rgb(${nearest[0]},${nearest[1]},${nearest[2]})`;


      oc.fillRect(
        x,
        y,
        1,
        1
      );
    }
  }


  /*
    Smooth vector preview
  */

  if (settings.smoothness > 0) {

    smoothCanvas(
      output,
      settings.smoothness
    );
  }


  vectorCanvas =
    output;


  vectorSvg =
    rasterToSvg(
      output,
      settings.colorCount
    );


  vectorized = true;


  drawVectorToMainCanvas();


  vectorStatus.textContent =
    "Vector Ready";


  vectorStatus.style.color =
    "#55d69b";


  setStatus(
    "Clean vector created"
  );


  updatePatternPreview();

  updateInfoPanel();
}


/* =========================================================
   PALETTE
========================================================= */

function getPalette(
  pixels,
  count
) {

  const buckets = new Map();

  const step = 4;


  for (
    let i = 0;
    i < pixels.length;
    i += 4 * step
  ) {

    const r =
      Math.round(pixels[i] / 32) * 32;

    const g =
      Math.round(pixels[i + 1] / 32) * 32;

    const b =
      Math.round(pixels[i + 2] / 32) * 32;


    const key =
      `${r},${g},${b}`;


    buckets.set(
      key,
      (buckets.get(key) || 0) + 1
    );
  }


  const sorted =
    [...buckets.entries()]
      .sort(
        (a, b) => b[1] - a[1]
      )
      .slice(
        0,
        count
      );


  return sorted.map(
    item =>
      item[0]
        .split(",")
        .map(Number)
  );
}


/* =========================================================
   FIND NEAREST COLOR
========================================================= */

function findNearestColor(
  r,
  g,
  b,
  palette
) {

  if (
    settings.colorMode === "bw"
  ) {

    const value =
      (r + g + b) / 3;

    return value > 128
      ? [255,255,255]
      : [0,0,0];
  }


  let nearest =
    palette[0];

  let distance =
    Infinity;


  palette.forEach(color => {

    const d =
      Math.pow(r - color[0], 2) +
      Math.pow(g - color[1], 2) +
      Math.pow(b - color[2], 2);


    if (d < distance) {

      distance = d;

      nearest = color;
    }

  });


  return nearest;
}


/* =========================================================
   SMOOTH VECTOR
========================================================= */

function smoothCanvas(
  canvas,
  amount
) {

  /*
    Light blur before the final vector
    representation.
  */

  const temp =
    document.createElement("canvas");

  temp.width =
    canvas.width;

  temp.height =
    canvas.height;


  const c =
    temp.getContext("2d");


  c.filter =
    `blur(${Math.max(
      0.1,
      amount / 50
    )}px)`;


  c.drawImage(
    canvas,
    0,
    0
  );


  const target =
    canvas.getContext("2d");


  target.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  target.drawImage(
    temp,
    0,
    0
  );
}


/* =========================================================
   RASTER -> SVG
========================================================= */

function rasterToSvg(
  canvas,
  maxColors
) {

  const width =
    canvas.width;

  const height =
    canvas.height;


  const c =
    canvas.getContext("2d");

  const data =
    c.getImageData(
      0,
      0,
      width,
      height
    ).data;


  const rects = [];


  /*
    Run-length encoding.
    This produces a much cleaner SVG
    than one SVG rectangle per pixel.
  */

  for (
    let y = 0;
    y < height;
    y++
  ) {

    let x = 0;


    while (x < width) {

      const start =
        x;


      const index =
        (y * width + x) * 4;


      const r =
        data[index];

      const g =
        data[index + 1];

      const b =
        data[index + 2];

      const a =
        data[index + 3];


      while (
        x + 1 < width
      ) {

        const next =
          (y * width + x + 1) * 4;


        if (
          data[next] !== r ||
          data[next + 1] !== g ||
          data[next + 2] !== b ||
          data[next + 3] !== a
        ) {

          break;
        }


        x++;
      }


      const runWidth =
        x - start + 1;


      if (a > 10) {

        rects.push(
          `<rect x="${start}" y="${y}" width="${runWidth}" height="1" fill="rgb(${r},${g},${b})"/>`
        );
      }


      x++;
    }
  }


  return `
<svg
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
width="${width}"
height="${height}"
viewBox="0 0 ${width} ${height}">

<g shape-rendering="crispEdges">

${rects.join("\n")}

</g>

</svg>
`;
}


/* =========================================================
   DRAW VECTOR
========================================================= */

function drawVectorToMainCanvas() {

  if (!vectorCanvas) return;


  mainCanvas.width =
    vectorCanvas.width;

  mainCanvas.height =
    vectorCanvas.height;


  ctx.clearRect(
    0,
    0,
    mainCanvas.width,
    mainCanvas.height
  );


  ctx.imageSmoothingEnabled =
    false;


  ctx.drawImage(
    vectorCanvas,
    0,
    0
  );


  fitCanvas();


  currentView =
    "vector";


  setActiveTab(
    vectorTab
  );
}


/* =========================================================
   REPEAT PREVIEW
========================================================= */

document
  .querySelectorAll(".repeat-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        repeatCount =
          Number(
            button.dataset.repeat
          );


        document
          .querySelectorAll(".repeat-btn")
          .forEach(btn =>
            btn.classList.remove(
              "active"
            )
          );


        button.classList.add(
          "active"
        );


        updatePatternPreview();

        updateInfoPanel();

      }
    );

  });


repeatType.addEventListener(
  "change",
  () => {

    settings.repeatType =
      repeatType.value;

    updatePatternPreview();

    updateInfoPanel();

  }
);


/* =========================================================
   CREATE REPEAT PREVIEW
========================================================= */

function updatePatternPreview() {

  if (!vectorCanvas) {

    patternPreview.innerHTML = `
      <div class="preview-placeholder">
        Your textile repeat will appear here
      </div>
    `;

    return;
  }


  const previewCanvas =
    document.createElement("canvas");


  const size = 500;

  previewCanvas.width =
    size;

  previewCanvas.height =
    size;


  const pc =
    previewCanvas.getContext("2d");


  pc.clearRect(
    0,
    0,
    size,
    size
  );


  const tileWidth =
    size / repeatCount;

  const tileHeight =
    size / repeatCount;


  for (
    let row = 0;
    row < repeatCount;
    row++
  ) {

    for (
      let col = 0;
      col < repeatCount;
      col++
    ) {

      let x =
        col * tileWidth;

      let y =
        row * tileHeight;


      let drawX =
        x;

      let drawY =
        y;


      /*
        Half Drop
      */

      if (
        settings.repeatType ===
        "halfDrop" &&
        row % 2 === 1
      ) {

        drawX +=
          tileWidth / 2;
      }


      /*
        Brick
      */

      if (
        settings.repeatType ===
        "brick" &&
        row % 2 === 1
      ) {

        drawX +=
          tileWidth / 2;
      }


      /*
        Mirror
      */

      if (
        settings.repeatType ===
        "mirror" &&
        col % 2 === 1
      ) {

        pc.save();

        pc.translate(
          drawX + tileWidth,
          drawY
        );

        pc.scale(-1,1);

        pc.drawImage(
          vectorCanvas,
          0,
          0,
          tileWidth,
          tileHeight
        );

        pc.restore();

        continue;
      }


      /*
        Rotate
      */

      if (
        settings.repeatType ===
        "rotate" &&
        (row + col) % 2 === 1
      ) {

        pc.save();

        pc.translate(
          drawX + tileWidth / 2,
          drawY + tileHeight / 2
        );

        pc.rotate(
          Math.PI
        );

        pc.drawImage(
          vectorCanvas,

          -tileWidth / 2,
          -tileHeight / 2,

          tileWidth,
          tileHeight
        );

        pc.restore();

        continue;
      }


      pc.drawImage(
        vectorCanvas,

        drawX,
        drawY,

        tileWidth,
        tileHeight
      );

    }
  }


  patternPreview.innerHTML = "";

  patternPreview.appendChild(
    previewCanvas
  );
}


/* =========================================================
   VIEW TABS
========================================================= */

originalTab.addEventListener(
  "click",
  () => {

    if (!sourceCanvas) return;

    drawSourceCanvas();

    currentView = "original";

  }
);


vectorTab.addEventListener(
  "click",
  () => {

    if (!vectorCanvas) {

      alert(
        "Create the vector first."
      );

      return;
    }

    drawVectorToMainCanvas();

  }
);


patternTab.addEventListener(
  "click",
  () => {

    if (!vectorCanvas) {

      alert(
        "Create the vector first."
      );

      return;
    }


    updatePatternPreview();

    currentView =
      "pattern";

    setActiveTab(
      patternTab
    );

  }
);


function setActiveTab(active) {

  document
    .querySelectorAll(".view-tab")
    .forEach(tab =>
      tab.classList.remove(
        "active"
      )
    );


  active.classList.add(
    "active"
  );
}


/* =========================================================
   ZOOM
========================================================= */

zoomInBtn.addEventListener(
  "click",
  () => {

    zoom =
      Math.min(
        4,
        zoom + 0.1
      );

    applyZoom();

  }
);


zoomOutBtn.addEventListener(
  "click",
  () => {

    zoom =
      Math.max(
        0.2,
        zoom - 0.1
      );

    applyZoom();

  }
);


fitBtn.addEventListener(
  "click",
  fitCanvas
);


function applyZoom() {

  canvasWrapper.style.transform =
    `scale(${zoom})`;


  zoomValue.textContent =
    `${Math.round(zoom * 100)}%`;
}


function fitCanvas() {

  if (!mainCanvas.width) return;


  const areaWidth =
    canvasArea.clientWidth - 60;

  const areaHeight =
    canvasArea.clientHeight - 60;


  const scale =
    Math.min(
      areaWidth / mainCanvas.width,
      areaHeight / mainCanvas.height,
      1
    );


  zoom =
    Math.max(
      0.2,
      scale
    );


  applyZoom();
}


/* =========================================================
   GRID
========================================================= */

gridBtn.addEventListener(
  "click",
  () => {

    gridOverlay.classList.toggle(
      "visible"
    );

  }
);


/* =========================================================
   PAN
========================================================= */

panBtn.addEventListener(
  "click",
  () => {

    panMode =
      !panMode;


    panBtn.style.background =
      panMode
        ? "rgba(85,184,255,0.14)"
        : "";


    canvasArea.style.cursor =
      panMode
        ? "grab"
        : "";

  }
);


/* =========================================================
   SVG DOWNLOAD
========================================================= */

downloadSvgBtn.addEventListener(
  "click",
  downloadSVG
);


function downloadSVG() {

  if (!vectorSvg) {

    alert(
      "Please create a vector first."
    );

    return;
  }


  const blob =
    new Blob(
      [vectorSvg],
      {
        type:
          "image/svg+xml;charset=utf-8"
      }
    );


  downloadBlob(
    blob,
    "textile-vector-design.svg"
  );


  setStatus(
    "SVG exported"
  );
}


/* =========================================================
   PNG DOWNLOAD
========================================================= */

downloadPngBtn.addEventListener(
  "click",
  () => downloadPNG(false)
);


highResBtn.addEventListener(
  "click",
  () => downloadPNG(true)
);


function downloadPNG(highResolution) {

  if (!vectorCanvas) {

    alert(
      "Please create a vector first."
    );

    return;
  }


  const scale =
    highResolution
      ? 4
      : 1;


  const exportCanvas =
    document.createElement("canvas");


  exportCanvas.width =
    vectorCanvas.width * scale;

  exportCanvas.height =
    vectorCanvas.height * scale;


  const c =
    exportCanvas.getContext("2d");


  c.imageSmoothingEnabled =
    false;


  c.drawImage(
    vectorCanvas,

    0,
    0,

    exportCanvas.width,
    exportCanvas.height
  );


  exportCanvas.toBlob(
    blob => {

      downloadBlob(
        blob,
        highResolution
          ? "textile-vector-high-resolution.png"
          : "textile-vector.png"
      );

    },
    "image/png"
  );


  setStatus(
    highResolution
      ? "High resolution PNG exported"
      : "PNG exported"
  );
}


/* =========================================================
   DXF EXPORT
========================================================= */

downloadDxfBtn.addEventListener(
  "click",
  downloadDXF
);


function downloadDXF() {

  if (!vectorCanvas) {

    alert(
      "Please create a vector first."
    );

    return;
  }


  const dxf =
    createDXF(
      vectorCanvas
    );


  const blob =
    new Blob(
      [dxf],
      {
        type:
          "application/dxf"
      }
    );


  downloadBlob(
    blob,
    "textile-vector-design.dxf"
  );


  setStatus(
    "DXF exported"
  );
}


function createDXF(canvas) {

  const c =
    canvas.getContext("2d");

  const data =
    c.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;


  let output = "";


  output +=
`0
SECTION
2
HEADER
0
ENDSEC
0
SECTION
2
ENTITIES
`;


  /*
    Create lightweight line geometry
    from non-white pixel boundaries.
  */

  const step =
    Math.max(
      1,
      Math.floor(
        220 /
        Math.max(
          canvas.width,
          canvas.height
        )
      )
    );


  for (
    let y = 0;
    y < canvas.height;
    y += step
  ) {

    for (
      let x = 0;
      x < canvas.width;
      x += step
    ) {

      const index =
        (y * canvas.width + x) * 4;


      const r =
        data[index];

      const g =
        data[index + 1];

      const b =
        data[index + 2];


      const brightness =
        (r + g + b) / 3;


      if (brightness < 245) {

        output +=
`0
POINT
8
VECTOR
10
${x}
20
${-y}
30
0
`;
      }
    }
  }


  output +=
`0
ENDSEC
0
EOF
`;


  return output;
}


/* =========================================================
   PDF / PRINT
========================================================= */

printPdfBtn.addEventListener(
  "click",
  printPDF
);


function printPDF() {

  if (!vectorCanvas) {

    alert(
      "Please create a vector first."
    );

    return;
  }


  const dataUrl =
    vectorCanvas.toDataURL(
      "image/png"
    );


  const popup =
    window.open(
      "",
      "_blank"
    );


  if (!popup) {

    alert(
      "Please allow pop-ups for PDF export."
    );

    return;
  }


  popup.document.write(`
    <!DOCTYPE html>

    <html>

    <head>

      <title>
        Textile Vector Design
      </title>

      <style>

        body {
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: white;
        }

        img {
          max-width: 95vw;
          max-height: 95vh;
        }

      </style>

    </head>

    <body>

      <img src="${dataUrl}">

      <script>

        window.onload = function() {

          window.print();

        };

      <\/script>

    </body>

    </html>
  `);


  popup.document.close();

  setStatus(
    "PDF print window opened"
  );
}


/* =========================================================
   RESET
========================================================= */

resetBtn.addEventListener(
  "click",
  resetStudio
);


function resetStudio() {

  originalImage = null;

  sourceCanvas = null;

  vectorCanvas = null;

  vectorSvg = null;

  vectorized = false;

  rotation = 0;

  zoom = 1;

  repeatCount = 2;

  backgroundRemoved = false;


  brightness.value = 0;
  contrast.value = 0;
  detail.value = 50;
  smoothness.value = 20;
  colorCount.value = 8;
  colorMode.value = "rgb";
  repeatType.value = "straight";


  settings = {

    brightness: 0,

    contrast: 0,

    detail: 50,

    smoothness: 20,

    colorCount: 8,

    colorMode: "rgb",

    repeatType: "straight"
  };


  brightnessValue.textContent =
    "0";

  contrastValue.textContent =
    "0";

  detailValue.textContent =
    "50";

  smoothnessValue.textContent =
    "20";

  colorCountValue.textContent =
    "8";


  mainCanvas.width = 1;
  mainCanvas.height = 1;


  canvasWrapper.classList.add(
    "hidden"
  );

  emptyState.classList.remove(
    "hidden"
  );


  fileName.textContent =
    "No image selected";


  imageInfo.textContent =
    "No image";


  vectorStatus.textContent =
    "Not Vectorized";


  vectorStatus.style.color =
    "";


  patternPreview.innerHTML = `
    <div class="preview-placeholder">
      Your textile repeat will appear here
    </div>
  `;


  setStatus(
    "Ready"
  );


  applyZoom();

}


/* =========================================================
   SAVE PROJECT
========================================================= */

saveProjectBtn.addEventListener(
  "click",
  saveProject
);


function saveProject() {

  const project = {

    app:
      "Textile Vector Studio",

    version:
      "1.0",

    settings: settings,

    repeatCount:
      repeatCount,

    rotation:
      rotation,

    backgroundRemoved:
      backgroundRemoved,

    image:
      sourceCanvas
        ? sourceCanvas.toDataURL(
            "image/png"
          )
        : null
  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          project,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  downloadBlob(
    blob,
    "textile-vector-project.json"
  );


  setStatus(
    "Project saved"
  );
}


/* =========================================================
   IMAGE INFORMATION
========================================================= */

function updateImageInfo() {

  if (!sourceCanvas) {

    imageInfo.textContent =
      "No image";

    return;
  }


  imageInfo.textContent =
    `${sourceCanvas.width} × ${sourceCanvas.height}px`;
}


/* =========================================================
   INFO PANEL
========================================================= */

function updateInfoPanel() {

  const infoMode =
    document.getElementById(
      "infoMode"
    );

  const infoColors =
    document.getElementById(
      "infoColors"
    );

  const infoRepeat =
    document.getElementById(
      "infoRepeat"
    );


  if (settings.colorMode === "bw") {

    infoMode.textContent =
      "Black / White";

  } else {

    infoMode.textContent =
      settings.colorMode.toUpperCase();
  }


  infoColors.textContent =
    settings.colorCount;


  infoRepeat.textContent =
    `${repeatCount}×${repeatCount}`;
}


/* =========================================================
   INITIALIZE
========================================================= */

updateAdjustments();

updateInfoPanel();

applyZoom();


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
      Ctrl/Cmd + O
      Upload
    */

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key.toLowerCase() === "o"
    ) {

      event.preventDefault();

      photoInput.click();
    }


    /*
      Ctrl/Cmd + S
    */

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key.toLowerCase() === "s"
    ) {

      event.preventDefault();

      saveProject();
    }


    /*
      + Zoom
    */

    if (
      event.key === "+"
    ) {

      zoom =
        Math.min(
          4,
          zoom + 0.1
        );

      applyZoom();
    }


    /*
      - Zoom
    */

    if (
      event.key === "-"
    ) {

      zoom =
        Math.max(
          0.2,
          zoom - 0.1
        );

      applyZoom();
    }

  }
);


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (sourceCanvas) {

      setTimeout(
        fitCanvas,
        100
      );

    }

  }
);
