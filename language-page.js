const pageConfigMap = {
  hindi: { label: "Hindi", dataVar: "HINDI_RADIOS", heading: "Hindi Stations" },
  punjabi: { label: "Punjabi", dataVar: "PUNJABI_RADIOS", heading: "Punjabi Stations" },
  marathi: { label: "Marathi", dataVar: "MARATHI_RADIOS", heading: "Marathi Stations" },
  kannada: { label: "Kannada", dataVar: "KANNADA_RADIOS", heading: "Kannada Stations" },
  telugu: { label: "Telugu", dataVar: "TELUGU_RADIOS", heading: "Telugu Stations" },
  malayalam: { label: "Malayalam", dataVar: "MALAYALAM_RADIOS", heading: "Malayalam Stations" },
  air: { label: "AIR", dataVar: "AIR_RADIOS", heading: "AIR Stations" }
};

const pageKey = document.body?.dataset?.page || "";
const pageConfig = pageConfigMap[pageKey];

if (pageConfig) {
  const radioList = document.getElementById("radio-list");
  const radioSearch = document.getElementById("radio-search");
  const sectionHeading = document.querySelector(".section-heading h2");

  if (sectionHeading) {
    sectionHeading.textContent = pageConfig.heading;
  }

  const escapeAttribute = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\r?\n/g, " ");

  const buildStations = (rows) =>
    Array.isArray(rows)
      ? rows.map((row, index) => {
          const title = row.title || row.name || row.station || row["radio name"] || "Untitled Station";
          const streamUrl = row.streamUrl || row.url || row.streamurl || row.stream_url || row.stream || row.link || "";
          const description = row.description || row.desc || row.details || "Live radio stream";
          const image = row.image || row.img || row.thumbnail || "";

          return {
            originalIndex: index,
            title,
            streamUrl,
            description,
            image
          };
        })
      : [];

  const renderStations = (stations) => {
    if (!radioList) {
      return;
    }

    if (!stations.length) {
      radioList.innerHTML = '<p class="loading-state">No stations found for this language.</p>';
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
              data-stream-url="${escapeAttribute(station.streamUrl)}"
              data-title="${escapeAttribute(station.title)}"
              data-description="${escapeAttribute(station.description)}"
            >
              <img class="radio-image" src="${escapeAttribute(station.image)}" alt="${escapeAttribute(station.title)}" loading="lazy">
              <div class="radio-copy">
                <h3>${escapeAttribute(station.title)}</h3>
              </div>
            </button>
          </article>
        `
      )
      .join("");
  };

  const openStationPage = (station) => {
    const params = new URLSearchParams({
      index: String(station.index),
      title: station.title,
      streamUrl: station.streamUrl,
      description: station.description || "Live radio stream",
      image: station.image || "",
      language: pageConfig.label
    });

    window.location.href = `radio-player.html?${params.toString()}`;
  };

  const loadStations = () => {
    if (!radioList) {
      return;
    }

    const rawStations = window[pageConfig.dataVar];
    const stations = buildStations(rawStations);

    if (!stations.length) {
      radioList.innerHTML = `
        <p class="loading-state">
          Unable to load stations right now. Check that the ${pageConfig.label} data file is available.
        </p>
      `;
      return;
    }

    renderStations(stations);

    radioList.removeEventListener("click", handleCardClick);
    radioList.addEventListener("click", handleCardClick);

    if (radioSearch) {
      radioSearch.addEventListener("input", () => {
        const query = radioSearch.value.trim().toLowerCase();
        const filteredStations = stations.filter((station) =>
          station.title.toLowerCase().includes(query)
        );
        renderStations(filteredStations);
      });
    }
  };

  const handleCardClick = (event) => {
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
  };

  loadStations();
}
