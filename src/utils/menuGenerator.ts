// TypeScript definitions
declare global {
    interface Window {
        lucide: {
            createIcons(options?: { elements?: HTMLElement[] }): void;
        }
    }
}

// Helper functions
async function waitForLucide(): Promise<void> {
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

// State management
let menuData = {
    title: "",
    subtitle: "",
    iconName: "",
    prompt: "",
    data: "",
    iconColor: "#000000",
    backgroundColor: "#ffffff",
    isCircular: true,
    isAdvancedMode: false
};

// Interface for menu data
interface MenuDataType {
    title: string;
    subtitle: string;
    iconName: string;
    prompt: string;
    data: string;
    iconColor: string;
    backgroundColor: string;
    isCircular: boolean;
    isAdvancedMode: boolean;
}

// Function to validate icon existence
async function validateIcon(iconName: string): Promise<boolean> {
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
        console.log('Validation result:', { iconName, isValid, svg: svg?.outerHTML });
        
        document.body.removeChild(temp); // Clean up
        return isValid;
    } catch (error) {
        if (temp.parentNode) document.body.removeChild(temp); // Clean up on error
        console.error('Error during validation:', error);
        return false;
    }
}

// Convert SVG to PNG Base64
async function svgToPngBase64(iconName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
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
            svg.style.color = menuData.iconColor;
            
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
                    if (menuData.isCircular) {
                        // Create circular clip path
                        ctx.beginPath();
                        ctx.arc(123/2, 123/2, 123/2, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                    }

                    // Fill background color
                    ctx.fillStyle = menuData.backgroundColor;
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

// Update the preview display
async function updatePreview() {
    const iconToUse = menuData.iconName || 'home';
    console.log('Updating preview with icon:', iconToUse);
    
    const previewHtml = `
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 flex items-center justify-center ${menuData.isCircular ? 'rounded-full' : 'rounded-lg'}"
                 style="background-color: ${menuData.backgroundColor}">
                <i data-lucide="${iconToUse}" class="w-6 h-6"
                   style="color: ${menuData.iconColor}"></i>
            </div>
            <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white">${menuData.title}</h3>
                ${menuData.subtitle ? `<p class="text-sm text-gray-500 dark:text-gray-400">${menuData.subtitle}</p>` : ''}
            </div>
        </div>
    `;

    const menuPreview = document.getElementById('menu-preview');
    if (menuPreview) {
        menuPreview.innerHTML = previewHtml;
        await window.lucide.createIcons({
            elements: [menuPreview]
        });
    }

    // Update output preview based on mode
    const outputPreview = document.getElementById('output-preview');
    if (outputPreview) {
        outputPreview.textContent = getPreviewText(menuData);
    }
}

// Generate preview text
function getPreviewText(menuData: MenuDataType): string {
    if (menuData.isAdvancedMode) {
        return JSON.stringify({
            menu: {
                optionOne: {
                    title: menuData.title,
                    icon: "{base64 icon string...}",
                    sub: menuData.subtitle,
                    data: menuData.data
                }
            }
        }, null, 2);
    }
    
    // Show different placeholder based on whether an icon is selected
    const iconPlaceholder = menuData.iconName 
        ? "{base64 icon string...}"
        : "";
    
    return `BEGIN:VCARD
VERSION:3.0
N;CHARSET=utf-8:${menuData.title || ''};
ORG:${menuData.subtitle || ''};
NOTE:${menuData.data || ''};
PHOTO;ENCODING=b:${iconPlaceholder};
END:VCARD`;
}

// Init function to setup all event listeners
function initShortcutMenu() {
    // DOM Elements
    const menuForm = document.getElementById('menuForm');
    const menuTitleInput = document.getElementById('menu-title');
    const menuSubtitleInput = document.getElementById('menu-subtitle');
    const menuPromptInput = document.getElementById('menu-prompt');
    const menuDataInput = document.getElementById('menu-data');
    const copyButton = document.getElementById('copyButton');
    const downloadButton = document.getElementById('downloadButton');
    const notification = document.getElementById('notification');
    const iconNameInput = document.getElementById('icon-name');
    const addIconButton = document.getElementById('add-icon');
    const iconColorInput = document.getElementById('icon-color');
    const backgroundColorInput = document.getElementById('background-color');
    const bgColorInput = document.getElementById('bg-color');
    const circularMaskToggle = document.getElementById('circular-mask');
    const advancedToggle = document.getElementById('advanced-toggle');

    // Event Listeners
    menuTitleInput?.addEventListener('input', async (e) => {
        menuData.title = (e.target as HTMLInputElement).value;
        await updatePreview();
    });

    menuSubtitleInput?.addEventListener('input', async (e) => {
        menuData.subtitle = (e.target as HTMLInputElement).value;
        await updatePreview();
    });

    menuPromptInput?.addEventListener('input', async (e) => {
        menuData.prompt = (e.target as HTMLInputElement).value;
        await updatePreview();
    });

    menuDataInput?.addEventListener('input', async (e) => {
        menuData.data = (e.target as HTMLInputElement).value;
        await updatePreview();
    });

    iconColorInput?.addEventListener('input', async (e) => {
        menuData.iconColor = (e.target as HTMLInputElement).value;
        await updatePreview();
    });

    backgroundColorInput?.addEventListener('input', async (e) => {
        menuData.backgroundColor = (e.target as HTMLInputElement).value;
        await updatePreview();
    });

    bgColorInput?.addEventListener('input', async (e) => {
        menuData.backgroundColor = (e.target as HTMLInputElement).value;
        await updatePreview();
    });

    circularMaskToggle?.addEventListener('change', async (e) => {
        menuData.isCircular = (e.target as HTMLInputElement).checked;
        await updatePreview();
    });

    advancedToggle?.addEventListener('change', async (e) => {
        menuData.isAdvancedMode = (e.target as HTMLInputElement).checked;
        const mode = menuData.isAdvancedMode ? 'JSON' : 'VCARD';
        if (copyButton) {
            copyButton.textContent = `Copy ${mode}`;
        }
        if (downloadButton) {
            downloadButton.textContent = `Download ${mode}`;
        }
        await updatePreview();
    });

    // Copy button handler
    copyButton?.addEventListener('click', function() {
        if (notification) {
            notification.textContent = "Preparing data...";
            notification.classList.remove('translate-y-full', 'opacity-0');
        }
        
        // Create a function that returns a promise for the data
        const getDataPromise = async () => {
            try {
                const pngBase64 = await svgToPngBase64(menuData.iconName || 'home');
                let outputData;
                
                if (menuData.isAdvancedMode) {
                    outputData = JSON.stringify({
                        menu: {
                            optionOne: {
                                title: menuData.title,
                                icon: pngBase64,
                                sub: menuData.subtitle,
                                data: menuData.data
                            }
                        }
                    }, null, 2);
                } else {
                    outputData = `BEGIN:VCARD\nVERSION:3.0\nN;CHARSET=utf-8:${menuData.title};\nORG:${menuData.subtitle};\nNOTE:${menuData.data};\nPHOTO;ENCODING=b:${pngBase64};\nEND:VCARD`;
                }
                
                // ⚠️ KEY CHANGE: Always use text/plain for MIME type
                return new Blob([outputData], { type: 'text/plain' });
            } catch (err) {
                console.error('Data preparation failed:', err);
                throw err;
            }
        };

        // Pass promise directly to ClipboardItem without awaiting
        navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': getDataPromise() // ⚠️ KEY CHANGE: Always use 'text/plain'
            })
        ])
        .then(() => {
            if (notification) {
                notification.textContent = menuData.isAdvancedMode ? 'JSON copied!' : 'VCARD copied!';
                setTimeout(() => {
                    notification.classList.add('translate-y-full', 'opacity-0');
                }, 3000);
            }
        })
        .catch((err) => {
            console.error('Clipboard write failed:', err);
            if (notification) {
                notification.textContent = 'Could not copy. Please try again.';
                setTimeout(() => {
                    notification.classList.add('translate-y-full', 'opacity-0');
                }, 3000);
            }
        });
    });

    // Download button handler
    downloadButton?.addEventListener('click', async () => {
        try {
            const pngBase64 = await svgToPngBase64(menuData.iconName || 'home');
            let outputData;
            let fileName;
            let mimeType;
            
            if (menuData.isAdvancedMode) {
                const exportData = {
                    menu: {
                        optionOne: {
                            title: menuData.title,
                            icon: pngBase64,
                            sub: menuData.subtitle,
                            data: menuData.data
                        },
                    }
                };
                outputData = JSON.stringify(exportData, null, 2);
                fileName = 'menu-data.json';
                mimeType = 'application/json';
            } else {
                outputData = `BEGIN:VCARD
VERSION:3.0
N;CHARSET=utf-8:${menuData.title};
ORG:${menuData.subtitle};
NOTE:${menuData.data};
PHOTO;ENCODING=b:${pngBase64};
END:VCARD`;
                fileName = 'menu-data.vcf';
                mimeType = 'text/vcard';
            }
            
            const blob = new Blob([outputData], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download:', err);
            alert('Failed to convert data. Please try again.');
        }
    });

    // Icon button handler
    addIconButton?.addEventListener('click', async () => {
        const iconName = (iconNameInput as HTMLInputElement)?.value.trim().toLowerCase();
        if (!iconName) return;
        
        try {
            await waitForLucide(); // Ensure Lucide is ready
            const isValid = await validateIcon(iconName);
            
            if (!isValid) {
                throw new Error(`Icon "${iconName}" not found`);
            }
            
            menuData.iconName = iconName;
            await updatePreview();
            (iconNameInput as HTMLInputElement).value = '';
        } catch (err) {
            console.error('Icon validation failed:', err);
            alert('Icon not found. Please check https://lucide.dev/icons for available icons.');
        }
    });

    // Set initial button states when page loads
    if (copyButton) {
        copyButton.textContent = 'Copy VCARD';
    }
    if (downloadButton) {
        downloadButton.textContent = 'Download VCARD';
    }

    // Initialize the preview
    (async () => {
        await waitForLucide();
        await updatePreview();
    })();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initShortcutMenu);

// Export functions for potential reuse
export { initShortcutMenu, updatePreview, validateIcon, svgToPngBase64 };