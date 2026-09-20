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
          <a
            class="radio-trigger"
            href="${station.pageUrl || `/tamil/${station.slug || ''}.html`}"
          >
            <img class="radio-image" src="${station.image}" alt="${station.title.replace(/"/g, "&quot;")}" loading="lazy">
            <div class="radio-copy">
              <h3>${station.title}</h3>
            </div>
          </a>
        </article>
      `
    )
    .join("");
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

  if (radioSearch) {
    radioSearch.addEventListener("input", () => {
      const query = radioSearch.value.trim().toLowerCase();
      const filteredStations = stations.filter((station) =>
        station.title.toLowerCase().includes(query)
      );

      renderStations(filteredStations);
    });
  }
}

loadStations();
