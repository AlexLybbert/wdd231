import discoverItems from "../data/discover-items.mjs";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LAST_VISIT_KEY = "chamber-discover-last-visit";

const discoverGrid = document.getElementById("discover-grid");
const visitMessage = document.getElementById("visit-message");

function buildVisitMessage() {
  const now = Date.now();

  try {
    const lastVisitValue = Number(globalThis.localStorage.getItem(LAST_VISIT_KEY));
    globalThis.localStorage.setItem(LAST_VISIT_KEY, String(now));

    if (!lastVisitValue) {
      return "Welcome! Let us know if you have any questions.";
    }

    const elapsed = now - lastVisitValue;

    if (elapsed < DAY_IN_MS) {
      return "Back so soon! Awesome!";
    }

    const days = Math.floor(elapsed / DAY_IN_MS);
    const label = days === 1 ? "day" : "days";
    return `You last visited ${days} ${label} ago.`;
  } catch (error) {
    console.error("Unable to read last visit data.", error);
    return "Welcome! Let us know if you have any questions.";
  }
}

function buildCard(item) {
  const card = document.createElement("article");
  card.className = "discover-card";
  card.style.gridArea = item.area;

  const heading = document.createElement("h2");
  heading.className = "discover-card-title";
  heading.textContent = item.title;

  const figure = document.createElement("figure");
  figure.className = "discover-figure";

  const image = document.createElement("img");
  image.className = "discover-image";
  image.src = `images/${item.image}`;
  image.alt = item.imageAlt;
  image.width = 300;
  image.height = 200;
  image.loading = "lazy";
  figure.appendChild(image);

  const address = document.createElement("address");
  address.className = "discover-address";
  address.textContent = item.address;

  const description = document.createElement("p");
  description.className = "discover-description";
  description.textContent = item.description;

  const button = document.createElement("button");
  button.className = "discover-button";
  button.type = "button";
  button.textContent = "Learn More";
  button.setAttribute("aria-label", `Learn more about ${item.title}`);
  button.addEventListener("click", () => {
    globalThis.open(item.link, "_blank");
  });

  card.append(heading, figure, address, description, button);

  return card;
}

function renderDiscoverCards() {
  if (!discoverGrid) {
    return;
  }

  const fragment = document.createDocumentFragment();

  discoverItems.forEach((item) => {
    fragment.appendChild(buildCard(item));
  });

  discoverGrid.replaceChildren(fragment);
}

function init() {
  if (visitMessage) {
    visitMessage.textContent = buildVisitMessage();
  }

  renderDiscoverCards();
}

document.addEventListener("DOMContentLoaded", init);