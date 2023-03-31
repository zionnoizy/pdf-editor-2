
window.makeTextPDF = async function makeTextPDF({

    width,
    height,
    font,
    dy,
    fillColor,
  }) {
    const doc = new PDFDocument({
      margin: 0,
      size: [width, height],
    });
    const stream = doc.pipe(blobStream());
  
    
    doc.fontSize(44);
         
    doc.fillColor(fillColor).text("TEST ME", 10, 10);

  
    return new Promise((res) => {
      stream.on('finish', function () {
        const blob = stream.toBlob('application/pdf');
        const response = new Response(blob);
        res(response.arrayBuffer());
      });
    });
    
  };
