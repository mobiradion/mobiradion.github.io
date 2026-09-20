const favoritesList = document.getElementById("favorites-list");
const clearFavoritesButton = document.getElementById("clear-favorites");

function renderFavoriteStations(stations) {
  if (!favoritesList) {
    return;
  }

  if (!stations.length) {
    favoritesList.innerHTML = '<p class="loading-state">No favorite stations yet. Open a station and tap the heart icon to save it here.</p>';
    return;
  }

  favoritesList.innerHTML = stations
    .map(
      (station) => {
        const targetUrl =
          station.pageUrl ||
          (station.streamUrl
            ? `radio-player.html?title=${encodeURIComponent(station.title || "")}&streamUrl=${encodeURIComponent(station.streamUrl)}&language=${encodeURIComponent(station.language || "Tamil")}`
            : "#");

        return `
        <article class="radio-card">
          <a
            class="radio-trigger"
            href="${targetUrl}"
          >
            <img class="radio-image" src="${station.image || "/images/radio-star-logo.svg"}" alt="${String(station.title || "").replace(/"/g, "&quot;")}" loading="lazy">
            <div class="radio-copy">
              <h3>${String(station.title || "")}</h3>
            </div>
          </a>
        </article>
      `;
      }
    )
    .join("");
}

const favoriteStations = getFavorites();
renderFavoriteStations(favoriteStations);

if (clearFavoritesButton) {
  clearFavoritesButton.addEventListener("click", () => {
    saveFavorites([]);
    renderFavoriteStations([]);
  });
}
