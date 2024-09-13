import QRCode from 'qrcode';

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const generateBtn = document.getElementById('generateBtn');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadPNGBtn = document.getElementById('downloadPNG');
    const downloadSVGBtn = document.getElementById('downloadSVG');

    const QR_SIZE = 400;
    const PADDING = 16; // 1rem padding on each side
    const QR_BACKGROUND_COLOR = '#f0f0f0';
    const QR_FOREGROUND_COLOR = '#4a0e4e';
    let currentQRText = '';

    // Create empty canvas on page load
    createEmptyCanvas();

    generateBtn.addEventListener('click', () => {
        const text = inputText.value;
        if (text) {
            currentQRText = text;
            generateQRCode(text);
            enableDownloadButtons(true);
        }
    });

    downloadPNGBtn.addEventListener('click', () => downloadQRCode('png'));
    downloadSVGBtn.addEventListener('click', () => downloadQRCode('svg'));

    function createEmptyCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = QR_SIZE;
        canvas.height = QR_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = QR_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);
        qrcodeDiv.innerHTML = '';
        qrcodeDiv.appendChild(canvas);
        qrcodeDiv.style.width = `${QR_SIZE + PADDING * 2}px`;
        qrcodeDiv.style.height = `${QR_SIZE + PADDING * 2}px`;
        qrcodeDiv.style.backgroundColor = QR_BACKGROUND_COLOR;
    }

    function generateQRCode(text) {
        qrcodeDiv.innerHTML = '';
        const canvas = document.createElement('canvas');
        qrcodeDiv.appendChild(canvas);

        QRCode.toCanvas(canvas, text, {
            width: QR_SIZE,
            margin: 1,
            color: {
                dark: QR_FOREGROUND_COLOR,
                light: QR_BACKGROUND_COLOR
            }
        }, (error) => {
            if (error) console.error(error);
            console.log('QR code generated!');
        });
    }

    function enableDownloadButtons(enable) {
        downloadPNGBtn.disabled = !enable;
        downloadSVGBtn.disabled = !enable;
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
            QRCode.toString(currentQRText, {
                type: 'svg',
                width: QR_SIZE,
                margin: 1,
                color: {
                    dark: QR_FOREGROUND_COLOR,
                    light: QR_BACKGROUND_COLOR
                }
            }, (err, svgString) => {
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