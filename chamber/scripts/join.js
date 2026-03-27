function setJoinTimestamp() {
  const timestampField = document.getElementById("timestamp");

  if (timestampField) {
    timestampField.value = new Date().toISOString();
  }
}

function initializeMembershipModals() {
  const modalLinks = document.querySelectorAll("[data-modal-target]");
  const closeButtons = document.querySelectorAll("[data-close-modal]");

  modalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const dialog = document.getElementById(link.dataset.modalTarget);

      if (dialog?.showModal) {
        dialog.showModal();
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.closeModal);

      if (dialog?.open) {
        dialog.close();
      }
    });
  });

  document.querySelectorAll(".membership-modal").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setJoinTimestamp();
  initializeMembershipModals();
});
