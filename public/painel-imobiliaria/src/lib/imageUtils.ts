/**
 * Advanced Client-Side Image Compression & Quota Optimization
 */

export async function compressDataUrl(
  base64DataUrl: string, 
  maxWidth = 1024, 
  quality = 0.72
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(base64DataUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(base64DataUrl);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      let compressed = canvas.toDataURL('image/webp', quality);
      if (!compressed || compressed.length >= base64DataUrl.length) {
        compressed = canvas.toDataURL('image/jpeg', quality);
      }

      if (!compressed || compressed.length >= base64DataUrl.length) {
        return resolve(base64DataUrl);
      }

      resolve(compressed);
    };

    img.onerror = () => {
      resolve(base64DataUrl);
    };

    img.src = base64DataUrl;
  });
}

export async function processFileToCompressedDataUrl(
  file: File, 
  maxWidth = 1024, 
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      if (!raw) {
        return reject(new Error('Falha ao ler o arquivo de imagem'));
      }
      try {
        const compressed = await compressDataUrl(raw, maxWidth, quality);
        resolve(compressed);
      } catch {
        resolve(raw);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
