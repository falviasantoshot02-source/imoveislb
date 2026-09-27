/**
 * Image processing and download utilities for LB Negócios Imobiliários
 */

export interface ProcessedImage {
  url: string;
  alt: string;
  caption?: string;
  fileName: string;
}

/**
 * Optimizes, resizes and compresses an image file using browser Canvas.
 * Keeps output sharp while ensuring document storage efficiency.
 */
export async function processImageFile(
  file: File,
  maxDimension = 860,
  quality = 0.65
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const cleanName = file.name.replace(/\.[^/.]+$/, '');

        if (!ctx) {
          const rawResult = event.target?.result as string;
          resolve({
            url: rawResult,
            alt: cleanName,
            caption: cleanName,
            fileName: file.name
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to efficient JPEG data URL
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Tier 1 safety: if dataUrl exceeds 75KB, scale down slightly
        if (dataUrl.length > 75000) {
          const secondCanvas = document.createElement('canvas');
          secondCanvas.width = Math.round(width * 0.85);
          secondCanvas.height = Math.round(height * 0.85);
          const secondCtx = secondCanvas.getContext('2d');
          if (secondCtx) {
            secondCtx.imageSmoothingQuality = 'medium';
            secondCtx.drawImage(canvas, 0, 0, secondCanvas.width, secondCanvas.height);
            dataUrl = secondCanvas.toDataURL('image/jpeg', 0.58);
          }
        }

        // Tier 2 safety: if still over 65KB, scale to ensure absolute lightweight storage
        if (dataUrl.length > 65000) {
          const thirdCanvas = document.createElement('canvas');
          thirdCanvas.width = Math.round(width * 0.72);
          thirdCanvas.height = Math.round(height * 0.72);
          const thirdCtx = thirdCanvas.getContext('2d');
          if (thirdCtx) {
            thirdCtx.imageSmoothingQuality = 'medium';
            thirdCtx.drawImage(canvas, 0, 0, thirdCanvas.width, thirdCanvas.height);
            dataUrl = thirdCanvas.toDataURL('image/jpeg', 0.52);
          }
        }

        resolve({
          url: dataUrl,
          alt: cleanName,
          caption: cleanName,
          fileName: file.name
        });
      };

      img.onerror = () => reject(new Error(`Falha ao decodificar imagem: ${file.name}`));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error(`Falha ao ler arquivo: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Re-compresses an existing base64 dataUrl image to a smaller size.
 */
export async function compressDataUrl(
  dataUrl: string,
  maxDimension = 760,
  quality = 0.58
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Downloads a single image to the user's device.
 */
export async function downloadImageFile(url: string, filename: string): Promise<void> {
  try {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For external URLs, attempt fetching blob for seamless direct download
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      }
    } catch {
      // CORS fallback: open download link directly
    }

    // Direct link fallback
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Erro ao baixar imagem:', err);
    throw err;
  }
}

/**
 * Downloads all images from a list sequentially to prevent browser download throttles.
 */
export async function downloadMultipleImages(
  images: { url: string; alt?: string; caption?: string }[],
  baseCode: string,
  onProgress?: (current: number, total: number) => void
): Promise<number> {
  if (!images || images.length === 0) return 0;

  const total = images.length;
  const safeCode = (baseCode || 'LB-IMOVEL').replace(/[^a-zA-Z0-9_-]/g, '_');

  for (let i = 0; i < total; i++) {
    const item = images[i];
    const isPng = item.url.includes('image/png') || item.url.toLowerCase().endsWith('.png');
    const ext = isPng ? 'png' : 'jpg';
    const filename = `${safeCode}-foto-${i + 1}.${ext}`;

    if (onProgress) {
      onProgress(i + 1, total);
    }

    await downloadImageFile(item.url, filename);

    if (total > 1 && i < total - 1) {
      // 300ms pause to ensure device handles sequential downloads smoothly
      await new Promise((resolve) => setTimeout(resolve, 320));
    }
  }

  return total;
}
