const menuToggleBtn = document.getElementById("menuToggleBtn");
const menuCloseBtn = document.getElementById("menuCloseBtn");
const sideMenu = document.getElementById("sideMenu");
const menuBackdrop = document.getElementById("menuBackdrop");

const productCountEl = document.getElementById("dashboardProductCount");
const lowStockCountEl = document.getElementById("dashboardLowStockCount");
const latestAnalysisCountEl = document.getElementById("dashboardLatestAnalysisCount");
const stockTableBody = document.getElementById("dashboardStockTableBody");
const analysisList = document.getElementById("dashboardAnalysisList");
const transactionList = document.getElementById("dashboardTransactionList");

if (menuToggleBtn && sideMenu && menuBackdrop) {
    menuToggleBtn.addEventListener("click", openSideMenu);
    menuBackdrop.addEventListener("click", closeSideMenu);
}

if (menuCloseBtn) {
    menuCloseBtn.addEventListener("click", closeSideMenu);
}

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSideMenu();
    }
});

document.addEventListener("DOMContentLoaded", loadDashboard);

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

async function loadDashboard() {
    await Promise.all([
        loadProducts(),
        loadRecentAnalysis(),
        loadRecentTransactions()
    ]);
}

async function loadProducts() {
    try {
        const products = await fetchJson("/api/inventory/all");
        renderProducts(Array.isArray(products) ? products : []);
    } catch (error) {
        console.error(error);
        if (stockTableBody) {
            stockTableBody.innerHTML = '<tr><td colspan="5" class="empty-cell">재고 데이터를 불러오지 못했습니다.</td></tr>';
        }
        setText(productCountEl, "-");
        setText(lowStockCountEl, "-");
    }
}

async function loadRecentAnalysis() {
    try {
        const items = await fetchJson("/api/analysis/recent");
        renderRecentAnalysis(Array.isArray(items) ? items : []);
    } catch (error) {
        console.error(error);
        if (analysisList) {
            analysisList.innerHTML = '<div class="empty-state">최근 분석 결과를 불러오지 못했습니다.</div>';
        }
        setText(latestAnalysisCountEl, "-");
    }
}

async function loadRecentTransactions() {
    try {
        const items = await fetchJson("/api/stock-transactions/recent");
        renderRecentTransactions(Array.isArray(items) ? items : []);
    } catch (error) {
        console.error(error);
        if (transactionList) {
            transactionList.innerHTML = '<div class="empty-state">최근 처리 기록을 불러오지 못했습니다.</div>';
        }
    }
}

async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`${url} failed: ${response.status}`);
    }
    return response.json();
}

function renderProducts(products) {
    setText(productCountEl, `${products.length}개`);

    const lowCount = products.filter((product) => {
        const currentQty = toNumber(product.currentQty);
        const minQty = toNumber(product.minQty);
        return currentQty < minQty;
    }).length;
    setText(lowStockCountEl, `${lowCount}개`);

    if (!stockTableBody) {
        return;
    }

    if (products.length === 0) {
        stockTableBody.innerHTML = '<tr><td colspan="5" class="empty-cell">등록된 상품이 없습니다.</td></tr>';
        return;
    }

    stockTableBody.innerHTML = products.map((product) => {
        const status = getStockStatus(product);

        return `
            <tr>
                <td>${escapeHtml(product.productId || "-")}</td>
                <td>${escapeHtml(product.name || "-")}</td>
                <td>${toNumber(product.currentQty)}</td>
                <td>${toNumber(product.minQty)}</td>
                <td><span class="stock ${status.className}">${status.label}</span></td>
            </tr>
        `;
    }).join("");
}

function renderRecentAnalysis(items) {
    setText(latestAnalysisCountEl, items.length === 0 ? "없음" : `${items.length}건`);

    if (!analysisList) {
        return;
    }

    if (items.length === 0) {
        analysisList.innerHTML = '<div class="empty-state">최근 분석 결과가 없습니다.</div>';
        return;
    }

    analysisList.innerHTML = items.slice(0, 8).map((item) => {
        const confidence = formatPercent(item.confidence);
        const detectedAt = formatDateTime(item.detectedAt);
        const qty = toNumber(item.detectedQty);

        return `
            <div class="analysis-item">
                <div>
                    <strong>${escapeHtml(item.productName || item.productId || "-")}</strong>
                    <span>신뢰도 ${confidence} · ${detectedAt}</span>
                </div>
                <b>${qty}개</b>
            </div>
        `;
    }).join("");
}

function renderRecentTransactions(items) {
    if (!transactionList) {
        return;
    }

    if (items.length === 0) {
        transactionList.innerHTML = '<div class="empty-state">최근 처리 기록이 없습니다.</div>';
        return;
    }

    transactionList.innerHTML = items.slice(0, 8).map((item) => {
        const action = getActionLabel(item.action);
        const productName = item.productName || item.productId || "-";
        const beforeQty = toNumber(item.beforeQty);
        const afterQty = toNumber(item.afterQty);

        return `
            <div class="log-item">
                <span>${formatTime(item.createdAt)}</span>
                <div>
                    <strong>${action}</strong>
                    <p>${escapeHtml(productName)} ${beforeQty}개 → ${afterQty}개</p>
                </div>
            </div>
        `;
    }).join("");
}

function getStockStatus(product) {
    const currentQty = toNumber(product.currentQty);
    const minQty = toNumber(product.minQty);

    if (currentQty <= 0 || currentQty <= Math.floor(minQty / 2)) {
        return { label: "위험", className: "danger" };
    }

    if (currentQty < minQty) {
        return { label: "부족", className: "warning" };
    }

    return { label: "정상", className: "normal" };
}

function getActionLabel(action) {
    if (action === "ADD") {
        return "입고 반영 완료";
    }
    if (action === "REMOVE") {
        return "반출 반영 완료";
    }
    return "현재 수량 반영 완료";
}

function formatPercent(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
        return "0.0%";
    }
    return `${(numberValue * 100).toFixed(1)}%`;
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value).replace("T", " ").slice(0, 16);
    }
    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatTime(value) {
    if (!value) {
        return "--:--";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value).replace("T", " ").slice(11, 16) || "--:--";
    }
    return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function toNumber(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
}

function setText(element, value) {
    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
