/**
 * Image processing utilities for the Shortcut Menu application
 */

/**
 * Process image to ensure consistent format (PNG) and reasonable size
 * @param dataUrl Original image data URL
 * @returns Processed image as data URL
 */
export function processImage(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                // Calculate dimensions (maintain aspect ratio, max 200px)
                const MAX_SIZE = 200;
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_SIZE || height > MAX_SIZE) {
                    if (width > height) {
                        height = Math.round(height * (MAX_SIZE / width));
                        width = MAX_SIZE;
                    } else {
                        width = Math.round(width * (MAX_SIZE / height));
                        height = MAX_SIZE;
                    }
                }
                
                // Create canvas and draw image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to PNG data URL
                const pngDataUrl = canvas.toDataURL('image/png');
                resolve(pngDataUrl);
            } catch (err) {
                reject(err);
            }
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
        
        img.src = dataUrl;
    });
}