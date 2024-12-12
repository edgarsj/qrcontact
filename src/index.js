import QRCode from "qrcode";
import latinize from 'latinize';
import './styles.css';

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
  const colorToggle = document.getElementById("colorToggle");
  const colorContent = document.getElementById("colorContent");
  const colorSchemes = document.querySelectorAll(".color-scheme");

  const QR_SIZE = getOptimalQRSize();
  const PADDING = 16; // 1rem padding on each side
  let QR_BACKGROUND_COLOR = "#f0f0f0";
  let QR_FOREGROUND_COLOR = "#4a0e4e";
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

  // Toggle sections
  infoToggle.addEventListener("click", () => {
    infoContent.style.display =
      infoContent.style.display === "none" ? "block" : "none";
  });

  colorToggle.addEventListener("click", () => {
    colorContent.style.display =
      colorContent.style.display === "none" ? "block" : "none";
  });

  debugToggle.addEventListener("click", () => {
    vCardText.style.display =
      vCardText.style.display === "none" ? "block" : "none";
  });

  const infoClose = document.getElementById("infoClose");
  infoClose.addEventListener("click", () => {
    infoContent.style.display = "none";
  });

  // Set initial active color scheme
  const setInitialActiveScheme = () => {
    const defaultScheme = document.querySelector(
      `.color-scheme[data-bg="${QR_BACKGROUND_COLOR}"][data-fg="${QR_FOREGROUND_COLOR}"]`
    );
    if (defaultScheme) {
      defaultScheme.classList.add("active");
    }
  };
  setInitialActiveScheme();

  // Handle color scheme selection
  colorSchemes.forEach(scheme => {
    scheme.addEventListener("click", () => {
      // Remove active class from all schemes
      colorSchemes.forEach(s => s.classList.remove("active"));
      // Add active class to selected scheme
      scheme.classList.add("active");

      // Update colors
      QR_BACKGROUND_COLOR = scheme.dataset.bg;
      QR_FOREGROUND_COLOR = scheme.dataset.fg;
      qrcodeDiv.style.backgroundColor = QR_BACKGROUND_COLOR;

      // Regenerate QR code with new colors
      generateQRCode(currentQRText);
    });
  });

  function sanitizeFileName(text) {
    // First transliterate using latinize
    const latinized = latinize(text);

    // Then sanitize the result
    return latinized
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_')         // Replace spaces with underscores
      .replace(/-+/g, '_')          // Replace hyphens with underscores
      .replace(/_+/g, '_')          // Replace multiple underscores with single
      .trim();
  }

  function generateFileName(format) {
    const name = nameInput.value.trim();
    const org = orgInput.value.trim();
    let filename = 'qr_code';

    if (name) {
      filename = sanitizeFileName(name);
      if (org) {
        filename += '_' + sanitizeFileName(org);
      }
    }

    return `${filename}_qr.${format}`;
  }

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
      createEmptyCanvas();
    }
  }

  function createEmptyCanvas() {
    const canvas = document.createElement("canvas");
    const TEXT_HEIGHT = 130; // Space for contact text
    const currentSize = getOptimalQRSize();
    // Include padding in canvas dimensions
    canvas.width = currentSize + (PADDING * 2);
    canvas.height = currentSize + TEXT_HEIGHT + (PADDING * 2);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = QR_BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    qrcodeDiv.innerHTML = "";
    qrcodeDiv.appendChild(canvas);
    qrcodeDiv.style.width = `${currentSize + PADDING * 2}px`;
    qrcodeDiv.style.height = `${currentSize + TEXT_HEIGHT + PADDING * 2}px`;
    qrcodeDiv.style.backgroundColor = QR_BACKGROUND_COLOR;
    // Remove padding from container since it's now part of the canvas
    qrcodeDiv.style.padding = '0';
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
        finalCanvas.width = currentSize + (PADDING * 2);
        finalCanvas.height = currentSize + TEXT_HEIGHT + (PADDING * 2);
        const ctx = finalCanvas.getContext("2d");

        // Draw background
        ctx.fillStyle = QR_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Draw QR code
        ctx.drawImage(tempCanvas, PADDING, PADDING);

        // Draw text
        ctx.fillStyle = QR_FOREGROUND_COLOR;
        ctx.textAlign = "center";
        let y = currentSize + (PADDING * 2);

        const name = nameInput.value;
        if (name) {
          ctx.font = "bold 18px Arial";
          ctx.fillText(name, finalCanvas.width / 2, y + 16);
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
            ctx.fillText(field, finalCanvas.width / 2, y);
            y += 22;
          }
        });

        // Add watermark
        ctx.font = '12px Consolas, "Courier New", monospace';
        // ctx.fillStyle = "#222"; // Dark but not black
        ctx.fillStyle = QR_FOREGROUND_COLOR;
        ctx.textAlign = "right";
        ctx.fillText("cardqr.me", finalCanvas.width - PADDING - 2, finalCanvas.height - PADDING);

        // Replace old canvas with new one
        qrcodeDiv.innerHTML = "";
        qrcodeDiv.appendChild(finalCanvas);
      }
    );
  }

  function enableDownloadButtons(enable) {
    downloadPNGBtn.disabled = !enable;
    downloadSVGBtn.disabled = !enable;
  }

  function downloadQRCode(format) {
    if (!currentQRText) return;

    const filename = generateFileName(format);
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
        }
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