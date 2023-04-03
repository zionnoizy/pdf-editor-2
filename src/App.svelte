<script>
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import Tailwind from "./Tailwind.svelte";
  import PDFPage from "./PDFPage.svelte";
  import Image from "./Image.svelte";
  import Text from "./Text.svelte";
  import Drawing from "./Drawing.svelte";
  import DrawingCanvas from "./DrawingCanvas.svelte";
  import prepareAssets, { fetchFont } from "./utils/prepareAssets.js";
  import {
    readAsArrayBuffer,
    readAsImage,
    readAsPDF,
    readAsDataURL
  } from "./utils/asyncReader.js";
  import { ggID } from "./utils/helper.js";
  import { save } from "./utils/PDF.js";

  const genID = ggID();
  let pdfFile;
  let pdfName = "";
  let pages = [];
  let pagesScale = [];
  let allObjects = [];
  let currentFont = "Helvetica";
  let currentColor = "";
  let focusId = null;
  let selectedPageIndex = -1;
  let saving = false;
  let addingDrawing = false;
  // for test purpose
  onMount(async () => {
    try {
      const res = await fetch("/empty_pdf/cms.pdf");
      console.log("res:" + res);
      const pdfBlob = await res.blob();
      await addPDF(pdfBlob);
      selectedPageIndex = 0;
      setTimeout(() => {
        fetchFont(currentFont);
        prepareAssets();
      }, 5000);
      
    } catch (e) {
      console.log(e);
    }
  });
  async function onUploadPDF(e) {
    const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
    const file = files[0];
    if (!file || file.type !== "application/pdf") return;
    selectedPageIndex = -1;
    try {
      await addPDF(file);
      selectedPageIndex = 0;
    } catch (e) {
      console.log(e);
    }
  }
  async function addPDF(file) {
    try {
      console.log("file" + file);
      const pdf = await readAsPDF(file);
      pdfName = file.name;
      pdfFile = file;
      const numPages = pdf.numPages;
      pages = Array(numPages)
        .fill()
        .map((_, i) => pdf.getPage(i + 1));
      allObjects = pages.map(() => []);
      pagesScale = Array(numPages).fill(1);
    } catch (e) {
      console.log("Failed to add pdf.");
      throw e;
    }
  }
  async function onUploadImage(e) {
    const file = e.target.files[0];
    if (file && selectedPageIndex >= 0) {
      addImage(file);
    }
    e.target.value = null;
  }
  async function addImage(file) {
    try {
      // get dataURL to prevent canvas from tainted
      const url = await readAsDataURL(file);
      const img = await readAsImage(url);
      const id = genID();
      const { width, height } = img;
      const object = {
        id,
        type: "image",
        width,
        height,
        x: 0,
        y: 0,
        payload: img,
        file
      };
      allObjects = allObjects.map((objects, pIndex) =>
        pIndex === selectedPageIndex ? [...objects, object] : objects
      );
    } catch (e) {
      console.log(`Fail to add image.`, e);
    }
  }
  function onAddTextField() {
    if (selectedPageIndex >= 0) {
      addTextField();
    }
  }
  function addTextField(text = "[Modify & Move Text Here]") {

    const id = genID();
    fetchFont(currentFont);
    const object = {

      id,
      text,
      type: "text",
      size: 16,
      width: 0, // recalculate after editing
      lineHeight: 1.4,
      fontFamily: currentFont,
      x: 0,
      y: 0,
      fillColor: "#000",

    };
    console.log("object?:   " + object);
    allObjects = allObjects.map((objects, pIndex) =>
      
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );

  }

  function onAddDrawing() {
    if (selectedPageIndex >= 0) {
      addingDrawing = true;
    }
  }
  function srcToFile(src, fileName, mimeType){
    return (fetch(src)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], fileName, {type:mimeType});})
    );
  }
  async function onAddDrawing2(e) { ///
    srcToFile('/output-onlinepngtools.png', 'output-onlinepngtools.png', 'image/png')
    .then(function(file){
      var fd = new FormData();
      fd.append('file1', file);
      console.log("[file object?]   " + file);
      addImage(file);
    })
    .then(console.log)
    .catch(console.error);
  }


  //
  async function onAddDrawing3() {
    srcToFile('/output-onlinepngtools(1).png', 'output-onlinepngtools(1).png', 'image/png')
    .then(function(file){
      var fd = new FormData();
      fd.append('file1', file);
      console.log("[file object?]   " + file);
      addImage(file);
    
    })
    .then(console.log)
    .catch(console.error);
  }

  async function onAddDrawingSR() {
    srcToFile('/square_red2.png', 'square_red2.png', 'image/png')
    .then(function(file){
      var fd = new FormData();
      fd.append('file1', file);
      console.log("[file object?]   " + file);
      addImage(file);
    
    })
    .then(console.log)
    .catch(console.error);
  }

  async function onAddDrawingSG() {
    srcToFile('/square_green2.png', 'square_green2.png', 'image/png')
    .then(function(file){
      var fd = new FormData();
      fd.append('file1', file);
      console.log("[file object?]   " + file);
      addImage(file);
    
    })
    .then(console.log)
    .catch(console.error);
  }

  async function onAddDrawingSB() {
    srcToFile('/square_blue2.png', 'square_blue2.png', 'image/png')
    .then(function(file){
      var fd = new FormData();
      fd.append('file1', file);
      console.log("[file object?]   " + file);
      addImage(file);
    
    })
    .then(console.log)
    .catch(console.error);
  }

  async function onAddDrawingCR() {
    srcToFile('/circle_red_2.png', 'circle_red_2.png', 'image/png')
    .then(function(file){
      var fd = new FormData();
      fd.append('file1', file);
      console.log("[file object?]   " + file);
      addImage(file);
    
    })
    .then(console.log)
    .catch(console.error);
  }

  async function onAddDrawingCG() {
    srcToFile('/circle_green_2.png', 'circle_green_2.png', 'image/png')
    .then(function(file){
      var fd = new FormData();
      fd.append('file1', file);
      console.log("[file object?]   " + file);
      addImage(file);
    
    })
    .then(console.log)
    .catch(console.error);
  }

  async function onAddDrawingCB() {
    srcToFile('/circle_blue_2.png', 'circle_blue_2.png', 'image/png')
    .then(function(file){
      var fd = new FormData();
      fd.append('file1', file);
      console.log("[file object?]   " + file);
      addImage(file);
    
    })
    .then(console.log)
    .catch(console.error);
  }

  window.onclick = function(event) {
      if (!event.target.matches('.more_mysquare_btn')) {
        var dropdowns = document.getElementsByClassName("dropdown_square");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }


  function addDrawing(originWidth, originHeight, path, scale = 1) {
    const id = genID();
    const object = {
      id,
      path,
      type: "drawing",
      x: 0,
      y: 0,
      originWidth,
      originHeight,
      width: originWidth * scale,
      scale
    };
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );
  }
  function selectFontFamily(event) {
    const name = event.detail.name;
    fetchFont(name);
    currentFont = name;
  }

  function selectColor(event) {
    const fillColor = event.detail.fillColor;

    console.log( "SelectCOlor?   " + fillColor );

    //currentColor = "rgb(0,0,0)";
  }


  function selectPage(index) {
    selectedPageIndex = index;
  }
  function updateObject(objectId, payload) {
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex == selectedPageIndex
        ? objects.map(object =>
            object.id === objectId ? { ...object, ...payload } : object
          )
        : objects
    );
  }
  function deleteObject(objectId) {
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex == selectedPageIndex
        ? objects.filter(object => object.id !== objectId)
        : objects
    );
  }
  function onMeasure(scale, i) {
    pagesScale[i] = scale;
  }
  // FIXME: Should wait all objects finish their async work
  async function savePDF() {
    if (!pdfFile || saving || !pages.length) return;
    console.log("allObjects?" + allObjects);
    saving = true;

    
    try {
      await save(pdfFile, allObjects, pdfName, pagesScale);
    } catch (e) {
      console.log(e);
    } finally {
      saving = false;
    }
  }
