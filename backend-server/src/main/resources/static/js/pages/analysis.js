const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const previewText = document.getElementById("previewText");
const imageAnalyzeBtn = document.getElementById("imageAnalyzeBtn");
const resetImageBtn = document.getElementById("resetImageBtn");
const resetResultBtn = document.getElementById("resetResultBtn");

const cameraVideo = document.getElementById("cameraVideo");
const captureCanvas = document.getElementById("captureCanvas");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const cameraArea = document.getElementById("cameraArea");
const startCameraBtn = document.getElementById("startCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const stopCameraBtn = document.getElementById("stopCameraBtn");

const liveDot = document.getElementById("liveDot");
const liveStatusText = document.getElementById("liveStatusText");
const inputModeText = document.getElementById("inputModeText");
const processStatusText = document.getElementById("processStatusText");
const cameraPermissionText = document.getElementById("cameraPermissionText");
const fastApiStatusText = document.getElementById("fastApiStatusText");

const detectedTypeCount = document.getElementById("detectedTypeCount");
const detectedTotalCount = document.getElementById("detectedTotalCount");
const resultList = document.getElementById("resultList");
const resultTableBody = document.getElementById("resultTableBody");
const rawJson = document.getElementById("rawJson");
const logList = document.getElementById("logList");
const stockList = document.getElementById("stockList");
const transactionList = document.getElementById("transactionList");
const saveResultBtn = document.getElementById("saveResultBtn");
const mobileSaveResultBtn = document.getElementById("mobileSaveResultBtn");
const workerItemName = document.getElementById("workerItemName");
const workerItemCount = document.getElementById("workerItemCount");
const workerModeButtons = document.querySelectorAll(".worker-mode-btn");
const goLiveBtn = document.getElementById("goLiveBtn");
const navLinks = document.querySelectorAll(".nav a");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const menuCloseBtn = document.getElementById("menuCloseBtn");
const sideMenu = document.getElementById("sideMenu");
const menuBackdrop = document.getElementById("menuBackdrop");

let cameraStream = null;
let latestSignature = "";
let latestResult = { detections: [] };
let resultHistory = [];
const resultHistoryKeys = new Set();
let selectedAction = localStorage.getItem("lumaActionMode") || "ADD";
const UPLOAD_MAX_SIZE = 1920;
const UPLOAD_JPEG_QUALITY = 0.92;

setActionMode(selectedAction);
loadInventory();
loadTransactions();

if (imageInput) {
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];

        if (!file) {
            resetImagePreview();
            return;
        }

        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";
        previewText.style.display = "none";
        inputModeText.textContent = "Image upload";
        processStatusText.textContent = "Image selected";
        addLog("IMAGE", `Selected ${file.name}`);
    });
}

if (imageAnalyzeBtn) {
    imageAnalyzeBtn.addEventListener("click", async () => {
        const file = imageInput.files[0];

        if (!file) {
            alert("먼저 이미지를 선택해주세요.");
            return;
        }

        await analyzeFile(await prepareImageFile(file));
    });
}

if (resetImageBtn) {
    resetImageBtn.addEventListener("click", resetImagePreview);
}

if (resetResultBtn) {
    resetResultBtn.addEventListener("click", () => {
        resetImagePreview();
        renderResult({ detections: [] });
        showResultImage("");
        rawJson.textContent = "{}";
        latestResult = { detections: [] };
        resultHistory = [];
        resultHistoryKeys.clear();
        processStatusText.textContent = "Ready";
        fastApiStatusText.textContent = "Waiting";
        fastApiStatusText.className = "neutral";
        latestSignature = "";
        addLog("RESET", "Result view reset");
    });
}

