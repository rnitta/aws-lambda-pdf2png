// https://github.com/mozilla/pdf.js/tree/master/examples/node/pdf2png

const assert = require('assert').strict;
const Canvas = require('canvas');

class NodeCanvasFactory {
  constructor() {
    this.create = (width, height) => {
      assert(width > 0 && height > 0, 'Invalid canvas size');
      var canvas = Canvas.createCanvas(width, height);
      var context = canvas.getContext('2d');
      return {
        canvas: canvas,
        context: context,
      };
    };
    this.reset = (canvasAndContext, width, height) => {
      assert(canvasAndContext.canvas, 'Canvas is not specified');
      assert(width > 0 && height > 0, 'Invalid canvas size');
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    };
    this.destroy = (canvasAndContext) => {
      assert(canvasAndContext.canvas, 'Canvas is not specified');

      // Zeroing the width and height cause Firefox to release graphics
      // resources immediately, which can greatly reduce memory consumption.
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
      canvasAndContext.canvas = null;
      canvasAndContext.context = null;
    };
  }
}

module.exports = { NodeCanvasFactory };
