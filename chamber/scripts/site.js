function updateFooterMeta() {
  const currentYear = document.getElementById("currentYear");
  const lastModified = document.getElementById("lastModified");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  if (lastModified) {
    lastModified.textContent = document.lastModified;
  }
}

document.addEventListener("DOMContentLoaded", updateFooterMeta);
