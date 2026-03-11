import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CheckCircle, ChevronRight, Download, Share2, Upload, User, Mail, BookOpen, AlertCircle } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg, generateFinalCard } from './utils/canvasUtils';

type Step = 1 | 2 | 3;

interface FormData {
  fullName: string;
  className: string;
  email: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
}

const initialFormData: FormData = {
  fullName: '',
  className: '',
  email: '',
  q1: '',
  q2: '',
  q3: '',
  q4: '',
  q5: '',
  q6: '',
};

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Image Crop State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.fullName || !formData.className || !formData.email || !formData.q1 || !formData.q2 || !formData.q3 || !formData.q4 || !formData.q5 || !formData.q6) {
      setError('Vui lòng điền đầy đủ thông tin và trả lời tất cả câu hỏi.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }
      
      // Validate file type
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        setError('Chỉ chấp nhận định dạng JPG hoặc PNG.');
        return;
      }
      
      setError(null);
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const onCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    if (imageSrc) {
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        const cardImage = await generateFinalCard(croppedImage, formData.fullName, formData.className);
        setPreviewImage(cardImage);
      } catch (e) {
        console.error("Preview generation failed", e);
      }
    }
  };

  const handleGenerateCard = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    try {
      setIsGenerating(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const cardImage = await generateFinalCard(croppedImage, formData.fullName, formData.className);
      setFinalImage(cardImage);
      setStep(3);
    } catch (e) {
      console.error(e);
      setError('Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!finalImage) return;
    const a = document.createElement('a');
    a.href = finalImage;
    a.download = `Avatar_DoanTNCS_${formData.fullName.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    // In a real app, this would use Facebook SDK or Web Share API
    if (navigator.share && finalImage) {
      fetch(finalImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          navigator.share({
            title: 'Kỷ niệm 95 năm thành lập Đoàn TNCS Hồ Chí Minh',
            text: 'Cùng tôi thay avatar chào mừng 95 năm thành lập Đoàn TNCS Hồ Chí Minh! #95NamDoanTNCS #TuHaoThanhNienVietNam',
            files: [file]
          }).catch(console.error);
        });
    } else {
      // Fallback for desktop or unsupported browsers
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent('Cùng tôi thay avatar chào mừng 95 năm thành lập Đoàn TNCS Hồ Chí Minh! #95NamDoanTNCS #TuHaoThanhNienVietNam')}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center">
          <img src="https://upload.wikimedia.org/wikipedia/vi/thumb/0/07/Huy_hi%E1%BB%87u_%C4%90o%C3%A0n_Thanh_ni%C3%AAn_C%E1%BB%99ng_s%E1%BA%A3n_H%E1%BB%93_Ch%C3%AD_Minh.svg/1200px-Huy_hi%E1%BB%87u_%C4%90o%C3%A0n_Thanh_ni%C3%AAn_C%E1%BB%99ng_s%E1%BA%A3n_H%E1%BB%93_Ch%C3%AD_Minh.svg.png" alt="Logo Đoàn" className="h-10 w-10 mr-3 object-contain" />
          <h1 className="text-xl md:text-2xl font-bold text-center uppercase tracking-wide">
            Kỷ niệm 95 năm thành lập Đoàn
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Banner & Intro */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <div className="text-center text-white z-10 px-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase mb-2 drop-shadow-md">Tự hào tuổi trẻ Việt Nam</h2>
                    <p className="text-lg md:text-xl font-medium drop-shadow-sm">26/03/1931 - 26/03/2026</p>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Lời ngỏ</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Chào mừng kỷ niệm 95 năm ngày thành lập Đoàn TNCS Hồ Chí Minh (26/03/1931 - 26/03/2026). 
                    Hãy cùng tham gia trả lời các câu hỏi tìm hiểu về Đoàn và tạo ngay cho mình một chiếc Avatar thật "chất" để lan tỏa tinh thần tuổi trẻ nhé!
                  </p>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" /> Thể lệ tham gia
                    </h4>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                      <li>Điền đầy đủ thông tin cá nhân.</li>
                      <li>Trả lời đúng các câu hỏi trắc nghiệm.</li>
                      <li>Tải ảnh chân dung rõ nét (tối đa 5MB).</li>
                      <li>Nhận ảnh và chia sẻ lên mạng xã hội với hashtag #95NamDoanTNCS.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Thông tin & Khảo sát</h3>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-8">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-slate-700 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" /> Thông tin cá nhân
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bộ phận/Lớp *</label>
                        <input
                          type="text"
                          name="className"
                          value={formData.className}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Chi đoàn 12A1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="nguyenvana@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quiz */}
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <h4 className="font-semibold text-lg text-slate-700 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-600" /> Trắc nghiệm kiến thức
                    </h4>
                    
                    <div className="space-y-3">
                      <label className="block font-medium text-slate-800">1. Đoàn Thanh niên Cộng sản Hồ Chí Minh được thành lập vào ngày nào?</label>
                      <div className="space-y-2 pl-2">
                        {['26/3/1930', '26/3/1931', '26/3/1932'].map((opt, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input type="radio" name="q1" value={opt} checked={formData.q1 === opt} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-medium text-slate-800">2. Ai là người sáng lập và rèn luyện Đoàn Thanh niên Cộng sản Hồ Chí Minh?</label>
                      <div className="space-y-2 pl-2">
                        {['Võ Nguyên Giáp', 'Hồ Chí Minh', 'Phạm Văn Đồng'].map((opt, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input type="radio" name="q2" value={opt} checked={formData.q2 === opt} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-medium text-slate-800">3. Bài hát truyền thống của Đoàn TNCS Hồ Chí Minh là bài nào?</label>
                      <div className="space-y-2 pl-2">
                        {['Tiến quân ca', 'Thanh niên làm theo lời Bác', 'Nối vòng tay lớn'].map((opt, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input type="radio" name="q3" value={opt} checked={formData.q3 === opt} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-medium text-slate-800">4. Khẩu hiệu nổi tiếng của thanh niên Việt Nam là gì?</label>
                      <div className="space-y-2 pl-2">
                        {['Tuổi trẻ sáng tạo', 'Đâu cần thanh niên có, việc gì khó có thanh niên', 'Thanh niên tiến bước'].map((opt, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input type="radio" name="q4" value={opt} checked={formData.q4 === opt} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-medium text-slate-800">5. Màu áo truyền thống của thanh niên Việt Nam là màu gì?</label>
                      <div className="space-y-2 pl-2">
                        {['Xanh dương', 'Xanh lá', 'Đỏ'].map((opt, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input type="radio" name="q5" value={opt} checked={formData.q5 === opt} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block font-medium text-slate-800">6. Thanh niên khi tham gia hoạt động tập thể cần nhất điều gì?</label>
                      <div className="space-y-2 pl-2">
                        {['Nhiệt huyết', 'Tinh thần đoàn kết', 'Cả hai'].map((opt, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input type="radio" name="q6" value={opt} checked={formData.q6 === opt} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center text-lg"
                  >
                    Tiếp tục tạo Avatar <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Tạo Avatar Kỷ niệm</h3>
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Quay lại</button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!imageSrc ? (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-2">Tải ảnh của bạn lên</p>
                  <p className="text-sm text-slate-500">Hỗ trợ JPG, PNG. Tối đa 5MB</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative h-[400px] w-full bg-slate-900 rounded-2xl overflow-hidden">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Thu phóng</label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setImageSrc(null)}
                      className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Chọn ảnh khác
                    </button>
                    <button
                      onClick={handleGenerateCard}
                      disabled={isGenerating}
                      className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center"
                    >
                      {isGenerating ? 'Đang xử lý...' : 'Hoàn thành'}
                    </button>
                  </div>

                  {previewImage && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4 text-center">Xem trước kết quả</h4>
                      <div className="max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                        <img src={previewImage} alt="Preview" className="w-full h-auto" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Chúc mừng bạn!</h3>
              <p className="text-slate-600 mb-8">Bạn đã hoàn thành khảo sát và tạo Avatar thành công.</p>

              {finalImage && (
                <div className="max-w-sm mx-auto mb-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                  <img src={finalImage} alt="Avatar Kỷ niệm" className="w-full h-auto" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Download className="w-5 h-5 mr-2" /> Tải ảnh về máy
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center px-6 py-3 bg-[#1877F2] text-white font-bold rounded-xl hover:bg-[#166FE5] transition-colors shadow-md"
                >
                  <Share2 className="w-5 h-5 mr-2" /> Chia sẻ Facebook
                </button>
              </div>
              
              <button onClick={() => {
                setStep(1);
                setFormData(initialFormData);
                setImageSrc(null);
                setFinalImage(null);
              }} className="mt-8 text-sm text-slate-500 hover:text-blue-600 hover:underline">
                Tạo cho người khác
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>&copy; 2026 Kỷ niệm 95 năm thành lập Đoàn TNCS Hồ Chí Minh.</p>
      </footer>
    </div>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
}
