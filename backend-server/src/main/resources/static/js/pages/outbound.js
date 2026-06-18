const outboundModalOverlay = document.getElementById("outboundModalOverlay");
const openOutboundModalBtn = document.getElementById("openOutboundModalBtn");
const openOutboundModalBtn2 = document.getElementById("openOutboundModalBtn2");
const closeOutboundModalBtn = document.getElementById("closeOutboundModalBtn");
const cancelOutboundBtn = document.getElementById("cancelOutboundBtn");
const outboundForm = document.getElementById("outboundForm");
const outboundTableBody = document.querySelector(".outbound-table-card tbody");
const outboundSummaryValues = document.querySelectorAll(".outbound-chip strong");

const outboundSearchInput = document.getElementById("outboundSearchInput");
const outboundCategoryFilter = document.getElementById("outboundCategoryFilter");
const outboundStatusFilter = document.getElementById("outboundStatusFilter");
const outboundSearchBtn = document.getElementById("outboundSearchBtn");

let outboundProducts = [];
let outboundTransactions = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadOutboundProducts();
    await loadOutboundTransactions();
});

function openOutboundModal() {
    if (!outboundModalOverlay) {
        return;
    }

    setCurrentDateTime(outboundForm?.querySelector("input[name='outboundDate']"));
    outboundModalOverlay.classList.add("open");
}

function closeOutboundModal() {
    outboundModalOverlay?.classList.remove("open");
    outboundForm?.reset();
}

openOutboundModalBtn?.addEventListener("click", openOutboundModal);
openOutboundModalBtn2?.addEventListener("click", openOutboundModal);
closeOutboundModalBtn?.addEventListener("click", closeOutboundModal);
cancelOutboundBtn?.addEventListener("click", closeOutboundModal);

outboundModalOverlay?.addEventListener("click", (event) => {
    if (event.target === outboundModalOverlay) {
        closeOutboundModal();
    }
});

outboundForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productId = outboundForm.querySelector("select[name='productId']").value;
    const quantity = Number(outboundForm.querySelector("input[name='outboundQty']").value);
    const memo = outboundForm.querySelector("input[name='destination']").value;
    const createdAt = outboundForm.querySelector("input[name='outboundDate']").value;

    if (!productId) {
        alert("상품을 선택해주세요.");
        return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        alert("반출 수량을 입력해주세요.");
        return;
    }

    try {
        const response = await fetch("/api/stock-transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId,
                action: "REMOVE",
                quantity,
                memo,
                createdAt: createdAt || null
            })
        });

        if (!response.ok) {
            throw new Error(`Outbound save failed: ${response.status}`);
        }

        closeOutboundModal();
        await loadOutboundProducts();
        await loadOutboundTransactions();
        alert("반출이 DB에 저장되었습니다.");
    } catch (error) {
        console.error(error);
        alert("반출 저장에 실패했습니다. 서버 로그를 확인해주세요.");
    }
});

outboundSearchBtn?.addEventListener("click", renderOutboundTransactions);
outboundSearchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        renderOutboundTransactions();
    }
});

async function loadOutboundProducts() {
    const response = await fetch("/api/inventory/all", { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Products load failed: ${response.status}`);
    }

    outboundProducts = await response.json();
    renderProductOptions();
    renderCategoryOptions();
}

async function loadOutboundTransactions() {
    const response = await fetch("/api/stock-transactions?action=REMOVE", { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Outbound list failed: ${response.status}`);
    }

    outboundTransactions = await response.json();
    renderOutboundTransactions();
}

function renderProductOptions() {
    const select = outboundForm?.querySelector("select[name='productId']");
    if (!select) {
        return;
    }

    select.innerHTML = '<option value="">상품을 선택하세요</option>' + outboundProducts.map((product) => `
        <option value="${escapeHtml(product.productId)}">
            ${escapeHtml(product.name)} (현재 재고: ${toNumber(product.currentQty)})
        </option>
    `).join("");
}

function renderCategoryOptions() {
    if (!outboundCategoryFilter) {
        return;
    }

    const categories = [...new Set(outboundProducts.map((product) => product.category).filter(Boolean))];
    outboundCategoryFilter.innerHTML = '<option value="all">전체</option>' + categories.map((category) => `
        <option value="${escapeHtml(category)}">${escapeHtml(category)}</option>
    `).join("");
}

function renderOutboundTransactions() {
    if (!outboundTableBody) {
        return;
    }

    const rows = filterTransactions(outboundTransactions, {
        keyword: outboundSearchInput?.value || "",
        category: outboundCategoryFilter?.value || "all"
    });

    updateSummary(rows);

    if (rows.length === 0) {
        outboundTableBody.innerHTML = '<tr><td colspan="9">반출 이력이 없습니다.</td></tr>';
        return;
    }

    outboundTableBody.innerHTML = rows.map((item) => {
        const product = findProduct(item.productId);
        return `
            <tr>
                <td><input type="checkbox"></td>
                <td>OUT-${String(item.transactionId || 0).padStart(4, "0")}</td>
                <td>${escapeHtml(item.productName || "-")}</td>
                <td>${escapeHtml(product?.category || "-")}</td>
                <td>${toNumber(item.quantity)}</td>
                <td>${escapeHtml(item.memo || "-")}</td>
                <td>${formatDateTime(item.createdAt)}</td>
                <td><span class="outbound-status confirmed">처리 완료</span></td>
                <td><div class="row-actions"><button type="button">조회</button></div></td>
            </tr>
        `;
    }).join("");
}

function updateSummary(rows) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayRows = rows.filter((item) => String(item.createdAt || "").slice(0, 10) === todayKey);
    const totalQty = rows.reduce((sum, item) => sum + toNumber(item.quantity), 0);
    const latest = rows[0]?.createdAt ? formatTime(rows[0].createdAt) : "-";

    setSummary(0, todayRows.length);
    setSummary(1, totalQty);
    setSummary(2, 0);
    setSummary(3, latest);
}

function filterTransactions(items, filters) {
    const keyword = filters.keyword.trim().toLowerCase();
    return items.filter((item) => {
        const product = findProduct(item.productId);
        const haystack = `${item.transactionId} ${item.productName} ${item.memo}`.toLowerCase();
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesCategory = filters.category === "all" || product?.category === filters.category;
        return matchesKeyword && matchesCategory;
    });
}

function findProduct(productId) {
    return outboundProducts.find((product) => product.productId === productId);
}

function setCurrentDateTime(input) {
    if (!input) {
        return;
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    input.value = now.toISOString().slice(0, 16);
}

function setSummary(index, value) {
    if (outboundSummaryValues[index]) {
        outboundSummaryValues[index].textContent = String(value);
    }
}

function toNumber(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }
    return String(value).replace("T", " ").slice(0, 16);
}

function formatTime(value) {
    return formatDateTime(value).slice(11, 16) || "-";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
