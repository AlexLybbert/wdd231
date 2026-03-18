const MEMBERS_JSON = "data/members.json";

const membersContainer = document.getElementById("members");
const viewButtons = document.querySelectorAll(".view-toggle");

async function getMembers() {
  try {
    const res = await fetch(MEMBERS_JSON, { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Directory data couldn't be loaded.");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);

    membersContainer.innerHTML =
      '<p class="notice">Directory information is unavailable right now.</p>';

    return [];
  }
}

function badgeFor(level) {
  const span = document.createElement("span");
  span.classList.add("member-badge");

  if (level === 3) {
    span.textContent = "Gold";
    span.classList.add("level-3");
  } else if (level === 2) {
    span.textContent = "Silver";
    span.classList.add("level-2");
  } else {
    span.textContent = "Member";
    span.classList.add("level-1");
  }

  return span;
}

function buildCard(member) {
  const card = document.createElement("article");
  card.className = "member-card";

  // Logo
  const logoWrap = document.createElement("div");
  logoWrap.className = "member-logo";

  const img = document.createElement("img");
  img.src = `images/${member.image}`;
  img.alt = `${member.companyName} logo`;

  logoWrap.appendChild(img);

  // Content
  const content = document.createElement("div");
  content.className = "member-content";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.gap = ".5rem";

  const name = document.createElement("h2");
  name.className = "member-name";
  name.textContent = member.companyName;

  header.appendChild(name);
  header.appendChild(badgeFor(member.membershipLevel));

  const tagline = document.createElement("p");
  tagline.className = "member-tagline";
  tagline.textContent = member.tagline || "Local business member";

  const info = document.createElement("div");
  info.className = "member-meta";

  const address = document.createElement("p");
  address.textContent = member.address;

  const phone = document.createElement("p");
  phone.textContent = member.phone;

  const site = document.createElement("a");
  site.href = member.website;
  site.target = "_blank";
  site.rel = "noopener";
  site.textContent = member.website.replace(/^https?:\/\//, "");

  info.append(address, phone, site);
  content.append(header, tagline, info);

  card.append(logoWrap, content);

  return card;
}

function changeView(view) {
  viewButtons.forEach(btn => {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.view === view ? "true" : "false"
    );
  });

  membersContainer.classList.toggle("list", view === "list");
  membersContainer.classList.toggle("grid", view === "grid");
}

async function showMembers(view = "grid") {
  const members = await getMembers();

  membersContainer.innerHTML = "";
  changeView(view);

  members.forEach(m => {
    const card = buildCard(m);
    membersContainer.appendChild(card);
  });
}

function setupViewButtons() {
  viewButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      changeView(btn.dataset.view);
    });
  });
}

function updateFooter() {
  const year = document.getElementById("currentYear");
  const modified = document.getElementById("lastModified");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (modified) {
    modified.textContent = document.lastModified;
  }
}

function init() {
  setupViewButtons();
  showMembers();
  updateFooter();
}

document.addEventListener("DOMContentLoaded", init);
document.getElementById('lastModified').textContent = document.lastModified;
document.getElementById('currentYear').textContent = new Date().getFullYear();