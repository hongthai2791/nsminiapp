// Initialize Lucide icons
lucide.createIcons();

// State
let currentStep = 1;
let cropper = null;
let uploadedImageSrc = null;

// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const errorBox = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const quizForm = document.getElementById('quiz-form');
const imageInput = document.getElementById('imageInput');
const imageToCrop = document.getElementById('image-to-crop');
const cropperContainer = document.getElementById('cropper-container');
const generateBtn = document.getElementById('generate-btn');
const finalResult = document.getElementById('final-result');

// Navigation
window.goToStep = function(step) {
  // Hide all
  step1.classList.remove('active-step');
  step1.classList.add('hidden-step');
  step2.classList.remove('active-step');
  step2.classList.add('hidden-step');
  step3.classList.remove('active-step');
  step3.classList.add('hidden-step');

  // Show target with a slight delay for transition effect
  setTimeout(() => {
    if (step === 1) {
      step1.classList.remove('hidden-step');
      step1.classList.add('active-step');
      // Reset form and cropper if going back to start
      quizForm.reset();
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      cropperContainer.classList.add('hidden');
      generateBtn.disabled = true;
      errorBox.classList.add('hidden');
    } else if (step === 2) {
      step2.classList.remove('hidden-step');
      step2.classList.add('active-step');
    } else if (step === 3) {
      step3.classList.remove('hidden-step');
      step3.classList.add('active-step');
    }
    currentStep = step;
  }, 50);
};

function showError(msg) {
  errorText.textContent = msg;
  errorBox.classList.remove('hidden');
  errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Step 1: Form Submission
quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value.trim();
  const className = document.getElementById('className').value.trim();
  const email = document.getElementById('email').value.trim();
  
  const q1 = document.querySelector('input[name="q1"]:checked')?.value;
  const q2 = document.querySelector('input[name="q2"]:checked')?.value;
  const q3 = document.querySelector('input[name="q3"]:checked')?.value;
  const q4 = document.querySelector('input[name="q4"]:checked')?.value;
  const q5 = document.querySelector('input[name="q5"]:checked')?.value;
  const q6 = document.querySelector('input[name="q6"]:checked')?.value;

  if (!fullName || !className || !email) {
    showError('Vui lòng điền đầy đủ thông tin cá nhân.');
    return;
  }

  if (!q1 || !q2 || !q3 || !q4 || !q5 || !q6) {
    showError('Vui lòng trả lời tất cả các câu hỏi trắc nghiệm.');
    return;
  }

  // Check answers (b, b, b, b, a, c)
  if (q1 !== 'b' || q2 !== 'b' || q3 !== 'b' || q4 !== 'b' || q5 !== 'a' || q6 !== 'c') {
    showError('Rất tiếc, có câu trả lời chưa chính xác. Vui lòng kiểm tra lại kiến thức về Đoàn nhé!');
    return;
  }

  // Success
  errorBox.classList.add('hidden');
  goToStep(2);
});

// Step 2: Image Upload & Cropper
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn một tệp hình ảnh.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImageSrc = event.target.result;
    imageToCrop.src = uploadedImageSrc;
    cropperContainer.classList.remove('hidden');
    generateBtn.disabled = false;

    if (cropper) {
      cropper.destroy();
    }

    cropper = new Cropper(imageToCrop, {
      aspectRatio: 1, // 1:1 square
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    });
  };
  reader.readAsDataURL(file);
});

// Step 2: Generate Avatar
generateBtn.addEventListener('click', () => {
  if (!cropper) return;

  // Change button state
  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = '<i data-lucide="loader-2" class="mr-2 w-5 h-5 animate-spin"></i> Đang xử lý...';
  lucide.createIcons();
  generateBtn.disabled = true;

  // Get cropped canvas
  const croppedCanvas = cropper.getCroppedCanvas({
    width: 600,
    height: 600,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });

  // Load template
  const templateImg = new Image();
  templateImg.src = './template.jpg'; 
  templateImg.crossOrigin = 'anonymous';

  templateImg.onload = () => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 1080;
    finalCanvas.height = 1080;
    const ctx = finalCanvas.getContext('2d');

    // Draw template first
    ctx.drawImage(templateImg, 0, 0, 1080, 1080);
    
    // Draw cropped user image on top (centered, 600x600)
    // Adjust these coordinates based on your actual template.jpg design
    ctx.drawImage(croppedCanvas, 240, 240, 600, 600);

    // Draw the user's name on the image
    const fullName = document.getElementById('fullName').value.trim();
    if (fullName) {
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#ffffff"; // White text, change if needed
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Thêm viền chữ (stroke) để chữ nổi bật hơn trên mọi nền ảnh
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(fullName.toUpperCase(), 540, 900); // Tọa độ (x=540, y=900) - có thể điều chỉnh
      ctx.fillText(fullName.toUpperCase(), 540, 900);
    }

    // Set result
    finalResult.src = finalCanvas.toDataURL('image/jpeg', 0.9);
    
    // Reset button and go to step 3
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
    lucide.createIcons();
    goToStep(3);
  };

  templateImg.onerror = () => {
    alert('Không tìm thấy phôi thiệp (template.jpg). Vui lòng đảm bảo file template.jpg nằm cùng thư mục.');
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
    lucide.createIcons();
  };
});

// Step 3: Download
window.downloadAvatar = function() {
  if (!finalResult.src) return;
  const link = document.createElement('a');
  link.download = 'avatar-doan-95nam.jpg';
  link.href = finalResult.src;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
