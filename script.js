/* =========================================================
   TEXTILE VECTOR STUDIO
   PHOTO -> CLEAN VECTOR -> TEXTILE REPEAT
========================================================= */

const photoInput = document.getElementById("photoInput");

const mainCanvas = document.getElementById("mainCanvas");
const ctx = mainCanvas.getContext("2d", {
  willReadFrequently: true
});

const canvasWrapper =
  document.getElementById("canvasWrapper");
function createVector() {

  if (!sourceCanvas) {

    alert("Please upload a photo first.");
    return;
  }

  setStatus("Creating clean vector paths...");

  const maxVectorSize = 260;

  let width = sourceCanvas.width;
  let height = sourceCanvas.height;

  const scale = Math.min(
    1,
    maxVectorSize / Math.max(width, height)
  );

  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const small = document.createElement("canvas");

  small.width = width;
  small.height = height;

  const sc = small.getContext("2d", {
    willReadFrequently: true
  });

  sc.imageSmoothingEnabled = true;

  sc.drawImage(
    sourceCanvas,
    0,
    0,
    width,
    height
  );

  const imageData = sc.getImageData(
    0,
    0,
    width,
    height
  );

  const pixels = imageData.data;

  const palette = getPalette(
    pixels,
    settings.colorCount
  );

  /*
    Create quantized raster preview.
  */

  const output = document.createElement("canvas");

  output.width = width;
  output.height = height;

  const oc = output.getContext("2d");

  const outputData = oc.createImageData(
    width,
    height
  );

  const out = outputData.data;

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

        out[index + 3] = 0;
        continue;
      }

      const nearest =
        findNearestColor(
          pixels[index],
          pixels[index + 1],
          pixels[index + 2],
          palette
        );

      out[index] = nearest[0];
      out[index + 1] = nearest[1];
      out[index + 2] = nearest[2];
      out[index + 3] = 255;
    }
  }

  oc.putImageData(
    outputData,
    0,
    0
  );

  /*
    Keep raster preview.
  */

  vectorCanvas = output;

  /*
    IMPORTANT:
    Convert color regions into
    real SVG paths.
  */

  vectorPaths = traceColorPaths(
    output,
    palette
  );

  /*
    Create real SVG path document.
  */

  vectorSvg = pathsToSvg(
    vectorPaths,
    width,
    height
  );

  vectorized = true;

  drawVectorToMainCanvas();

  vectorStatus.textContent =
    "Vector Ready";

  vectorStatus.style.color =
    "#55d69b";

  setStatus(
    `${vectorPaths.length} vector paths created`
  );

  updatePatternPreview();

  updateInfoPanel();
}/* =========================================================
   TRUE COLOR REGION VECTOR TRACING
   Pixel regions -> Boundary paths -> SVG paths
========================================================= */

function traceColorPaths(
  canvas,
  palette
) {

  const ctx =
    canvas.getContext("2d", {
      willReadFrequently: true
    });

  const width =
    canvas.width;

  const height =
    canvas.height;

  const data =
    ctx.getImageData(
      0,
      0,
      width,
      height
    ).data;

  const paths = [];


  /*
    Trace each palette color separately.
  */

  palette.forEach(color => {

    const mask =
      createColorMask(
        data,
        width,
        height,
        color
      );


    /*
      Remove very small areas.
      This keeps textile vectors cleaner.
    */

    removeSmallComponents(
      mask,
      width,
      height,
      getMinimumRegionSize()
    );


    /*
      Convert region boundaries
      into closed polygon paths.
    */

    const polygons =
      maskToPolygons(
        mask,
        width,
        height
      );


    polygons.forEach(
      polygon => {

        if (
          polygon.length < 3
        ) {
          return;
        }


        /*
          Simplify the polygon.
        */

        const tolerance =
          getVectorTolerance();


        let simplified =
          simplifyPolygon(
            polygon,
            tolerance
          );


        if (
          simplified.length < 3
        ) {
          return;
        }


        /*
          Remove tiny polygons.
        */

        const area =
          Math.abs(
            polygonArea(
              simplified
            )
          );


        if (
          area < getMinimumRegionSize()
        ) {
          return;
        }


        paths.push({

          color: color,

          points: simplified,

          area: area
        });

      }
    );

  });


  /*
    Largest areas first.
  */

  paths.sort(
    (a, b) =>
      b.area - a.area
  );


  return paths;
}


