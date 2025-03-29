/**
 * File download operations for menu data
 */
import { prepareExportData } from './prepare';

/**
 * Download data as a file
 */
export async function downloadData(): Promise<void> {
    try {
        const { data, fileName, mimeType } = await prepareExportData();
        
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to create download. Please try again.');
    }
}