// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// ĐIỀN LINK GOOGLE APPS SCRIPT CỦA BẠN VÀO ĐÂY
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkK45yxJPbWQVaBJmovNlFJ06afuQ8jjtmr7e4Tw-zEOtHrQPmYpkiI6_7ckWyU3aawQ/exec'; // Thay bằng link thật của bạn

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
quizForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  
  const q1 = document.querySelector('input[name="q1"]:checked')?.value;
  const q2 = document.querySelector('input[name="q2"]:checked')?.value;
  const q3 = document.querySelector('input[name="q3"]:checked')?.value;
  const q4 = document.querySelector('input[name="q4"]:checked')?.value;
  const q5 = document.querySelector('input[name="q5"]:checked')?.value;
  const q6 = document.querySelector('input[name="q6"]:checked')?.value;

  if (!fullName || !email) {
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

  // Success - Lưu vào Google Sheet
  errorBox.classList.add('hidden');
  
  const submitBtn = quizForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  
  try {
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 mr-2 animate-spin inline-block"></i> Đang xử lý...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    
    // Gửi dữ liệu lên Google Sheet (không block UI)
    if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.includes('script.google.com')) {
      const payload = {
        timestamp: new Date().toLocaleString('vi-VN'),
        fullName: fullName,
        email: email,
        q1: q1, q2: q2, q3: q3, q4: q4, q5: q5, q6: q6
      };
      
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Bỏ qua lỗi CORS
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      }).catch(err => console.error('Lỗi lưu sheet:', err));
    } else {
      console.warn("Chưa cấu hình GOOGLE_SCRIPT_URL. Bỏ qua bước lưu Google Sheet.");
    }
  } catch (error) {
    console.error('Lỗi khi xử lý form:', error);
  } finally {
    // Khôi phục nút
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    
    // Chuyển sang bước 2
    goToStep(2);
    // Re-initialize lucide icons if needed
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
});

// =====================================================================
// ẢNH PHÔI CỦA BẠN CÓ KÍCH THƯỚC LÀ 1684x2528
// HÃY THAY ĐỔI CÁC THÔNG SỐ DƯỚI ĐÂY ĐỂ CĂN CHỈNH CHO KHỚP VỚI PHÔI
// =====================================================================
const CONFIG = {
  avatar: {
    x: 84,       // Vị trí X của avatar (từ trái sang)
    y: 812,      // Vị trí Y của avatar (từ trên xuống)
    width: 520,  // Chiều rộng của avatar trên phôi
    height: 529, // Chiều cao của avatar trên phôi
    // NẾU PHÔI CỦA BẠN LÀ FILE PNG CÓ LỖ TRONG SUỐT Ở GIỮA -> Đổi thành true
    // NẾU PHÔI CỦA BẠN LÀ FILE JPG BÌNH THƯỜNG -> Để là false
    drawBehind: true 
  },
  name: {
    x: 990,      // Vị trí X của Tên (bắt đầu từ lề trái của dòng kẻ chấm)
    y: 1051,      // Vị trí Y của Tên (nằm trên dòng kẻ chấm)
    font: "bold 56px Arial",
    color: "#b3251b" // Màu đỏ đồng bộ với chữ "Chúc Mừng Kỷ Niệm"
  }
};

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
      aspectRatio: CONFIG.avatar.width / CONFIG.avatar.height, // Sử dụng tỷ lệ từ CONFIG
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
  if (typeof lucide !== 'undefined') lucide.createIcons();
  generateBtn.disabled = true;

  // Get cropped canvas
  const croppedCanvas = cropper.getCroppedCanvas({
    width: CONFIG.avatar.width,
    height: CONFIG.avatar.height,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });

  // Load template
  const templateImg = new Image();
  templateImg.src = './template.png'; // Nếu dùng PNG, hãy đổi tên file này thành template.png
  templateImg.crossOrigin = 'anonymous';

  templateImg.onload = () => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 1684;
    finalCanvas.height = 2528;
    const ctx = finalCanvas.getContext('2d');

    if (CONFIG.avatar.drawBehind) {
      // Vẽ avatar trước, phôi đè lên sau (Giúp avatar không bị trồi ra khỏi khung)
      ctx.drawImage(croppedCanvas, CONFIG.avatar.x, CONFIG.avatar.y, CONFIG.avatar.width, CONFIG.avatar.height);
      ctx.drawImage(templateImg, 0, 0, 1684, 2528);
    } else {
      // Vẽ phôi trước, avatar đè lên sau
      ctx.drawImage(templateImg, 0, 0, 1684, 2528);
      ctx.drawImage(croppedCanvas, CONFIG.avatar.x, CONFIG.avatar.y, CONFIG.avatar.width, CONFIG.avatar.height);
    }

    // Vẽ Họ và tên
    const fullName = document.getElementById('fullName').value.trim();
    if (fullName) {
      ctx.font = CONFIG.name.font;
      ctx.fillStyle = CONFIG.name.color;
      
      // Thay đổi từ "center" sang "left" để chữ bắt đầu từ một điểm cố định
      ctx.textAlign = "left"; 
      ctx.textBaseline = "middle";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#ffffff"; // Viền trắng giúp chữ nổi bật hơn
      
      // Thêm chữ "Thân tặng đồng chí " vào trước tên
      const textToDraw = fullName.toUpperCase();
      
      ctx.strokeText(textToDraw, CONFIG.name.x, CONFIG.name.y);
      ctx.fillText(textToDraw, CONFIG.name.x, CONFIG.name.y);
    }

    // Set result
    finalResult.src = finalCanvas.toDataURL('image/jpeg', 0.9);
    
    // Reset button and go to step 3
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    goToStep(3);
  };

  templateImg.onerror = () => {
    alert('Không tìm thấy phôi thiệp (template.jpg). Vui lòng đảm bảo file template.jpg nằm cùng thư mục.');
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