/* =========================================================
   COLOR MASK
========================================================= */

function createColorMask(
  data,
  width,
  height,
  color
) {

  const mask =
    new Uint8Array(
      width * height
    );


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

      const i =
        (y * width + x) * 4;

      const pixelR =
        data[i];

      const pixelG =
        data[i + 1];

      const pixelB =
        data[i + 2];

      const pixelA =
        data[i + 3];


      if (
        pixelA > 20 &&
        pixelR === color[0] &&
        pixelG === color[1] &&
        pixelB === color[2]
      ) {

        mask[
          y * width + x
        ] = 1;

      }

    }
  }


  return mask;
}


/* =========================================================
   MINIMUM REGION SIZE
========================================================= */

function getMinimumRegionSize() {

  const detailValue =
    Number(settings.detail);

  /*
    Higher detail =
    smaller regions allowed.
  */

  return Math.max(
    2,
    Math.round(
      35 -
      detailValue * 0.32
    )
  );
}


/* =========================================================
   VECTOR TOLERANCE
========================================================= */

function getVectorTolerance() {

  const smooth =
    Number(settings.smoothness);

  /*
    Higher smoothness =
    more aggressive simplification.
  */

  return Math.max(
    0.35,
    1 +
    smooth * 0.055
  );
}


/* =========================================================
   REMOVE SMALL CONNECTED COMPONENTS
========================================================= */

function removeSmallComponents(
  mask,
  width,
  height,
  minimumSize
) {

  const visited =
    new Uint8Array(
      width * height
    );


  const neighbors = [

    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]

  ];


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

      const start =
        y * width + x;


      if (
        !mask[start] ||
        visited[start]
      ) {
        continue;
      }


      const queue = [start];

      const component = [];

      visited[start] = 1;


      while (
        queue.length
      ) {

        const index =
          queue.pop();

        component.push(index);


        const cx =
          index % width;

        const cy =
          Math.floor(
            index / width
          );


        neighbors.forEach(
          ([dx, dy]) => {

            const nx =
              cx + dx;

            const ny =
              cy + dy;


            if (
              nx < 0 ||
              nx >= width ||
              ny < 0 ||
              ny >= height
            ) {
              return;
            }


            const ni =
              ny * width + nx;


            if (
              mask[ni] &&
              !visited[ni]
            ) {

              visited[ni] = 1;

              queue.push(ni);

            }

          }
        );

      }


      if (
        component.length <
        minimumSize
      ) {

        component.forEach(
          index => {
            mask[index] = 0;
          }
        );

      }

    }
  }
}


/* =========================================================
   MASK -> POLYGONS
========================================================= */

function maskToPolygons(
  mask,
  width,
  height
) {

  const edges = [];


  /*
    Every colored pixel contributes
    only the edges touching empty space.
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
        y * width + x;


      if (!mask[index]) {
        continue;
      }


      const top =
        y === 0 ||
        !mask[
          (y - 1) * width + x
        ];


      const right =
        x === width - 1 ||
        !mask[
          y * width + x + 1
        ];


      const bottom =
        y === height - 1 ||
        !mask[
          (y + 1) * width + x
        ];


      const left =
        x === 0 ||
        !mask[
          y * width + x - 1
        ];


      /*
        Clockwise edge directions.
      */

      if (top) {

        edges.push({

          start: [x, y],

          end: [x + 1, y]

        });

      }


      if (right) {

        edges.push({

          start: [x + 1, y],

          end: [x + 1, y + 1]

        });

      }


      if (bottom) {

        edges.push({

          start: [x + 1, y + 1],

          end: [x, y + 1]

        });

      }


      if (left) {

        edges.push({

          start: [x, y + 1],

          end: [x, y]

        });

      }

    }
  }


  return connectEdges(
    edges
  );
}


