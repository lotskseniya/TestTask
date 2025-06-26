// Popup functionality
const popupBtn = document.getElementById("popupBtn");
const popupOverlay = document.getElementById("popupOverlay");
const closeBtn = document.getElementById("closeBtn");

popupBtn.addEventListener("click", () => {
  popupOverlay.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
  popupOverlay.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === popupOverlay) {
    popupOverlay.style.display = "none";
  }
});

// Popup functions
function showPopup() {
  document.getElementById("popupOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function hidePopup() {
  document.getElementById("popupOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

function handleMenuClick(item) {
  hidePopup();
}

// Close popup with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    hidePopup();
  }
});
