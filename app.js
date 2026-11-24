let toastTimeout;

function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container") || createToastContainer();
    const toast = document.createElement("div");
    const toastType = ["success", "error", "info"].includes(type) ? type : "info";

    toast.className = `toast toast--${toastType}`;
    toast.setAttribute("role", toastType === "error" ? "alert" : "status");
    toast.textContent = message;

    toastContainer.replaceChildren(toast);
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
        toast.remove();
    }, 3000);
}

function createToastContainer() {
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    toastContainer.setAttribute("aria-live", "polite");
    toastContainer.setAttribute("aria-atomic", "true");
    document.body.append(toastContainer);
    return toastContainer;
}

const matchBookingLinks = document.querySelectorAll(".match-book-button");
matchBookingLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        event.preventDefault();
        const destination = new URL(link.href, window.location.href);
        destination.searchParams.set("source", "schedule");
        window.location.assign(destination.href);
    });
});

const matchSelect = document.querySelector("#match");
if (matchSelect) {
    const queryParams = new URLSearchParams(window.location.search);
    const selectedMatch = queryParams.get("match");
    const hasMatchingOption = Array.from(matchSelect.options).some((option) => option.value === selectedMatch);

    if (hasMatchingOption) {
        matchSelect.value = selectedMatch;
    }

    if (queryParams.get("source") === "schedule") {
        showToast("Redirecting you to the booking form!", "info");
    }
}

const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
    const formMessage = document.getElementById("form-message");

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        formMessage.hidden = false;
        showToast("Your details passed the form validation.", "success");
    });

    bookingForm.addEventListener("reset", () => {
        formMessage.hidden = true;
    });
}
