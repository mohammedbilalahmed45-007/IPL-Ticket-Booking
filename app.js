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

const matchSelect = document.getElementById("match");
const standSelect = document.getElementById("stand");
const ticketQuantityInput = document.getElementById("quantity");
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
const bookingSummary = document.querySelector(".booking-summary");
if (bookingForm && matchSelect && standSelect && ticketQuantityInput && bookingSummary) {
    const formMessage = document.getElementById("form-message");
    const summaryMessage = document.getElementById("summary-message");
    const summaryDetails = document.getElementById("summary-details");
    const summaryTotalRow = document.getElementById("summary-total-row");
    const summaryMatch = document.getElementById("summary-match");
    const summaryStand = document.getElementById("summary-stand");
    const summaryQuantity = document.getElementById("summary-quantity");
    const summaryUnitPrice = document.getElementById("summary-unit-price");
    const summaryTotal = document.getElementById("summary-total");
    const pricesByMatch = {
        "rcb-csk": { general: 800, premium: 2000, vip: 5000 },
        "mi-kkr": { general: 900, premium: 2200, vip: 5500 },
        "rr-srh": { general: 700, premium: 1800, vip: 4500 },
        "dc-pbks": { general: 750, premium: 1900, vip: 4800 },
        "gt-lsg": { general: 850, premium: 2100, vip: 5200 }
    };
    const currencyFormatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });
    let hasShownSummaryToast = false;

    function updateBookingSummary() {
        summaryDetails.hidden = true;
        summaryTotalRow.hidden = true;

        if (!matchSelect.value || !standSelect.value) {
            summaryMessage.textContent = "Choose a match and stand to see your estimated total.";
            summaryMessage.hidden = false;
            return;
        }

        const quantity = ticketQuantityInput.valueAsNumber;
        if (
            !ticketQuantityInput.value ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 10 ||
            !ticketQuantityInput.validity.valid
        ) {
            summaryMessage.textContent = "Enter a whole number from 1 to 10 to see your estimated total.";
            summaryMessage.hidden = false;
            return;
        }

        const matchPrices = pricesByMatch[matchSelect.value];
        const pricePerTicket = matchPrices && matchPrices[standSelect.value];
        if (typeof pricePerTicket !== "number") {
            summaryMessage.textContent = "Pricing is unavailable for this selection.";
            summaryMessage.hidden = false;
            return;
        }

        const selectedMatchText = matchSelect.selectedOptions[0].textContent;
        const selectedStandText = standSelect.selectedOptions[0].textContent;
        summaryMatch.textContent = selectedMatchText;
        summaryStand.textContent = selectedStandText;
        summaryQuantity.textContent = String(quantity);
        summaryUnitPrice.textContent = currencyFormatter.format(pricePerTicket);
        summaryTotal.textContent = currencyFormatter.format(pricePerTicket * quantity);
        summaryMessage.hidden = true;
        summaryDetails.hidden = false;
        summaryTotalRow.hidden = false;

        if (!hasShownSummaryToast) {
            hasShownSummaryToast = true;
            showToast("Booking summary updated successfully!", "success");
        }
    }

    matchSelect.addEventListener("change", updateBookingSummary);
    standSelect.addEventListener("change", updateBookingSummary);
    ticketQuantityInput.addEventListener("input", updateBookingSummary);
    ticketQuantityInput.addEventListener("change", updateBookingSummary);
    updateBookingSummary();

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        formMessage.hidden = false;
        showToast("Your details passed the form validation.", "success");
    });

    bookingForm.addEventListener("reset", () => {
        formMessage.hidden = true;
        hasShownSummaryToast = false;
        window.setTimeout(updateBookingSummary, 0);
    });
}
