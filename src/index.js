import QRCode from 'qrcode';

document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const phoneInput = document.getElementById('phoneInput');
    const emailInput = document.getElementById('emailInput');
    const orgInput = document.getElementById('orgInput');
    const urlContainer = document.getElementById('urlContainer');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const vCardText = document.getElementById('vCardText');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadPNGBtn = document.getElementById('downloadPNG');
    const downloadSVGBtn = document.getElementById('downloadSVG');
    const infoToggle = document.getElementById('infoToggle');
    const infoContent = document.getElementById('infoContent');
    const debugToggle = document.getElementById('debugToggle');

    const QR_SIZE = 400;
    const PADDING = 16; // 1rem padding on each side
    const QR_BACKGROUND_COLOR = '#f0f0f0';
    const QR_FOREGROUND_COLOR = '#4a0e4e';
    let currentQRText = '';

    // Create empty canvas on page load
    createEmptyCanvas();

    // Add event listeners for input fields
    [nameInput, phoneInput, emailInput, orgInput].forEach(input => {
        input.addEventListener('input', updateVCardAndQR);
    });

    addUrlBtn.addEventListener('click', addUrlField);
    urlContainer.addEventListener('input', updateVCardAndQR);
    urlContainer.addEventListener('click', handleUrlContainerClick);

    downloadPNGBtn.addEventListener('click', () => downloadQRCode('png'));
    downloadSVGBtn.addEventListener('click', () => downloadQRCode('svg'));

    infoToggle.addEventListener('click', () => {
        infoContent.style.display = infoContent.style.display === 'none' ? 'block' : 'none';
        infoToggle.textContent = infoContent.style.display === 'none' ? 'ℹ️ How it works (click to expand)' : 'ℹ️ How it works (click to collapse)';
    });

    debugToggle.addEventListener('click', () => {
        vCardText.style.display = vCardText.style.display === 'none' ? 'block' : 'none';
        debugToggle.textContent = vCardText.style.display === 'none' ? '🐞 Debug Mode (click to toggle)' : '🐞 Debug Mode (click to hide)';
    });

    function addUrlField() {
        const urlGroup = document.createElement('div');
        urlGroup.className = 'url-group';
        urlGroup.innerHTML = `
            <input type="url" class="urlInput" placeholder="URL">
            <button class="url-btn removeUrlBtn">-</button>
        `;
        urlContainer.appendChild(urlGroup);
        updateVCardAndQR();
    }

    function handleUrlContainerClick(event) {
        if (event.target.classList.contains('removeUrlBtn')) {
            event.target.closest('.url-group').remove();
            updateVCardAndQR();
        }
    }

    function updateVCardAndQR() {
        const name = nameInput.value;
        const phone = phoneInput.value;
        const email = emailInput.value;
        const org = orgInput.value;
        const urls = Array.from(urlContainer.querySelectorAll('.urlInput')).map(input => input.value).filter(Boolean);

        let vCardContent = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (name) vCardContent += `FN:${name}\n`;
        if (phone) vCardContent += `TEL:${phone}\n`;
        if (email) vCardContent += `EMAIL:${email}\n`;
        if (org) vCardContent += `ORG:${org}\n`;
        urls.forEach(url => {
            vCardContent += `URL:${url}\n`;
        });
        vCardContent += 'END:VCARD';

        vCardText.value = vCardContent;
        currentQRText = vCardContent;
        generateQRCode(vCardContent);
        enableDownloadButtons(true);
    }

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