/* =========================================================
   CONNECT BOUNDARY EDGES
========================================================= */

function connectEdges(edges) {

  const polygons = [];

  const edgeMap = new Map();


  edges.forEach(
    (edge, index) => {

      const key =
        pointKey(
          edge.start
        );


      if (!edgeMap.has(key)) {

        edgeMap.set(
          key,
          []
        );

      }


      edgeMap.get(key).push(
        index
      );

    }
  );


  const used =
    new Uint8Array(
      edges.length
    );


  for (
    let i = 0;
    i < edges.length;
    i++
  ) {

    if (used[i]) {
      continue;
    }


    const polygon = [];

    let currentIndex = i;

    let safety = 0;


    while (
      safety++ <
      edges.length + 10
    ) {

      if (
        used[currentIndex]
      ) {
        break;
      }


      const edge =
        edges[currentIndex];


      used[currentIndex] = 1;


      if (
        polygon.length === 0
      ) {

        polygon.push(
          edge.start
        );

      }


      polygon.push(
        edge.end
      );


      const nextKey =
        pointKey(
          edge.end
        );


      const candidates =
        edgeMap.get(
          nextKey
        ) || [];


      let nextIndex = -1;


      for (
        const candidate
        of candidates
      ) {

        if (
          !used[candidate]
        ) {

          nextIndex =
            candidate;

          break;
        }

      }


      if (
        nextIndex === -1
      ) {
        break;
      }


      currentIndex =
        nextIndex;


      if (
        pointsEqual(
          edges[currentIndex].start,
          polygon[0]
        )
      ) {
        continue;
      }

    }


    if (
      polygon.length >= 4
    ) {

      /*
        Remove duplicated final point.
      */

      if (
        pointsEqual(
          polygon[0],
          polygon[
            polygon.length - 1
          ]
        )
      ) {

        polygon.pop();

      }


      polygons.push(
        polygon
      );

    }

  }


  return polygons;
}


/* =========================================================
   POINT UTILITIES
========================================================= */

function pointKey(point) {

  return `${point[0]},${point[1]}`;
}


function pointsEqual(a, b) {

  return (
    a[0] === b[0] &&
    a[1] === b[1]
  );
}


/* =========================================================
   RDP POLYGON SIMPLIFICATION
========================================================= */

function simplifyPolygon(
  points,
  tolerance
) {

  if (
    points.length <= 3
  ) {

    return points.slice();
  }


  /*
    First simplify open polyline.
  */

  const closed =
    points.concat([
      points[0]
    ]);


  const simplified =
    simplifyRDP(
      closed,
      tolerance
    );


  /*
    Remove duplicated closing point.
  */

  if (
    simplified.length > 1 &&
    pointsEqual(
      simplified[0],
      simplified[
        simplified.length - 1
      ]
    )
  ) {

    simplified.pop();

  }


  return simplified;
}


function simplifyRDP(
  points,
  epsilon
) {

  if (
    points.length < 3
  ) {

    return points.slice();
  }


  let maxDistance = 0;

  let index = 0;


  const first =
    points[0];

  const last =
    points[
      points.length - 1
    ];


  for (
    let i = 1;
    i < points.length - 1;
    i++
  ) {

    const distance =
      perpendicularDistance(
        points[i],
        first,
        last
      );


    if (
      distance >
      maxDistance
    ) {

      index = i;

      maxDistance =
        distance;

    }

  }


  if (
    maxDistance > epsilon
  ) {

    const left =
      simplifyRDP(
        points.slice(
          0,
          index + 1
        ),
        epsilon
      );


    const right =
      simplifyRDP(
        points.slice(
          index
        ),
        epsilon
      );


    return left
      .slice(0, -1)
      .concat(right);

  }


  return [
    first,
    last
  ];
}


