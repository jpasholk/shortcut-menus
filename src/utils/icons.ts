/**
 * Icon handling utilities for the Shortcut Menu application
 */
import { state, getActiveItem } from './menuState';

/**
 * Helper function to wait for Lucide to be available in the DOM
 * @returns Promise that resolves when Lucide is loaded
 */
export async function waitForLucide(): Promise<void> {
    if (window.lucide) return;
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (window.lucide) {
                clearInterval(checkInterval);
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
    
    // Wait for Lucide to be ready
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
            
            // Create temporary div
            const temp = document.createElement('div');
            temp.innerHTML = `<i data-lucide="${iconName}"></i>`;
            document.body.appendChild(temp);
            
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
                document.body.removeChild(temp);
                reject(err);
            };
            
            // Start the conversion
            img.src = svgDataUrl;
            
        } catch (error) {
            console.error('PNG conversion failed:', error);
            reject(error);
        }
    });
}