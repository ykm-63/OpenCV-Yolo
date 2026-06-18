function openModalById(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) {
        return;
    }

    modal.classList.add("open");
}

function closeModalById(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) {
        return;
    }

    modal.classList.remove("open");
}

function bindModalCloseByOverlay(modalId, closeCallback) {
    const modal = document.getElementById(modalId);

    if (!modal) {
        return;
    }

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            if (typeof closeCallback === "function") {
                closeCallback();
                return;
            }

            modal.classList.remove("open");
        }
    });
}

function setNowToDateTimeInput(input) {
    if (!input) {
        return;
    }

    const now = new Date();

    const pad = function (n) {
        return String(n).padStart(2, "0");
    };

    const localDateTime =
        now.getFullYear() + "-" +
        pad(now.getMonth() + 1) + "-" +
        pad(now.getDate()) + "T" +
        pad(now.getHours()) + ":" +
        pad(now.getMinutes());

    input.value = localDateTime;
}