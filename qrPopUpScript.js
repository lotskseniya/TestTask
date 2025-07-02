const popupBtn = document.getElementById("popupBtn");
const popupOverlay = document.getElementById("popupOverlay");
const modelViewer = document.querySelector('backpackModel');

function showPopup() {
    popupOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function hidePopup() {
    popupOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
    document.querySelector("#backpackModel").style.display = "none";
    document.querySelector("#container").style.display = "flex";
}

popupBtn.addEventListener("click", showPopup);

function showARModule() {
  document.getElementById("popupOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
  document.querySelector("#backpackModel").style.display = "flex";
  document.querySelector("#container").style.display = "none";
}

function handleMenuClick(item) {
  hidePopup();
}

window.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
        showARModule();
    }
});

// Close popup with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    showARModule();
  }
});
