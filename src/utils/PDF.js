import { readAsArrayBuffer } from './asyncReader.js';
import { fetchFont, getAsset } from './prepareAssets';
import { noop } from './helper.js';

export async function save(pdfFile, objects, name) {
  const PDFLib = await getAsset('PDFLib');
  const download = await getAsset('download');
  const makeTextPDF = await getAsset('makeTextPDF');

  let pdfDoc;

  console.log("save objects?   " + objects);
  try {
    pdfDoc = await PDFLib.PDFDocument.load(await readAsArrayBuffer(pdfFile));
    console.log(pdfDoc);
  } catch (e) {
    console.log('Failed to load PDF.');
    throw e;
  }
  const pagesProcesses = pdfDoc.getPages().map(async (page, pageIndex) => {
    const pageObjects = objects[pageIndex];
    // 'y' starts from bottom in PDFLib, use this to calculate y
    const pageHeight = page.getHeight();
    const embedProcesses = pageObjects.map(async (object) => {
      if (object.type === 'image') {
        let { file, x, y, width, height } = object;
        let img;
        try {
          if (file.type === 'image/jpeg') {
            img = await pdfDoc.embedJpg(await readAsArrayBuffer(file));
          } else {
            img = await pdfDoc.embedPng(await readAsArrayBuffer(file));
          }
          return () =>
            page.drawImage(img, {
              x,
              y: pageHeight - y - height,
              width,
              height,
            });
        } catch (e) {
          console.log('Failed to embed image.', e);
          return noop;
        }
      } else if (object.type === 'text') {
        
        let { x, y, lines, lineHeight, size, fontFamily, width, fillColor } = object;

        if (fontFamily == "Signture1"){
          console.log("saving signature1 ... " + lineHeight);
          console.log( "lineHeight * 3 " + typeof lineHeight + "* 3 " );
          lineHeight += +lineHeight * +5;
          console.log( "lineHeight * 3 " + typeof lineHeight + "* 3 = " + lineHeight);
          
        }
        if (fontFamily == "Signture2"){
          console.log("saving signature1 ... " + lineHeight);
          console.log( "lineHeight * 3 " + typeof lineHeight + "* 3 " );
          lineHeight += +lineHeight * +3;
          console.log( "lineHeight * 3 " + typeof lineHeight + "* 3 = " + lineHeight);
          
        }
        const height = size * lineHeight * lines.length;

        const font = await fetchFont(fontFamily);
        
        console.log("size * lineHeight * lines.length =    " + size + "*" + lineHeight + "*" + lines.length);

        
        console.log("font?     " + fontFamily);                  //[object Object]
        console.log("height?     " + height);              //22.4
        console.log ("save txt object?   " + fillColor);   
        console.log ("save txt size?   " + size);

        

        
        let what = await makeTextPDF({

          lines,
          fontSize: size,
          lineHeight,
          width,
          height,
          font: font.buffer || fontFamily, // built-in font family
          dy: font.correction(size, lineHeight),
          fillColor: fillColor, //might return empty in this case.

        });
        var str = new TextDecoder().decode(what)
        //var json = JSON.parse(str)
        console.log("waht?    " + str);

        const [textPage] = await pdfDoc.embedPdf(
          
          await makeTextPDF({

            lines,
            fontSize: size,
            lineHeight,

            width,
            height,

            font: font.buffer || fontFamily, // built-in font family
            dy: font.correction(size, lineHeight),
            fillColor: fillColor, //might return empty in this case.

          }),
          
        );
        console.log("makeTextPDF ends...   ")
        console.log("textPage?  " + [textPage]);

        for( var index in textPage ){
          var currentObject = textPage[ index ];
          console.log("currentTXT?  " + index + ":   " + currentObject);
        }
        
        return () =>
          page.drawPage(textPage, {
            width,
            height,
            x,
            y: pageHeight - y - height,
            
          });
      } else if (object.type === 'drawing') {
        let { x, y, path, scale } = object;
        const {
          pushGraphicsState,
          setLineCap,
          popGraphicsState,
          setLineJoin,
          LineCapStyle,
          LineJoinStyle,
        } = PDFLib;
        return () => {
          page.pushOperators(
            pushGraphicsState(),
            setLineCap(LineCapStyle.Round),
            setLineJoin(LineJoinStyle.Round),
          );
          page.drawSvgPath(path, {
            borderWidth: 5,
            scale,
            x,
            y: pageHeight - y,
          });
          page.pushOperators(popGraphicsState());
        };
      }
    });
    // embed objects in order
    const drawProcesses = await Promise.all(embedProcesses);
    drawProcesses.forEach((p) => p());
  });
  await Promise.all(pagesProcesses);
  try {
    const pdfBytes = await pdfDoc.save();
    download(pdfBytes, name, 'application/pdf');
  } catch (e) {
    console.log('Failed to save PDF.');
    throw e;
  }
}
