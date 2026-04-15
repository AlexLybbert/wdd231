export function setFooterDates() {
    const year = String(new Date().getFullYear());
    const modified = document.lastModified;

    const yearTargets = [
        document.getElementById('year'),
        document.getElementById('currentYear')
    ].filter(Boolean);

    const modifiedTargets = [
        document.getElementById('modified'),
        document.getElementById('lastModified')
    ].filter(Boolean);

    yearTargets.forEach((node) => {
        node.textContent = year;
    });

    modifiedTargets.forEach((node) => {
        node.textContent = modified;
    });
}
