const fileInput = document.getElementById('fileInput');
const image = document.getElementById('image');
const cropperContainer = document.getElementById('cropperContainer');
const previewContainer = document.getElementById('previewContainer');
let cropper;

// Initialize Cropper.js when an image is uploaded
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      image.src = reader.result;
      cropperContainer.style.display = 'block';
      document.getElementById('generateButton').style.display = 'block';

      // Initialize Cropper.js
      cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 1,
      });
    };
    reader.readAsDataURL(file);
  }
});

// Utility to create a canvas
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx };
};

// Apply a grayscale filter to a source canvas
const applyGrayscaleFilter = (sourceCanvas) => {
  const { canvas, ctx } = createCanvas(sourceCanvas.width, sourceCanvas.height);

  // Draw the source canvas onto the temporary canvas
  ctx.drawImage(sourceCanvas, 0, 0);

  // Get image data for pixel manipulation
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert each pixel to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const grayscale = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
    data[i] = grayscale;     // Red channel
    data[i + 1] = grayscale; // Green channel
    data[i + 2] = grayscale; // Blue channel
    // Alpha channel remains unchanged (data[i + 3])
  }

  // Put the modified image data back onto the canvas
  ctx.putImageData(imageData, 0, 0);

  return canvas;
};

// Create a circular cropped image
const createCircularImage = (sourceCanvas, applyFilter = false) => {
  const { canvas, ctx } = createCanvas(1000, 1000);

  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(500, 500, 500, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Apply grayscale filter if requested
  if (applyFilter) {
    const tempCanvas = applyGrayscaleFilter(sourceCanvas);
    ctx.drawImage(tempCanvas, 0, 0);
  } else {
    ctx.drawImage(sourceCanvas, 0, 0);
  }

  return canvas;
};

// Create a square cropped image
const createSquareImage = (sourceCanvas, applyFilter = false) => {
  const { canvas, ctx } = createCanvas(1000, 1000);

  // Apply grayscale filter if requested
  if (applyFilter) {
    const tempCanvas = applyGrayscaleFilter(sourceCanvas);
    ctx.drawImage(tempCanvas, 0, 0);
  } else {
    ctx.drawImage(sourceCanvas, 0, 0);
  }

  return canvas;
};

// Create a preview element for the generated canvas
const createPreview = (canvas, label, filename) => {
  const container = document.createElement('div');
  container.style.margin = '10px';
  container.style.textAlign = 'center';

  // Create the image preview
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  img.style.width = '200px';
  img.style.height = '200px';
  img.style.marginBottom = '10px';

  // Create a label
  const imgLabel = document.createElement('p');
  imgLabel.textContent = label;

  // Create a download button
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = 'Download';
  downloadBtn.style.marginTop = '5px';
  downloadBtn.addEventListener('click', () => {
    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    });
  });

  container.appendChild(img);
  container.appendChild(imgLabel);
  container.appendChild(downloadBtn);

  previewContainer.appendChild(container);
};

// Generate and display the four versions
document.getElementById('generateButton').addEventListener('click', () => {
  if (cropper) {
    const croppedCanvas = cropper.getCroppedCanvas({
      width: 1000,
      height: 1000,
    });

    // Clear existing previews
    previewContainer.innerHTML = '';

    // Generate and display the 4 versions
    createPreview(
      createCircularImage(croppedCanvas),
      'Circle Color',
      'circle-color.png'
    );
    createPreview(
      createCircularImage(croppedCanvas, true),
      'Circle Black & White',
      'circle-bw.png'
    );
    createPreview(
      createSquareImage(croppedCanvas),
      'Square Color',
      'square-color.png'
    );
    createPreview(
      createSquareImage(croppedCanvas, true),
      'Square Black & White',
      'square-bw.png'
    );
  }
});