function perpendicularDistance(
  point,
  lineStart,
  lineEnd
) {

  const x =
    point[0];

  const y =
    point[1];


  const x1 =
    lineStart[0];

  const y1 =
    lineStart[1];


  const x2 =
    lineEnd[0];

  const y2 =
    lineEnd[1];


  const dx =
    x2 - x1;

  const dy =
    y2 - y1;


  if (
    dx === 0 &&
    dy === 0
  ) {

    return Math.sqrt(
      Math.pow(x - x1, 2) +
      Math.pow(y - y1, 2)
    );
  }


  const t =
    (
      (x - x1) * dx +
      (y - y1) * dy
    )
    /
    (dx * dx + dy * dy);


  const clamped =
    Math.max(
      0,
      Math.min(
        1,
        t
      )
    );


  const px =
    x1 + clamped * dx;

  const py =
    y1 + clamped * dy;


  return Math.sqrt(
    Math.pow(
      x - px,
      2
    ) +
    Math.pow(
      y - py,
      2
    )
  );
}


/* =========================================================
   POLYGON AREA
========================================================= */

function polygonArea(
  points
) {

  let area = 0;


  for (
    let i = 0;
    i < points.length;
    i++
  ) {

    const j =
      (i + 1) %
      points.length;


    area +=
      points[i][0] *
      points[j][1]
      -
      points[j][0] *
      points[i][1];

  }


  return area / 2;
}/* =========================================================
   VECTOR PATHS -> SVG
========================================================= */

function pathsToSvg(
  paths,
  width,
  height
) {

  const svgParts = [];


  svgParts.push(
`<svg
xmlns="http://www.w3.org/2000/svg"
width="${width}"
height="${height}"
viewBox="0 0 ${width} ${height}">

<g>`
  );


  paths.forEach(
    (path, index) => {

      const color =
        path.color;


      const d =
        polygonToSvgPath(
          path.points
        );


      if (!d) {
        return;
      }


      svgParts.push(
`<path
id="vector-${index + 1}"
d="${d}"
fill="rgb(${color[0]},${color[1]},${color[2]})"
stroke="none"
/>`
      );

    }
  );


  svgParts.push(
`</g>
</svg>`
  );


  return svgParts.join(
    "\n"
  );
}


/* =========================================================
   POLYGON -> SVG PATH
========================================================= */

function polygonToSvgPath(
  points
) {

  if (
    !points ||
    points.length < 3
  ) {

    return "";
  }


  /*
    Smooth mode:
    use quadratic Bézier curves.

    Lower smoothness keeps corners.
    Higher smoothness creates smoother textile shapes.
  */

  if (
    Number(settings.smoothness) >= 35
  ) {

    return polygonToSmoothPath(
      points
    );

  }


  /*
    Clean straight path.
  */

  let d =
    `M ${points[0][0]} ${points[0][1]}`;


  for (
    let i = 1;
    i < points.length;
    i++
  ) {

    d +=
      ` L ${points[i][0]} ${points[i][1]}`;

  }


  d += " Z";


  return d;
}


/* =========================================================
   SMOOTH BEZIER PATH
========================================================= */

function polygonToSmoothPath(
  points
) {

  if (
    points.length < 3
  ) {

    return "";
  }


  /*
    Midpoints between polygon points.
  */

  const midpoints = [];


  for (
    let i = 0;
    i < points.length;
    i++
  ) {

    const next =
      points[
        (i + 1) %
        points.length
      ];


    midpoints.push([

      (
        points[i][0] +
        next[0]
      ) / 2,

      (
        points[i][1] +
        next[1]
      ) / 2

    ]);

  }


  /*
    Start at midpoint of
    final -> first.
  */

  const lastMid =
    midpoints[
      midpoints.length - 1
    ];


  let d =
    `M ${lastMid[0]} ${lastMid[1]}`;


  for (
    let i = 0;
    i < points.length;
    i++
  ) {

    const control =
      points[i];


    const end =
      midpoints[i];


    d +=
      ` Q ${control[0]} ${control[1]} ${end[0]} ${end[1]}`;

  }


  d += " Z";


  return d;
}
