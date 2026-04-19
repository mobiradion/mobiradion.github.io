const favoritesList = document.getElementById("favorites-list");

function renderFavoriteStations(stations) {
  if (!stations.length) {
    favoritesList.innerHTML = '<p class="loading-state">No favorite stations yet. Open a station and tap the heart icon to save it here.</p>';
    return;
  }

  favoritesList.innerHTML = stations
    .map(
      (station) => `
        <article class="radio-card">
          <button
            type="button"
            class="radio-trigger"
            data-index="${station.index ?? -1}"
            data-stream-url="${station.streamUrl}"
            data-title="${station.title.replace(/"/g, "&quot;")}"
            data-description="${(station.description || "").replace(/"/g, "&quot;")}"
            data-language="${station.language || "Tamil"}"
          >
            <img class="radio-image" src="${station.image}" alt="${station.title}" loading="lazy">
            <div class="radio-copy">
              <h3>${station.title}</h3>
            </div>
          </button>
        </article>
      `
    )
    .join("");
}

function openFavoriteStation(station) {
  const params = new URLSearchParams({
    index: String(station.index ?? -1),
    title: station.title,
    streamUrl: station.streamUrl,
    description: station.description || "Live radio stream",
    image: station.image || "",
    language: station.language || "Tamil"
  });

  window.location.href = `radio-player.html?${params.toString()}`;
}

const favoriteStations = getFavorites();
renderFavoriteStations(favoriteStations);

favoritesList.addEventListener("click", (event) => {
  const trigger = event.target.closest(".radio-trigger");
  if (!trigger) {
    return;
  }

  openFavoriteStation({
    index: trigger.dataset.index,
    streamUrl: trigger.dataset.streamUrl,
    title: trigger.dataset.title,
    description: trigger.dataset.description,
    image: trigger.querySelector(".radio-image")?.getAttribute("src") || "",
    language: trigger.dataset.language
  });
});
