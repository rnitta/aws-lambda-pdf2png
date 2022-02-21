const IMAGE_WIDTH = 800;

const validUrl = require('valid-url');
const fetch = require('node-fetch');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { NodeCanvasFactory } = require('./NodeCanvasFactory');

exports.handler = async (event, context) => {
  console.log(event);
  console.log(context);

  const pdfUrl = event.queryStringParameters ? encodeURI(event.queryStringParameters.url.toString()) : null;

  if (validUrl.isUri(pdfUrl)) {
    const { ok, message } = await generatePng(pdfUrl);
    if (ok) {
      return {
        headers: { 'Content-Type': 'image/png' },
        statusCode: 200,
        body: message,
        isBase64Encoded: true,
      };
    } else {
      return {
        headers: { 'Content-Type': 'text/plain' },
        statusCode: 400,
        body: message,
      };
    }
  } else {
    return {
      headers: { 'Content-Type': 'text/plain' },
      statusCode: 400,
      body: 'You should pass PDF url in `?url=` query params',
    };
  }
};

async function generatePng(pdfPath) {
  if (!pdfPath) {
    throw new Error('PDFを指定してください');
  }

  const CMAP_URL = './node_modules/pdfjs-dist/cmaps/';
  // const CMAP_URL = 'https://mozilla.github.io/pdf.js/web/cmaps/';
  const CMAP_PACKED = true;

  // fetch PDF binary.
  const response = await fetch(pdfPath);
  const data = new Uint8Array(await response.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({
    data: data,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
  });
  try {
    const pdfDocument = await loadingTask.promise;
    const page = await pdfDocument.getPage(1); // only first page is to be converted.
    // Document height and width settings. If it is rotated, then rotate it.
    const { pageWidth, pageHeight } =
      Math.abs(page.rotate) % 180 === 90
        ? {
          pageWidth: page.view[3] - page.view[1],
          pageHeight: page.view[2] - page.view[0],
        }
        : {
          pageWidth: page.view[2] - page.view[0],
          pageHeight: page.view[3] - page.view[1]
        };
    const scale = IMAGE_WIDTH / pageWidth;
    const viewport = page.getViewport({ scale });
    const canvasFactory = new NodeCanvasFactory();
    const canvasAndContext = canvasFactory.create(IMAGE_WIDTH, Math.floor(pageHeight * scale));
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport,
      canvasFactory,
    };

    await page.render(renderContext).promise;
    console.log(canvasAndContext.canvas.toBuffer().toString('base64'));
    return { ok: true, message: canvasAndContext.canvas.toBuffer().toString('base64') };
  } catch (e) {
    console.log(e);
    return { ok: false, message: e };
  }
}