if (startCameraBtn) {
    startCameraBtn.addEventListener("click", async () => {
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false,
            });

            cameraVideo.srcObject = cameraStream;
            cameraPlaceholder.style.display = "none";
            cameraArea.classList.add("active");
            liveDot.classList.add("active");
            liveStatusText.textContent = "Camera running";
            inputModeText.textContent = "Camera frame";

            cameraPermissionText.textContent = "Allowed";
            cameraPermissionText.classList.remove("neutral", "danger");
            cameraPermissionText.classList.add("success");

            startCameraBtn.textContent = "Running";
            startCameraBtn.disabled = true;
            addLog("CAMERA", "Camera started");
        } catch (error) {
            console.error(error);
            cameraPermissionText.textContent = "Blocked";
            cameraPermissionText.classList.remove("neutral", "success");
            cameraPermissionText.classList.add("danger");
            alert("카메라 실행이 차단되었습니다. 휴대폰에서는 이미지 업로드 촬영을 사용하세요.");
            addLog("CAMERA", "Camera permission blocked");
        }
    });
}

if (captureBtn) {
    captureBtn.addEventListener("click", async () => {
        if (!cameraStream) {
            alert("먼저 카메라를 시작하거나 아래 이미지 업로드를 사용해주세요.");
            return;
        }

        const sourceWidth = cameraVideo.videoWidth || UPLOAD_MAX_SIZE;
        const sourceHeight = cameraVideo.videoHeight || UPLOAD_MAX_SIZE;
        const scale = Math.min(UPLOAD_MAX_SIZE / sourceWidth, UPLOAD_MAX_SIZE / sourceHeight, 1);
        const targetWidth = Math.round(sourceWidth * scale);
        const targetHeight = Math.round(sourceHeight * scale);

        captureCanvas.width = targetWidth;
        captureCanvas.height = targetHeight;

        const context = captureCanvas.getContext("2d");
        context.drawImage(cameraVideo, 0, 0, targetWidth, targetHeight);

        const blob = await new Promise((resolve) => {
            captureCanvas.toBlob(resolve, "image/jpeg", UPLOAD_JPEG_QUALITY);
        });

        if (!blob) {
            alert("현재 프레임을 캡처하지 못했습니다.");
            return;
        }

        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
        addLog("CAPTURE", `${sourceWidth}x${sourceHeight} -> ${targetWidth}x${targetHeight}, ${formatBytes(file.size)}`);
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";
        previewText.style.display = "none";
        inputModeText.textContent = "Camera frame";
        await analyzeFile(file);
    });
}

if (stopCameraBtn) {
    stopCameraBtn.addEventListener("click", () => {
        if (!cameraStream) {
            alert("현재 실행 중인 카메라가 없습니다.");
            return;
        }

        stopCamera();
        addLog("CAMERA", "Camera stopped");
    });
}

if (saveResultBtn) {
    saveResultBtn.addEventListener("click", async () => {
        await saveLatestResult(saveResultBtn);
    });
}

if (mobileSaveResultBtn) {
    mobileSaveResultBtn.addEventListener("click", async () => {
        await saveLatestResult(mobileSaveResultBtn);
    });
}

workerModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setActionMode(button.dataset.action);
    });
});

if (goLiveBtn) {
    goLiveBtn.addEventListener("click", () => {
        location.href = "#live";
        if (!cameraStream && startCameraBtn) {
            startCameraBtn.click();
        }
    });
}

if (menuToggleBtn && sideMenu && menuBackdrop) {
    menuToggleBtn.addEventListener("click", openSideMenu);
    menuBackdrop.addEventListener("click", closeSideMenu);
}

if (menuCloseBtn) {
    menuCloseBtn.addEventListener("click", closeSideMenu);
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
    });
});

window.addEventListener("beforeunload", () => {
    if (cameraStream) {
        stopCamera();
    }
});

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSideMenu();
    }
});

setInterval(loadLatestResult, 2000);
setInterval(loadInventory, 3000);
setInterval(loadTransactions, 5000);

function openSideMenu() {
    sideMenu.hidden = false;
    menuBackdrop.hidden = false;
    sideMenu.classList.add("open");
    menuBackdrop.classList.add("open");
    sideMenu.setAttribute("aria-hidden", "false");
}

