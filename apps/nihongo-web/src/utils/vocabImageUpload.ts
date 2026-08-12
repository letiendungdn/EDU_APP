/** Đọc + nén ảnh vocab (nhỏ hơn banner) để lưu imageUrl. */
export async function readVocabImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn file ảnh (JPG, PNG, WebP…).');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Ảnh quá lớn (tối đa 8MB).');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Không đọc được file ảnh'));
    reader.readAsDataURL(file);
  });

  return resizeImageDataUrl(dataUrl, 800, 0.85);
}

function resizeImageDataUrl(
  dataUrl: string,
  maxSide: number,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const longest = Math.max(img.width, img.height);
      const scale = longest > maxSide ? maxSide / longest : 1;
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Ảnh không hợp lệ'));
    img.src = dataUrl;
  });
}
