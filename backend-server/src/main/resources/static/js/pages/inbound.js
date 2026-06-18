const inboundModalOverlay = document.getElementById("inboundModalOverlay");
const openInboundModalBtn = document.getElementById("openInboundModalBtn");
const openInboundModalBtn2 = document.getElementById("openInboundModalBtn2");
const closeInboundModalBtn = document.getElementById("closeInboundModalBtn");
const cancelInboundBtn = document.getElementById("cancelInboundBtn");
const inboundForm = document.getElementById("inboundForm");
const inboundTableBody = document.querySelector(".inbound-table-card tbody");
const inboundSummaryValues = document.querySelectorAll(".inbound-chip strong");

const inboundSearchInput = document.getElementById("inboundSearchInput");
const inboundCategoryFilter = document.getElementById("inboundCategoryFilter");
const inboundStatusFilter = document.getElementById("inboundStatusFilter");
const inboundSearchBtn = document.getElementById("inboundSearchBtn");

let inboundProducts = [];
let inboundTransactions = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadInboundProducts();
    await loadInboundTransactions();
});

function openInboundModal() {
    if (!inboundModalOverlay) {
        return;
    }

    setCurrentDateTime(inboundForm?.querySelector("input[name='inboundDate']"));
    inboundModalOverlay.classList.add("open");
}

function closeInboundModal() {
    inboundModalOverlay?.classList.remove("open");
    inboundForm?.reset();
}

openInboundModalBtn?.addEventListener("click", openInboundModal);
openInboundModalBtn2?.addEventListener("click", openInboundModal);
closeInboundModalBtn?.addEventListener("click", closeInboundModal);
cancelInboundBtn?.addEventListener("click", closeInboundModal);

inboundModalOverlay?.addEventListener("click", (event) => {
    if (event.target === inboundModalOverlay) {
        closeInboundModal();
    }
});

inboundForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productId = inboundForm.querySelector("select[name='productId']").value;
    const quantity = Number(inboundForm.querySelector("input[name='inboundQty']").value);
    const memo = inboundForm.querySelector("input[name='supplier']").value;
    const createdAt = inboundForm.querySelector("input[name='inboundDate']").value;

    if (!productId) {
        alert("상품을 선택해주세요.");
        return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        alert("반입 수량을 입력해주세요.");
        return;
    }

    try {
        const response = await fetch("/api/stock-transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId,
                action: "ADD",
                quantity,
                memo,
                createdAt: createdAt || null
            })
        });

        if (!response.ok) {
            throw new Error(`Inbound save failed: ${response.status}`);
        }

        closeInboundModal();
        await loadInboundProducts();
        await loadInboundTransactions();
        alert("반입이 DB에 저장되었습니다.");
    } catch (error) {
        console.error(error);
        alert("반입 저장에 실패했습니다. 서버 로그를 확인해주세요.");
    }
});

inboundSearchBtn?.addEventListener("click", renderInboundTransactions);
inboundSearchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        renderInboundTransactions();
    }
});

async function loadInboundProducts() {
    const response = await fetch("/api/inventory/all", { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Products load failed: ${response.status}`);
    }

    inboundProducts = await response.json();
    renderProductOptions();
    renderCategoryOptions();
}

async function loadInboundTransactions() {
    const response = await fetch("/api/stock-transactions?action=ADD", { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Inbound list failed: ${response.status}`);
    }

    inboundTransactions = await response.json();
    renderInboundTransactions();
}

function renderProductOptions() {
    const select = inboundForm?.querySelector("select[name='productId']");
    if (!select) {
        return;
    }

    select.innerHTML = '<option value="">상품을 선택하세요</option>' + inboundProducts.map((product) => `
        <option value="${escapeHtml(product.productId)}">
            ${escapeHtml(product.name)} (현재 재고: ${toNumber(product.currentQty)})
        </option>
    `).join("");
}

function renderCategoryOptions() {
    if (!inboundCategoryFilter) {
        return;
    }

    const categories = [...new Set(inboundProducts.map((product) => product.category).filter(Boolean))];
    inboundCategoryFilter.innerHTML = '<option value="all">전체</option>' + categories.map((category) => `
        <option value="${escapeHtml(category)}">${escapeHtml(category)}</option>
    `).join("");
}

function renderInboundTransactions() {
    if (!inboundTableBody) {
        return;
    }

    const rows = filterTransactions(inboundTransactions, {
        keyword: inboundSearchInput?.value || "",
        category: inboundCategoryFilter?.value || "all"
    });

    updateSummary(rows);

    if (rows.length === 0) {
        inboundTableBody.innerHTML = '<tr><td colspan="9">반입 이력이 없습니다.</td></tr>';
        return;
    }

    inboundTableBody.innerHTML = rows.map((item) => {
        const product = findProduct(item.productId);
        return `
            <tr>
                <td><input type="checkbox"></td>
                <td>IN-${String(item.transactionId || 0).padStart(4, "0")}</td>
                <td>${escapeHtml(item.productName || "-")}</td>
                <td>${escapeHtml(product?.category || "-")}</td>
                <td>${toNumber(item.quantity)}</td>
                <td>${escapeHtml(item.memo || "-")}</td>
                <td>${formatDateTime(item.createdAt)}</td>
                <td><span class="inbound-status confirmed">처리 완료</span></td>
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
    return inboundProducts.find((product) => product.productId === productId);
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
    if (inboundSummaryValues[index]) {
        inboundSummaryValues[index].textContent = String(value);
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