function closeSideMenu() {
    if (!sideMenu || !menuBackdrop) {
        return;
    }

    sideMenu.classList.remove("open");
    menuBackdrop.classList.remove("open");
    sideMenu.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
        if (!sideMenu.classList.contains("open")) {
            sideMenu.hidden = true;
            menuBackdrop.hidden = true;
        }
    }, 240);
}

async function analyzeFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    addLog("REQUEST", `Sending ${file.name} to Spring Boot`);

    try {
        const response = await fetch("/api/analysis/detect", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        applyResult(data, "SUCCESS", "YOLO result received");
    } catch (error) {
        console.error(error);
        processStatusText.textContent = "Analysis failed";
        fastApiStatusText.textContent = "Failed";
        fastApiStatusText.className = "danger";
        rawJson.textContent = String(error);
        addLog("ERROR", String(error));
        alert("FastAPI 연결 또는 분석 처리에 실패했습니다.");
    } finally {
        setLoading(false);
    }
}

async function prepareImageFile(file) {
    if (!file.type.startsWith("image/")) {
        return file;
    }

    return resizeImageFile(file, UPLOAD_MAX_SIZE, UPLOAD_JPEG_QUALITY);
}

function resizeImageFile(file, maxSize, quality) {
    return new Promise((resolve) => {
        const image = new Image();
        const imageUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(imageUrl);

            const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
            const width = Math.round(image.width * scale);
            const height = Math.round(image.height * scale);

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file);
                    return;
                }

                const resized = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                    type: "image/jpeg",
                });

                addLog("RESIZE", `${formatBytes(file.size)} -> ${formatBytes(resized.size)}`);
                resolve(resized);
            }, "image/jpeg", quality);
        };

        image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            resolve(file);
        };

        image.src = imageUrl;
    });
}

async function loadLatestResult() {
    try {
        const response = await fetch("/api/analysis/latest", { cache: "no-store" });
        if (!response.ok) {
            return;
        }

        const data = await response.json();
        if (!data.detections || data.detections.length === 0) {
            return;
        }

        const signature = JSON.stringify(data.detections.map((item) => [
            item.item_name || item.itemName,
            item.count,
            item.confidence,
            item.image_filename || item.imageFilename,
            item.analyzed_at || item.analyzedAt,
        ]));

        if (signature !== latestSignature) {
            applyResult(data, "SYNC", "Latest result synced from server");
            await loadInventory();
            await loadTransactions();
        }
    } catch (error) {
        // Keep polling quiet during server restarts.
    }
}

function applyResult(data, logType, logMessage) {
    latestResult = data;
    renderResult(data);
    showResultImage(getResultImage(data));
    processStatusText.textContent = "Analysis complete";
    fastApiStatusText.textContent = "OK";
    fastApiStatusText.className = "success";
    latestSignature = JSON.stringify((data.detections || []).map((item) => [
        item.item_name || item.itemName,
        item.count,
        item.confidence,
        item.image_filename || item.imageFilename,
        item.analyzed_at || item.analyzedAt,
    ]));
    addLog(logType, logMessage);
}

function setLoading(isLoading) {
    imageAnalyzeBtn.disabled = isLoading;
    captureBtn.disabled = isLoading;
    imageAnalyzeBtn.textContent = isLoading ? "분석 중..." : "이미지 분석";
    processStatusText.textContent = isLoading ? "FastAPI 호출 중..." : processStatusText.textContent;
}

