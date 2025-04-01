/**
 * Icon handling utilities for the Shortcut Menu application
 */
import { state, getActiveItem } from './menuState';

/**
 * Helper function to wait for Lucide to be available in the DOM with timeout
 * @returns Promise that resolves when Lucide is loaded or rejects on timeout
 */
export async function waitForLucide(timeoutMs = 3000): Promise<void> {
    // If Lucide is already available, return immediately
    if (window.lucide) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        // Set a timeout to avoid waiting forever
        const timeout = setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Timeout waiting for Lucide to load'));
        }, timeoutMs);
        
        // Check periodically for Lucide
        const checkInterval = setInterval(() => {
            if (window.lucide) {
                clearInterval(checkInterval);
                clearTimeout(timeout);
                resolve();
            }
        }, 100);
    });
}

/**
 * Validates if an icon exists in the Lucide library
 * @param iconName The name of the icon to validate
 * @returns Promise resolving to true if icon exists, false otherwise
 */
export async function validateIcon(iconName: string): Promise<boolean> {
    if (!iconName) {
        console.log('No icon name provided');
        return false;
    }
    
    try {
        // Wait for Lucide with timeout
        await waitForLucide();
        
        console.log('Starting validation for icon:', iconName);
        
        const temp = document.createElement('div');
        temp.innerHTML = `<i data-lucide="${iconName}"></i>`;
        document.body.appendChild(temp); // Temporarily add to DOM
        
        try {
            await window.lucide.createIcons({
                elements: [temp]
            });
            
            // Check for SVG
            const svg = temp.querySelector('svg');
            const isValid = svg !== null;
            console.log('Validation result:', { iconName, isValid });
            
            document.body.removeChild(temp); // Clean up
            return isValid;
        } catch (error) {
            if (temp.parentNode) document.body.removeChild(temp); // Clean up on error
            console.error('Error during validation:', error);
            return false;
        }
    } catch (error) {
        console.warn('Lucide not available for validation:', error);
        return false; // Can't validate without Lucide
    }
}

/**
 * Converts a Lucide SVG icon to a PNG Base64 string
 * @param iconName The name of the icon to convert
 * @returns Promise resolving to a base64 string of the PNG
 */
export async function svgToPngBase64(iconName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            // Get the active item for styling
            const item = getActiveItem();
            
            try {
                // Wait for Lucide with timeout
                await waitForLucide();
            } catch (error) {
                console.warn('Lucide not available, using fallback icon');
                // Return a simple colored square as fallback
                const fallbackCanvas = document.createElement('canvas');
                fallbackCanvas.width = 123;
                fallbackCanvas.height = 123;
                const ctx = fallbackCanvas.getContext('2d');
                
                if (ctx) {
                    // Draw same size and shape as real icons
                    if (state.isCircular) {
                        ctx.beginPath();
                        ctx.arc(123/2, 123/2, 123/2, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                    }
                    
                    // Fill with background color
                    ctx.fillStyle = item.backgroundColor || '#ffffff';
                    ctx.fillRect(0, 0, 123, 123);
                    
                    // Draw a colored placeholder 
                    ctx.fillStyle = item.iconColor || '#000000';
                    ctx.fillRect(30, 30, 63, 63);
                }
                
                const fallbackBase64 = fallbackCanvas.toDataURL('image/png').replace('data:image/png;base64,', '');
                return resolve(fallbackBase64);
            }
            
            // Continue with normal icon creation if Lucide is available
            // Create temporary div
            const temp = document.createElement('div');
            temp.innerHTML = `<i data-lucide="${iconName}"></i>`;
            document.body.appendChild(temp);
            
            try {
                // Create the Lucide icon
                await window.lucide.createIcons({
                    elements: [temp]
                });
                
                // Get the SVG element
                const svg = temp.querySelector('svg');
                if (!svg) {
                    throw new Error('No SVG found');
                }
                
                // Set SVG dimensions to 92x92
                svg.setAttribute('width', '92');
                svg.setAttribute('height', '92');
                svg.style.color = item.iconColor;
                
                // Convert SVG to data URL
                const svgData = new XMLSerializer().serializeToString(svg);
                const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
                
                // Create Image and Canvas
                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                img.onload = () => {
                    // Set canvas size to 123x123
                    canvas.width = 123;
                    canvas.height = 123;
                    
                    // Fill background
                    if (ctx) {
                        if (state.isCircular) {
                            // Create circular clip path
                            ctx.beginPath();
                            ctx.arc(123/2, 123/2, 123/2, 0, Math.PI * 2);
                            ctx.closePath();
                            ctx.clip();
                        }

                        // Fill background color
                        ctx.fillStyle = item.backgroundColor;
                        ctx.fillRect(0, 0, 123, 123);
                        
                        // Calculate center position for 92x92 icon
                        const x = (123 - 92) / 2; // Center horizontally
                        const y = (123 - 92) / 2; // Center vertically
                        
                        // Draw image centered
                        ctx.drawImage(img, x, y, 92, 92);
                    }
                    
                    // Get base64 PNG and remove the prefix
                    const fullBase64 = canvas.toDataURL('image/png');
                    const base64Only = fullBase64.replace('data:image/png;base64,', '');
                    
                    // Clean up
                    document.body.removeChild(temp);
                    
                    resolve(base64Only);
                };
                
                img.onerror = (err) => {
                    // Clean up on error
                    if (temp.parentNode) document.body.removeChild(temp);
                    reject(err);
                };
                
                // Start the conversion
                img.src = svgDataUrl;
            } catch (error) {
                // Clean up on error
                if (temp.parentNode) document.body.removeChild(temp);
                throw error;
            }
        } catch (error) {
            console.error('PNG conversion failed:', error);
            
            // Return a fallback transparent pixel
            resolve('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
        }
    });
}