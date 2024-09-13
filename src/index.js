import QRCode from 'qrcode';

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const generateBtn = document.getElementById('generateBtn');
    const qrcodeDiv = document.getElementById('qrcode');

    generateBtn.addEventListener('click', () => {
        const text = inputText.value;
        if (text) {
            // Clear previous QR code
            qrcodeDiv.innerHTML = '';

            // Create a new canvas element
            const canvas = document.createElement('canvas');
            qrcodeDiv.appendChild(canvas);

            QRCode.toCanvas(canvas, text, { width: 200 }, (error) => {
                if (error) console.error(error);
                console.log('QR code generated!');
            });
        }
    });
});