function renderResult(data) {
    const detections = data.detections || [];
    const totalCount = detections.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const first = detections[0];

    detectedTypeCount.textContent = detections.length;
    detectedTotalCount.textContent = totalCount;
    rawJson.textContent = JSON.stringify(data, null, 2);
    workerItemName.textContent = first ? first.item_name || first.itemName || "-" : "분석 전";
    workerItemCount.textContent = totalCount;

    if (detections.length === 0) {
        resultList.innerHTML = `
            <div class="result-item">
                <div>
                    <strong>No detections</strong>
                    <span>인식된 품목이 없습니다.</span>
                </div>
                <b>0개</b>
            </div>
        `;
        renderResultHistory();
        return;
    }

    resultList.innerHTML = detections.map((item) => {
        const itemName = item.item_name || item.itemName || "-";
        const imageName = item.image_filename || item.imageFilename || "-";
        const analyzedAt = item.analyzed_at || item.analyzedAt || "-";

        return `
            <div class="result-item">
                <div>
                    <strong>${escapeHtml(itemName)}</strong>
                    <span>신뢰도 ${formatConfidence(item.confidence)} / ${escapeHtml(imageName)}</span>
                    <span>${escapeHtml(analyzedAt)}</span>
                </div>
                <b>${Number(item.count || 0)}개</b>
            </div>
        `;
    }).join("");

    appendResultHistory(detections);
    renderResultHistory();
}

function appendResultHistory(detections) {
    detections.forEach((item) => {
        const itemName = item.item_name || item.itemName || "-";
        const imageName = item.image_filename || item.imageFilename || "-";
        const analyzedAt = item.analyzed_at || item.analyzedAt || "-";
        const key = [itemName, item.count, item.confidence, imageName, analyzedAt].join("|");

        if (resultHistoryKeys.has(key)) {
            return;
        }

        resultHistoryKeys.add(key);
        resultHistory.unshift({
            itemName,
            count: Number(item.count || 0),
            confidence: item.confidence,
            imageName,
            analyzedAt,
        });
    });

    if (resultHistory.length > 50) {
        const removed = resultHistory.splice(50);
        removed.forEach((item) => {
            resultHistoryKeys.delete([item.itemName, item.count, item.confidence, item.imageName, item.analyzedAt].join("|"));
        });
    }
}

function renderResultHistory() {
    if (!resultHistory.length) {
        resultTableBody.innerHTML = `<tr><td colspan="5">아직 분석 결과가 없습니다.</td></tr>`;
        return;
    }

    resultTableBody.innerHTML = resultHistory.map((item) => `
        <tr>
            <td>${escapeHtml(item.itemName)}</td>
            <td>${item.count}개</td>
            <td>${formatConfidence(item.confidence)}</td>
            <td>${escapeHtml(item.imageName)}</td>
            <td>${escapeHtml(item.analyzedAt)}</td>
        </tr>
    `).join("");
}

