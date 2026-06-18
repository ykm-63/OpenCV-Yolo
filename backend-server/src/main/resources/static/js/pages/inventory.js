const inventoryModalOverlay = document.getElementById("inventoryModalOverlay");
const openInventoryModalBtn = document.getElementById("openInventoryModalBtn");
const openInventoryModalBtn2 = document.getElementById("openInventoryModalBtn2");
const closeInventoryModalBtn = document.getElementById("closeInventoryModalBtn");
const cancelInventoryBtn = document.getElementById("cancelInventoryBtn");
const inventoryForm = document.getElementById("inventoryForm");

const inventorySearchInput = document.getElementById("inventorySearchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const inventorySearchBtn = document.getElementById("inventorySearchBtn");

function openInventoryModal() {
    if (inventoryModalOverlay) {
        inventoryModalOverlay.classList.add("open");
    }
}

function closeInventoryModal() {
    if (inventoryModalOverlay) {
        inventoryModalOverlay.classList.remove("open");
    }

    if (inventoryForm) {
        inventoryForm.reset();
    }
}

if (openInventoryModalBtn) {
    openInventoryModalBtn.addEventListener("click", openInventoryModal);
}

if (openInventoryModalBtn2) {
    openInventoryModalBtn2.addEventListener("click", openInventoryModal);
}

if (closeInventoryModalBtn) {
    closeInventoryModalBtn.addEventListener("click", closeInventoryModal);
}

if (cancelInventoryBtn) {
    cancelInventoryBtn.addEventListener("click", closeInventoryModal);
}

if (inventoryModalOverlay) {
    inventoryModalOverlay.addEventListener("click", function (e) {
        if (e.target === inventoryModalOverlay) {
            closeInventoryModal();
        }
    });
}

if (inventoryForm) {
    inventoryForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const itemName = inventoryForm.querySelector("input[name='itemName']").value.trim();
        const category = inventoryForm.querySelector("select[name='category']").value;
        const quantity = inventoryForm.querySelector("input[name='quantity']").value;
        const minQuantity = inventoryForm.querySelector("input[name='minQuantity']").value;

        if (!itemName || !category || quantity === "" || minQuantity === "") {
            alert("상품 정보를 모두 입력해주세요.");
            return;
        }

        console.log("상품 등록:", {
            itemName: itemName,
            category: category,
            quantity: quantity,
            minQuantity: minQuantity
        });

        alert("상품이 등록되었습니다. 현재는 UI 테스트용 동작입니다.");
        closeInventoryModal();
    });
}

if (inventorySearchBtn) {
    inventorySearchBtn.addEventListener("click", function () {
        const keyword = inventorySearchInput.value.trim();
        const category = categoryFilter.value;
        const status = statusFilter.value;

        console.log("재고 검색:", {
            keyword: keyword,
            category: category,
            status: status
        });

        alert("검색 조건이 적용되었습니다. 현재는 UI 테스트용 동작입니다.");
    });
}

// --- 여기서부터 진짜 DB 연동 코드 ---

// 페이지가 로드되면 실행
document.addEventListener("DOMContentLoaded", function () {
    loadRealInventory();
});

function loadRealInventory() {
    // 1. 서버(Java)에 전체 재고 데이터를 요청
    fetch('/api/inventory/all')
        .then(response => response.json())
        .then(data => {
            // 2. HTML에서 데이터가 들어갈 표(tbody)를 찾음
            const tbody = document.querySelector(".table-wrap table tbody");
            if (!tbody) return;

            tbody.innerHTML = ""; // 기존 가짜(3개) 데이터 삭제

            // 3. 서버에서 받아온 진짜 데이터(data)를 한 줄씩 표에 추가
            data.forEach(item => {
                const row = document.createElement("tr");

                // 상태에 따른 색상 클래스 결정
                let statusClass = "normal";
                if (item.status === "부족") statusClass = "warning";
                if (item.status === "위험") statusClass = "danger";

                row.innerHTML = `
                    <td>${item.productId}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.currentQty}</td>
                    <td>${item.minQty}</td>
                    <td><span class="stock ${statusClass}">${item.status}</span></td>
                    <td>${item.lastUpdated || '-'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error("데이터 로딩 실패:", error));
}