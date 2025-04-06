/**
 * Clipboard operations for menu data
 */
import { state, MenuType } from './menuState';
import { svgToPngBase64 } from './icons';

/**
 * Copy data to clipboard
 * Uses the pattern that works reliably across browsers
 */
export function copyToClipboard(notification?: HTMLElement): void {
    if (notification) {
        notification.textContent = "Preparing data...";
        notification.classList.remove('translate-y-full', 'opacity-0');
    }
    
    // Create a function that returns a promise for the data
    const getDataPromise = async () => {
        try {
            let outputData;
            
            if (state.isAdvancedMode) {
                // Generate JSON with actual base64 icons
                const output = { menu: {} as Record<string, any> };
                
                for (let i = 0; i < state.menuItems.length; i++) {
                    const item = state.menuItems[i];
                    
                    // Handle custom image or Lucide icon with error fallback
                    let iconData;
                    try {
                        if (item.customImageData) {
                            // Extract base64 part from custom image data
                            iconData = item.customImageData.replace(/^data:image\/[a-z]+;base64,/, '');
                        } else {
                            // Generate from icon name
                            iconData = await svgToPngBase64(item.iconName || 'home');
                        }
                    } catch (err) {
                        console.warn("Icon conversion failed, using fallback:", err);
                        // Transparent pixel fallback
                        iconData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                    }
                    
                    // Create the menu item object with required fields
                    const menuItem: Record<string, any> = {
                        title: item.title,
                        icon: iconData
                    };
                    
                    // Only add subtitle if it exists and isn't empty
                    if (item.subtitle && item.subtitle.trim()) {
                        menuItem.sub = item.subtitle;
                    }
                    
                    // Only add data if it exists and isn't empty
                    if (item.data && item.data.trim()) {
                        menuItem.data = item.data;
                    }
                    
                    output.menu[`option${i+1}`] = menuItem;
                }
                
                outputData = JSON.stringify(output, null, 2);
            } else {
                // Generate VCARD data with actual base64 icons or simple format
                let vCardOutput = '';
                
                for (const item of state.menuItems) {
                    if (state.menuType === MenuType.ICON) {
                        // Handle custom image or Lucide icon with error fallback
                        let iconData;
                        try {
                            if (item.customImageData) {
                                // Extract base64 part from custom image data
                                iconData = item.customImageData.replace(/^data:image\/[a-z]+;base64,/, '');
                            } else {
                                // Generate from icon name
                                iconData = await svgToPngBase64(item.iconName || 'home');
                            }
                        } catch (err) {
                            console.warn("Icon conversion failed, using fallback:", err);
                            // Transparent pixel fallback
                            iconData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                        }
                        
                        // Icon Menu vCard format
                        vCardOutput += `BEGIN:VCARD
VERSION:3.0
N:${item.title}
ORG:${item.subtitle}`;

                        // Only include NOTE field if data exists and isn't empty
                        if (item.data && item.data.trim()) {
                            vCardOutput += `
NOTE:${item.data}`;
                        }
                        
                        vCardOutput += `
PHOTO;BASE64:${iconData}
END:VCARD

`;
                    } else {
                        // Simple Menu vCard format
                        vCardOutput += `BEGIN:VCARD
VERSION:3.0
N:${item.title}`;

                        // Only include TEL field if subtitle has content
                        if (item.subtitle && item.subtitle.trim()) {
                            // Use the option value if available, otherwise default to CELL
                            const optionType = item.option && item.option.trim() ? item.option : 'CELL';
                            
                            // Remove spaces from subtitle for TEL field
                            const formattedSubtitle = item.subtitle.replace(/\s+/g, '');
                            
                            vCardOutput += `
TEL;TYPE=${optionType}:${formattedSubtitle}`;
                        }

                        // Only include NOTE field if data exists and isn't empty
                        if (item.data && item.data.trim()) {
                            vCardOutput += `
NOTE:${item.data}`;
                        }
                        
                        vCardOutput += `
END:VCARD

`;
                    }
                }
                
                outputData = vCardOutput.trim();
            }
            
            // Always use text/plain for MIME type
            return new Blob([outputData], { type: 'text/plain' });
        } catch (err) {
            console.error('Data preparation failed:', err);
            
            // Even if everything fails, return something that can be copied
            const fallbackMessage = "Menu data conversion failed. Please try again or contact support.";
            return new Blob([fallbackMessage], { type: 'text/plain' });
        }
    };

    // Pass promise directly to ClipboardItem without awaiting
    navigator.clipboard.write([
        new ClipboardItem({
            'text/plain': getDataPromise() // Always use 'text/plain'
        })
    ])
    .then(() => {
        if (notification) {
            notification.textContent = state.isAdvancedMode ? 'JSON copied!' : 'VCARD copied!';
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
}