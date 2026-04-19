const radioList = document.getElementById("radio-list");
const radioSearch = document.getElementById("radio-search");
const stations = Array.isArray(window.TAMIL_RADIOS)
  ? window.TAMIL_RADIOS.map((station, index) => ({ ...station, originalIndex: index }))
  : [];

function renderStations(stations) {
  if (!stations.length) {
    radioList.innerHTML = '<p class="loading-state">No Tamil stations found in the CSV file.</p>';
    return;
  }

  radioList.innerHTML = stations
    .map(
      (station) => `
        <article class="radio-card">
          <button
            type="button"
            class="radio-trigger"
            data-index="${station.originalIndex}"
            data-stream-url="${station.streamUrl}"
            data-title="${station.title.replace(/"/g, "&quot;")}"
            data-description="${station.description.replace(/"/g, "&quot;")}"
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

function openStationPage(station) {
  const params = new URLSearchParams({
    index: String(station.index),
    title: station.title,
    streamUrl: station.streamUrl,
    description: station.description || "Live Tamil radio stream",
    image: station.image || "",
    language: "Tamil"
  });

  window.location.href = `radio-player.html?${params.toString()}`;
}

function loadStations() {
  if (!stations.length) {
    radioList.innerHTML = `
      <p class="loading-state">
        Unable to load Tamil stations right now. Check that <code>tamil-data.js</code> is present and contains station data.
      </p>
    `;
    return;
  }

  renderStations(stations);

  radioList.addEventListener("click", (event) => {
    const trigger = event.target.closest(".radio-trigger");
    if (!trigger) {
      return;
    }

    openStationPage({
      index: trigger.dataset.index,
      streamUrl: trigger.dataset.streamUrl,
      title: trigger.dataset.title,
      description: trigger.dataset.description,
      image: trigger.querySelector(".radio-image")?.getAttribute("src") || ""
    });
  });

  radioSearch.addEventListener("input", () => {
    const query = radioSearch.value.trim().toLowerCase();
    const filteredStations = stations.filter((station) =>
      station.title.toLowerCase().includes(query)
    );

    renderStations(filteredStations);
  });
}

loadStations();
