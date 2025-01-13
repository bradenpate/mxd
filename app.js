// Select DOM elements
const fileInput = document.getElementById('fileInput');
const image = document.getElementById('image');
const cropperContainer = document.getElementById('cropperContainer');
const exportButton = document.getElementById('exportButton');

let cropper;

// Handle image upload
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      image.src = reader.result; // Set uploaded image as source
      cropperContainer.style.display = 'block';

      // Initialize Cropper.js
      cropper = new Cropper(image, {
        aspectRatio: 1, // Crop in a circle
        viewMode: 1,
      });

      exportButton.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Handle image export
exportButton.addEventListener('click', () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        width: 1000,
        height: 1000,
      });
  
      // Create a new canvas for the circular mask
      const circularCanvas = document.createElement('canvas');
      const ctx = circularCanvas.getContext('2d');
  
      circularCanvas.width = 1000;
      circularCanvas.height = 1000;
  
      // Draw a transparent background
      ctx.clearRect(0, 0, circularCanvas.width, circularCanvas.height);
  
      // Create a circular clipping path
      ctx.beginPath();
      ctx.arc(500, 500, 500, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
  
      // Draw the cropped image onto the circular canvas
      ctx.drawImage(canvas, 0, 0);
  
      // Export the circular image as a PNG
      circularCanvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'headshot.png';
        link.click();
      });
    }
  });