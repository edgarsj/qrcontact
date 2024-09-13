import QRCode from 'qrcode';

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const generateBtn = document.getElementById('generateBtn');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadButtons = document.getElementById('downloadButtons');
    const downloadPNGBtn = document.getElementById('downloadPNG');
    const downloadSVGBtn = document.getElementById('downloadSVG');

    let currentQRText = '';

    generateBtn.addEventListener('click', () => {
        const text = inputText.value;
        if (text) {
            currentQRText = text;
            generateQRCode(text);
            downloadButtons.style.display = 'block';
        }
    });

    downloadPNGBtn.addEventListener('click', () => downloadQRCode('png'));
    downloadSVGBtn.addEventListener('click', () => downloadQRCode('svg'));

    function generateQRCode(text) {
        qrcodeDiv.innerHTML = '';
        const canvas = document.createElement('canvas');
        qrcodeDiv.appendChild(canvas);

        QRCode.toCanvas(canvas, text, { width: 200 }, (error) => {
            if (error) console.error(error);
            console.log('QR code generated!');
        });
    }

    function downloadQRCode(format) {
        if (!currentQRText) return;

        const filename = `qrcode.${format}`;
        const mimeType = format === 'png' ? 'image/png' : 'image/svg+xml';

        if (format === 'png') {
            const canvas = qrcodeDiv.querySelector('canvas');
            if (!canvas) return;

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                downloadFile(url, filename);
                URL.revokeObjectURL(url);
            }, mimeType);
        } else {
            QRCode.toString(currentQRText, { type: 'svg' }, (err, svgString) => {
                if (err) {
                    console.error(err);
                    return;
                }
                const blob = new Blob([svgString], { type: mimeType });
                const url = URL.createObjectURL(blob);
                downloadFile(url, filename);
                URL.revokeObjectURL(url);
            });
        }
    }

    function downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});