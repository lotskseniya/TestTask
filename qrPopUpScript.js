const popupBtn = document.getElementById("popupBtn");
const popupOverlay = document.getElementById("popupOverlay");

function showPopup() {
    popupOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function hidePopup() {
    popupOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
}

popupBtn.addEventListener("click", showPopup);

function hidePopup() {
  document.getElementById("popupOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

function handleMenuClick(item) {
  hidePopup();
}

window.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
        hidePopup();
    }
});

// Close popup with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    hidePopup();
  }
});
