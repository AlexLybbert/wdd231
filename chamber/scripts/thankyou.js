function populateSubmissionSummary() {
  const params = new URLSearchParams(window.location.search);
  const fields = ["firstName", "lastName", "email", "phone", "organization", "timestamp"];

  fields.forEach((field) => {
    const target = document.getElementById(`summary-${field}`);

    if (!target) {
      return;
    }

    if (field === "timestamp") {
      const rawValue = params.get(field);
      const parsedDate = rawValue ? new Date(rawValue) : null;
      target.textContent = parsedDate && !Number.isNaN(parsedDate.valueOf())
        ? parsedDate.toLocaleString()
        : "Not provided";
      return;
    }

    target.textContent = params.get(field) || "Not provided";
  });
}

document.addEventListener("DOMContentLoaded", populateSubmissionSummary);
