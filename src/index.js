import QRCode from "qrcode";

document.addEventListener("DOMContentLoaded", () => {
  function getOptimalQRSize() {
    const screenWidth = window.innerWidth;
    // For mobile devices, make QR code smaller
    if (screenWidth < 480) {
      return 320; // or any other suitable size for mobile
    }
    return 400; // default size for larger screens
  }

  const nameInput = document.getElementById("nameInput");
  const phoneInput = document.getElementById("phoneInput");
  const emailInput = document.getElementById("emailInput");
  const orgInput = document.getElementById("orgInput");
  const titleInput = document.getElementById("titleInput");
  const urlContainer = document.getElementById("urlContainer");
  const addUrlBtn = document.getElementById("addUrlBtn");
  const vCardText = document.getElementById("vCardText");
  const qrcodeDiv = document.getElementById("qrcode");
  const downloadPNGBtn = document.getElementById("downloadPNG");
  const downloadSVGBtn = document.getElementById("downloadSVG");
  const infoToggle = document.getElementById("infoToggle");
  const infoContent = document.getElementById("infoContent");
  const debugToggle = document.getElementById("debugToggle");

  const QR_SIZE = getOptimalQRSize();
  const PADDING = 16; // 1rem padding on each side
  const QR_BACKGROUND_COLOR = "#f0f0f0";
  const QR_FOREGROUND_COLOR = "#4a0e4e";
  let currentQRText = "";

  // Create empty canvas on page load
  createEmptyCanvas();

  // Add event listeners for input fields
  [nameInput, phoneInput, emailInput, orgInput, titleInput].forEach((input) => {
    input.addEventListener("input", updateVCardAndQR);
  });

  addUrlBtn.addEventListener("click", addUrlField);
  urlContainer.addEventListener("input", updateVCardAndQR);
  urlContainer.addEventListener("click", handleUrlContainerClick);

  downloadPNGBtn.addEventListener("click", () => downloadQRCode("png"));
  downloadSVGBtn.addEventListener("click", () => downloadQRCode("svg"));

  // infoToggle.addEventListener('click', () => {
  //     infoContent.style.display = infoContent.style.display === 'none' ? 'block' : 'none';
  //     infoToggle.textContent = infoContent.style.display === 'none' ? 'ℹ️ How it works (click to expand)' : 'ℹ️ How it works (click to collapse)';
  // });

  // debugToggle.addEventListener('click', () => {
  //     vCardText.style.display = vCardText.style.display === 'none' ? 'block' : 'none';
  //     debugToggle.textContent = vCardText.style.display === 'none' ? '🐞 Debug Mode (click to toggle)' : '🐞 Debug Mode (click to hide)';
  // });
  // Replace the existing event listeners for infoToggle and debugToggle with these:

  infoToggle.addEventListener("click", () => {
    infoContent.style.display =
      infoContent.style.display === "none" ? "block" : "none";
  });

  debugToggle.addEventListener("click", () => {
    vCardText.style.display =
      vCardText.style.display === "none" ? "block" : "none";
  });
  function addUrlField() {
    const urlGroup = document.createElement("div");
    urlGroup.className = "url-group";
    urlGroup.innerHTML = `
            <input type="url" class="urlInput" placeholder="URL (homepage or social network link)">
            <button class="url-btn removeUrlBtn">-</button>
        `;
    urlContainer.appendChild(urlGroup);
    updateVCardAndQR();
  }

  function handleUrlContainerClick(event) {
    if (event.target.classList.contains("removeUrlBtn")) {
      event.target.closest(".url-group").remove();
      updateVCardAndQR();
    }
  }

  function updateVCardAndQR() {
    const name = nameInput.value;
    const phone = phoneInput.value;
    const email = emailInput.value;
    const org = orgInput.value;
    const title = titleInput.value;
    const urls = Array.from(urlContainer.querySelectorAll(".urlInput"))
      .map((input) => input.value)
      .filter(Boolean);

    let vCardContent = "";
    if (name) vCardContent += `FN:${name}\n`;
    if (phone) vCardContent += `TEL:${phone}\n`;
    if (email) vCardContent += `EMAIL:${email}\n`;
    if (org) vCardContent += `ORG:${org}\n`;
    if (title) vCardContent += `TITLE: ${title}\n`;
    urls.forEach((url) => {
      vCardContent += `URL:${url}\n`;
    });

    if (vCardContent) {
      vCardContent = "BEGIN:VCARD\nVERSION:3.0\n" + vCardContent + "END:VCARD";
      vCardText.value = vCardContent;
      currentQRText = vCardContent;
      generateQRCode(currentQRText);
      enableDownloadButtons(true);
    } else {
      enableDownloadButtons(false);
      currentQRText = "";
      generateQRCode(currentQRText);
    }
  }

  function createEmptyCanvas() {
    const canvas = document.createElement("canvas");
    const TEXT_HEIGHT = 130; // Space for contact text
    const currentSize = getOptimalQRSize();
    canvas.width = currentSize;
    canvas.height = currentSize + TEXT_HEIGHT;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = QR_BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    qrcodeDiv.innerHTML = "";
    qrcodeDiv.appendChild(canvas);
    qrcodeDiv.style.width = `${currentSize + PADDING * 2}px`;
    qrcodeDiv.style.height = `${currentSize + TEXT_HEIGHT + PADDING * 2}px`;
    qrcodeDiv.style.backgroundColor = QR_BACKGROUND_COLOR;
  }

  function generateQRCode(text) {
    const TEXT_HEIGHT = 130;
    const currentSize = getOptimalQRSize();

    // Create temporary canvas for QR code
    const tempCanvas = document.createElement("canvas");

    QRCode.toCanvas(
      tempCanvas,
      text,
      {
        width: currentSize,
        margin: 1,
        color: {
          dark: QR_FOREGROUND_COLOR,
          light: QR_BACKGROUND_COLOR,
        },
      },
      (error) => {
        if (error) return console.error(error);

        // Create final canvas
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = currentSize;
        finalCanvas.height = currentSize + TEXT_HEIGHT;
        const ctx = finalCanvas.getContext("2d");

        // Draw background
        ctx.fillStyle = QR_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Draw QR code
        ctx.drawImage(tempCanvas, 0, 0);

        // Draw text
        ctx.fillStyle = QR_FOREGROUND_COLOR;
        ctx.textAlign = "center";
        let y = currentSize + PADDING;

        const name = nameInput.value;
        if (name) {
          ctx.font = "bold 18px Arial";
          ctx.fillText(name, currentSize / 2, y + 16);
          y += 44;
        }

        ctx.font = "16px Arial";
        const fields = [
          titleInput.value,
          orgInput.value,
          emailInput.value,
          phoneInput.value,
        ];
        fields.forEach((field) => {
          if (field) {
            ctx.fillText(field, currentSize / 2, y);
            y += 22;
          }
        });

        // Replace old canvas with new one
        qrcodeDiv.innerHTML = "";
        qrcodeDiv.appendChild(finalCanvas);
      },
    );
  }

  function enableDownloadButtons(enable) {
    downloadPNGBtn.disabled = !enable;
    downloadSVGBtn.disabled = !enable;
  }

  function downloadQRCode(format) {
    if (!currentQRText) return;

    const filename = `qrcode.${format}`;
    const mimeType = format === "png" ? "image/png" : "image/svg+xml";

    if (format === "png") {
      const canvas = qrcodeDiv.querySelector("canvas");
      if (!canvas) return;

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        downloadFile(url, filename);
        URL.revokeObjectURL(url);
      }, mimeType);
    } else {
      QRCode.toString(
        currentQRText,
        {
          type: "svg",
          width: QR_SIZE,
          margin: 1,
          color: {
            dark: QR_FOREGROUND_COLOR,
            light: QR_BACKGROUND_COLOR,
          },
        },
        (err, svgString) => {
          if (err) {
            console.error(err);
            return;
          }
          const blob = new Blob([svgString], { type: mimeType });
          const url = URL.createObjectURL(blob);
          downloadFile(url, filename);
          URL.revokeObjectURL(url);
        },
      );
    }
  }

  function downloadFile(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});