async function saveLatestResult(button) {
    if (!latestResult.detections || latestResult.detections.length === 0) {
        alert("저장할 분석 결과가 없습니다.");
        return;
    }

    button.disabled = true;
    processStatusText.textContent = "Saving result...";

    try {
        const response = await fetch(`/api/analysis/save-latest?action=${encodeURIComponent(selectedAction)}`, {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

            await response.json();
            processStatusText.textContent = "Inventory updated";
            addLog("SAVE", `Saved latest result with ${selectedAction} mode`);
            await loadInventory();
            await loadTransactions();
            alert("재고에 반영했습니다.");
    } catch (error) {
        console.error(error);
        processStatusText.textContent = "Save failed";
        addLog("ERROR", String(error));
        alert("재고 반영에 실패했습니다. 상품명이 등록되어 있는지 확인하세요.");
    } finally {
        button.disabled = false;
    }
}

async function loadInventory() {
    if (!stockList) {
        return;
    }

    try {
        const response = await fetch("/api/inventory/all", { cache: "no-store" });
        if (!response.ok) {
            return;
        }

        const products = await response.json();
        if (!products.length) {
            stockList.innerHTML = `
                <div class="stock-item">
                    <span>상품 없음</span>
                    <b>0개</b>
                </div>
            `;
            return;
        }

        stockList.innerHTML = products.map((product) => `
            <div class="stock-item">
                <span>${escapeHtml(product.name || product.productId || "-")}</span>
                <b>${Number(product.currentQty || 0)}개</b>
                <em>${escapeHtml(product.status || "-")}</em>
            </div>
        `).join("");
    } catch (error) {
        // Keep inventory refresh quiet while the server is starting.
    }
}

async function loadTransactions() {
    if (!transactionList) {
        return;
    }

    try {
        const response = await fetch("/api/stock-transactions/recent", { cache: "no-store" });
        if (!response.ok) {
            return;
        }

        const transactions = await response.json();
        if (!transactions.length) {
            transactionList.innerHTML = `
                <div class="transaction-item">
                    <span>READY</span>
                    <div>
                        <strong>아직 처리 이력이 없습니다.</strong>
                        <p>인식 결과를 재고에 반영하면 이곳에 기록됩니다.</p>
                    </div>
                </div>
            `;
            return;
        }

        transactionList.innerHTML = transactions.slice(0, 8).map((item) => {
            const action = formatAction(item.action);
            const productName = item.productName || item.productId || "-";
            const quantity = Number(item.quantity || 0);
            const beforeQty = Number(item.beforeQty || 0);
            const afterQty = Number(item.afterQty || 0);
            const createdAt = item.createdAt ? String(item.createdAt).replace("T", " ").slice(0, 19) : "-";

            return `
                <div class="transaction-item">
                    <span>${escapeHtml(action)}</span>
                    <div>
                        <strong>${escapeHtml(productName)} ${quantity}개</strong>
                        <p>${beforeQty}개 → ${afterQty}개 · ${escapeHtml(createdAt)}</p>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        // Keep transaction refresh quiet while the server is starting.
    }
}

function formatAction(action) {
    switch ((action || "").toUpperCase()) {
        case "ADD":
            return "입고";
        case "REMOVE":
            return "반출";
        case "SET":
            return "현재";
        default:
            return action || "-";
    }
}

function setActionMode(action) {
    selectedAction = action || "ADD";
    localStorage.setItem("lumaActionMode", selectedAction);

    workerModeButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.action === selectedAction);
    });
}

function getResultImage(data) {
    const first = (data.detections || [])[0];
    if (!first) {
        return "";
    }

    const base64Image = first.result_image_base64 || first.resultImageBase64;
    if (base64Image) {
        return base64Image;
    }

    const imageUrl = first.result_image_url || first.resultImageUrl;
    if (!imageUrl) {
        return "";
    }

    return `/api/analysis/result-image?path=${encodeURIComponent(imageUrl)}`;
}

function showResultImage(src) {
    let image = document.getElementById("resultImageView");

    if (!src) {
        if (image) {
            image.remove();
        }
        cameraPlaceholder.style.display = "flex";
        return;
    }

    if (!image) {
        image = document.createElement("img");
        image.id = "resultImageView";
        image.alt = "YOLO 분석 결과 이미지";
        image.className = "result-image-view";
        cameraArea.appendChild(image);
    }

    image.src = src;
    cameraVideo.srcObject = null;
    cameraPlaceholder.style.display = "none";
    cameraArea.classList.add("active");
    liveDot.classList.add("active");
    liveStatusText.textContent = "YOLO result displayed";
}

function formatConfidence(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "-";
    }

    return `${(Number(value) * 100).toFixed(1)}%`;
}

function resetImagePreview() {
    imageInput.value = "";
    previewImage.src = "";
    previewImage.style.display = "none";
    previewText.style.display = "block";
    previewText.textContent = "선택된 이미지가 없습니다.";
    processStatusText.textContent = "Ready";
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
    }

    cameraStream = null;
    cameraVideo.srcObject = null;
    cameraPlaceholder.style.display = "flex";
    cameraArea.classList.remove("active");
    liveDot.classList.remove("active");
    liveStatusText.textContent = "Camera stopped";
    startCameraBtn.textContent = "카메라 시작";
    startCameraBtn.disabled = false;
}

function addLog(type, message) {
    const item = document.createElement("div");
    item.className = "log-item";
    item.innerHTML = `
        <span>${escapeHtml(type)}</span>
        <div>
            <strong>${new Date().toLocaleTimeString()}</strong>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    logList.prepend(item);
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) {
        return "-";
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)}KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}