</script>

<svelte:window
  on:dragenter|preventDefault
  on:dragover|preventDefault
  on:drop|preventDefault={onUploadPDF} />
<Tailwind />
<main class="flex flex-col items-center py-16 bg-gray-100 min-h-screen">
  <div
    class="fixed z-10 top-0  rounded h-12 flex justify-center items-center
    bg-gray-200 border-b border-gray-300 mt-5" style="background-color: rgb(78 115 248);">
    
    <img src="EzPzPDFicon.png" alt="An icon for adding square" style="display: flex;" class="flex items-center justify-center    w-16 cursor-pointer mr-5 mx-2" />

    <input
      type="file"
      name="pdf"
      id="pdf"
      on:change={onUploadPDF}
      class="hidden" />
    <input
      type="file"
      id="image"
      name="image"
      class="hidden"
      on:change={onUploadImage} />
    
      <label
      class="whitespace-no-wrap bg-blue-500 hover:bg-blue-700 
      font-bold py-1 px-3 md:px-4 rounded-pill mr-3 cursor-pointer md:mr-4  text-center"
      for="pdf" style="background-color: #fff;;width : 40%; border-radius: 16px;">
      <div class="grid grid-cols-2 gap-2">
        <div>
        <p style="color:#6688f8; text-align: center;;">
          OPEN
          
        </p>
        </div>
        <div>
          <img src="openpdf.png" alt="An icon for adding square" style="display: flex;" class="flex items-center justify-center h-full  w-8 cursor-pointer" />
        </div>
      </div>

    </label>

    <div class="justify-center mx-3  md:mr-4 w-full max-w-xs hidden md:flex">
      
      
      <input
        placeholder="Rename your PDF here"
        type="text"
        class="flex-grow bg-transparent border border-light"
        style="background-color: #fff; outline: none; border: 2px solid rgb(18, 103, 170); border-radius: 25px; height: 30px; text-align: center;"
        bind:value={pdfName} />

    </div>

    <div
      class="relative mr-3 flex h-8 bg-gray-400 rounded-sm 
      md:mr-4" style="border-radius: 25px; background-color: #fff;">
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer mx-1"
        for="image"
        class:cursor-not-allowed={selectedPageIndex < 0}
        class:bg-gray-500={selectedPageIndex < 0}>
        <img src="image.svg" alt="An icon for adding images" />
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer  mx-1"
        for="text"
        class:cursor-not-allowed={selectedPageIndex < 0}
        class:bg-gray-500={selectedPageIndex < 0}
        on:click={onAddTextField}>
        <img src="text2.png" alt="An icon for adding text" />
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer  mx-1"
        on:click={onAddDrawing}
        class:cursor-not-allowed={selectedPageIndex < 0}
        class:bg-gray-500={selectedPageIndex < 0}>
        <img src="gesture.svg" alt="An icon for adding drawing" />
      </label>

      <div class="s_c">
      <label
        class="mysquare flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer  mx-1"
        on:click={onAddDrawing2}
        class:cursor-not-allowed={selectedPageIndex < 0}
        class:bg-gray-500={selectedPageIndex < 0}>
        <img src="square.svg" alt="An icon for adding square" />

        
      </label>
      <div id="" style="  position: absolute; z-index:999; background-color:aquamarine;" class="mt-1">
        <ul style=" display: inline-block;">
          <li on:click={onAddDrawingSR} class="relative  flex h-8  my-1 mx-1" style="float: left; " > <img src="square_red2.png" alt="An icon for adding square" /> </li>
          <li on:click={onAddDrawingSG} class="relative  flex h-8  my-1 mx-1" style="float: left; "> <img src="square_green2.png" alt="An icon for adding square" /> </li>
          <li on:click={onAddDrawingSB} class="relative  flex h-8  my-1 mx-1" style="float: left; "> <img src="square_blue2.png" alt="An icon for adding square" /> </li>
          <li on:click={onAddDrawingCR} class="relative  flex h-8  my-1 mx-1" style="float: left; " > <img src="circle_red_2.png" alt="An icon for adding square" /> </li>
          <li on:click={onAddDrawingCG} class="relative  flex h-8  my-1 mx-1" style="float: left; "> <img src="circle_green_2.png" alt="An icon for adding square" /> </li>
          <li on:click={onAddDrawingCB} class="relative  flex h-8  my-1 mx-1" style="float: left; "> <img src="circle_blue_2.png" alt="An icon for adding square" /> </li>
        </ul>
      </div>
      </div>






      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer  mx-1"
        on:click={onAddDrawing3}
        class:cursor-not-allowed={selectedPageIndex < 0}
        class:bg-gray-500={selectedPageIndex < 0}>
        <img src="circle.svg" alt="An icon for adding circle" />
      </label>

    </div>
    
    <button
      on:click={savePDF}
      class="w-40 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3
      md:px-4 mx-3 md:mr-4 rounded" style="background-color: #fff;;width : 40%; border-radius: 16px;"
      class:cursor-not-allowed={pages.length === 0 || saving || !pdfFile}
      class:bg-blue-700={pages.length === 0 || saving || !pdfFile}>
      <div class="grid grid-cols-2 gap-2">
      <div class=" " style="color:#6688f8;  ">
        {saving ? 'SAVING...' : 'SAVE'}
      </div>
      <div>
        <img src="save.webp" alt="An icon for adding square" style="display: flex; color: #ffffff; " class="flex items-center justify-center h-full  w-8 cursor-pointer" />
      </div>
    </div>
    </button>

    
  </div>
  {#if addingDrawing}
    <div
      transition:fly={{ y: -200, duration: 500 }}
      class="fixed z-10 top-0 left-0 right-0 border-b border-gray-300 bg-white
      shadow-lg"
      style="height: 50%;">
      <DrawingCanvas
        on:finish={e => {
          const { originWidth, originHeight, path } = e.detail;
          let scale = 1;
          if (originWidth > 500) {
            scale = 500 / originWidth;
          }
          addDrawing(originWidth, originHeight, path, scale);
          addingDrawing = false;
        }}
        on:cancel={() => (addingDrawing = false)} />
    </div>
  {/if}
  {#if pages.length}
    <div class="flex justify-center px-5 w-full md:hidden">
      <img src="/edit.svg" class="mr-2" alt="a pen, edit pdf name" />
      <input
        placeholder="Rename your PDF here"
        type="text"
        class="flex-grow bg-transparent"
        bind:value={pdfName} />
    </div>
    <div class="w-full">
      {#each pages as page, pIndex (page)}
        <div
          class="p-5 w-full flex flex-col items-center overflow-hidden"
          on:mousedown={() => selectPage(pIndex)}
          on:touchstart={() => selectPage(pIndex)}>
          <div
            class="relative shadow-lg"
            class:shadow-outline={pIndex === selectedPageIndex}>
            <PDFPage
              on:measure={e => onMeasure(e.detail.scale, pIndex)}
              {page} />
            <div
              class="absolute top-0 left-0 transform origin-top-left"
              style="transform: scale({pagesScale[pIndex]}); touch-action: none;">
              {#each allObjects[pIndex] as object (object.id)}
                {#if object.type === 'image'}
                  <Image
                    on:update={e => updateObject(object.id, e.detail)}
                    on:delete={() => deleteObject(object.id)}
                    file={object.file}
                    payload={object.payload}
                    x={object.x}
                    y={object.y}
                    width={object.width}
                    height={object.height}
                    pageScale={pagesScale[pIndex]} />
                {:else if object.type === 'text'}
                  <Text
                    on:update={e => updateObject(object.id, e.detail)}
                    on:delete={() => deleteObject(object.id)}
                    on:selectFont={selectFontFamily}
                    text={object.text}
                    x={object.x}
                    y={object.y}
                    size={object.size}
                    lineHeight={object.lineHeight}
                    fontFamily={object.fontFamily}
                    pageScale={pagesScale[pIndex]}
                    
                    on:selectColor={selectColor}
                    

                    />
                    <!-- fillColor={object.fillColor} on:selectColor={selectColor}  -->
                {:else if object.type === 'drawing'}
                  <Drawing
                    on:update={e => updateObject(object.id, e.detail)}
                    on:delete={() => deleteObject(object.id)}
                    path={object.path}
                    x={object.x}
                    y={object.y}
                    width={object.width}
                    originWidth={object.originWidth}
                    originHeight={object.originHeight}
                    pageScale={pagesScale[pIndex]} />
                {/if}
              {/each}

            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="w-full flex-grow flex justify-center items-center">
      <span class=" font-bold text-3xl text-gray-500">Drag something here</span>
    </div>
  {/if}
</main>

<style>

</style>