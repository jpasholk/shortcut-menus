/**
 * Clipboard operations for menu data
 */
import { state } from './menuState';
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
                    const pngBase64 = await svgToPngBase64(item.iconName || 'home');
                    
                    output.menu[`option${i+1}`] = {
                        title: item.title,
                        icon: pngBase64,
                        sub: item.subtitle,
                        data: item.data
                    };
                }
                
                outputData = JSON.stringify(output, null, 2);
            } else {
                // Generate VCARD data with actual base64 icons
                let vCardOutput = '';
                
                for (const item of state.menuItems) {
                    const pngBase64 = await svgToPngBase64(item.iconName || 'home');
                    
                    vCardOutput += `BEGIN:VCARD
VERSION:3.0
N;CHARSET=utf-8:${item.title};
ORG:${item.subtitle};
NOTE:${item.data};
PHOTO;ENCODING=b:${pngBase64};
END:VCARD
`;
                }
                
                outputData = vCardOutput.trim();
            }
            
            // Always use text/plain for MIME type
            return new Blob([outputData], { type: 'text/plain' });
        } catch (err) {
            console.error('Data preparation failed:', err);
            throw err;
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