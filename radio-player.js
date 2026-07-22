const params = new URLSearchParams(window.location.search);

const title = params.get("title") || "Unknown Station";
const streamUrl = params.get("streamUrl") || "";
const description = params.get("description") || "Live radio stream";
const image = params.get("image") || "";
const language = params.get("language") || "Tamil";
let stationIndex = Number.parseInt(params.get("index") || "-1", 10);
let currentLanguage = String(language || "Tamil").trim() || "Tamil";
let currentStationList = [];

function getStationList(languageName) {
  const normalizedLanguage = String(languageName || "Tamil").trim().toLowerCase();
  const stationDataMap = {
    tamil: "TAMIL_RADIOS",
    hindi: "HINDI_RADIOS",
    punjabi: "PUNJABI_RADIOS",
    marathi: "MARATHI_RADIOS",
    kannada: "KANNADA_RADIOS",
    telugu: "TELUGU_RADIOS",
    malayalam: "MALAYALAM_RADIOS",
    air: "AIR_RADIOS"
  };

  const dataKey = stationDataMap[normalizedLanguage];
  if (!dataKey) {
    return [];
  }

  const stationList = window[dataKey];
  return Array.isArray(stationList) ? stationList : [];
}

currentStationList = getStationList(currentLanguage);

const descriptionNode = document.getElementById("station-description");
const imageNode = document.getElementById("station-image");
const playerNode = document.getElementById("station-player");
const previousButton = document.getElementById("previous-station");
const nextButton = document.getElementById("next-station");
const playbackButton = document.getElementById("toggle-playback");
const playbackIcon = document.getElementById("playback-icon");
const breadcrumbCurrent = document.getElementById("breadcrumb-current");
const favoriteButton = document.getElementById("toggle-favorite");
const favoriteIcon = document.getElementById("favorite-icon");
const shareButton = document.getElementById("share-station");
const shareMenu = document.getElementById("share-menu");
const shareWhatsapp = document.getElementById("share-whatsapp");
const shareTwitter = document.getElementById("share-twitter");
const shareFacebook = document.getElementById("share-facebook");
const shareTelegram = document.getElementById("share-telegram");
const copyShareLinkButton = document.getElementById("copy-share-link");
let lastStreamUrl = "";

function safeAddEventListener(element, eventName, handler) {
  if (element) {
    element.addEventListener(eventName, handler);
  }
}

function updatePlaybackIcon() {
  if (!playerNode || !playbackIcon || !playbackButton) {
    return;
  }

  const isPaused = playerNode.paused;
  playbackIcon.innerHTML = isPaused ? "&#9654;" : "&#10074;&#10074;";
  playbackButton.setAttribute("aria-label", isPaused ? "Play station" : "Pause station");
}

function updateFavoriteIcon(station) {
  if (!favoriteButton) {
    return;
  }

  const favorite = isFavoriteStation(station.streamUrl);
  if (favoriteIcon) {
    favoriteIcon.innerHTML = favorite ? "&#9829;" : "&#9825;";
  }
  favoriteButton.classList.toggle("icon-btn-active", favorite);
  favoriteButton.setAttribute("aria-label", favorite ? "Remove from favorites" : "Add to favorites");
}

function updateStationDetails(station) {
  if (descriptionNode) {
    descriptionNode.textContent = station.description || "Live radio stream";
  }
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = station.title;
  }
  if (imageNode) {
    imageNode.src = station.image || "";
    imageNode.alt = station.title;
  }

  if (playerNode) {
    if (station.streamUrl) {
      lastStreamUrl = station.streamUrl;
      playerNode.src = station.streamUrl;
      playerNode.load();
      playerNode.play().catch(() => {
        if (descriptionNode) {
          descriptionNode.textContent = "The stream is unavailable right now. Please try another station.";
        }
      });
    } else {
      playerNode.removeAttribute("src");
      if (descriptionNode) {
        descriptionNode.textContent = "This station is missing a valid stream URL.";
      }
    }
  }

  updatePlaybackIcon();
  updateFavoriteIcon(station);
  updateShareLinks(station);
}

function updateNavButtons(index) {
  if (!currentStationList.length) {
    if (previousButton) {
      previousButton.disabled = true;
    }
    if (nextButton) {
      nextButton.disabled = true;
    }
    return;
  }

  if (previousButton) {
    previousButton.disabled = index <= 0;
  }
  if (nextButton) {
    nextButton.disabled = index >= currentStationList.length - 1;
  }
}

function goToStation(index) {
  const station = currentStationList[index];
  if (!station) {
    return;
  }

  stationIndex = index;

  const nextParams = new URLSearchParams({
    index: String(index),
    title: station.title,
    streamUrl: station.streamUrl,
    description: station.description || "Live radio stream",
    image: station.image || "",
    language: currentLanguage
  });

  window.location.href = `radio-player.html?${nextParams.toString()}`;
}

function buildStationUrl(station) {
  const shareParams = new URLSearchParams({
    index: String(station.index ?? -1),
    title: station.title,
    streamUrl: station.streamUrl,
    description: station.description || "Live radio stream",
    image: station.image || "",
    language: station.language || currentLanguage
  });

  return `${window.location.origin}${window.location.pathname}?${shareParams.toString()}`;
}

function updateShareLinks(station) {
  if (!shareWhatsapp || !shareTwitter || !shareFacebook || !shareTelegram || !copyShareLinkButton) {
    return;
  }

  const shareUrl = buildStationUrl(station);
  const shareText = `${station.title} - Listen on Radio Star`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  shareWhatsapp.href = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  shareTelegram.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  copyShareLinkButton.dataset.shareUrl = shareUrl;
}

const currentStation =
  stationIndex >= 0 && stationIndex < currentStationList.length
    ? { ...currentStationList[stationIndex], language: currentLanguage, index: stationIndex }
    : {
        index: stationIndex,
        title,
        streamUrl,
        description,
        image,
        language: currentLanguage
      };

updateStationDetails(currentStation);
updateNavButtons(stationIndex);
updatePlaybackIcon();

safeAddEventListener(previousButton, "click", () => {
  if (stationIndex > 0) {
    goToStation(stationIndex - 1);
  }
});

safeAddEventListener(nextButton, "click", () => {
  if (stationIndex >= 0 && stationIndex < currentStationList.length - 1) {
    goToStation(stationIndex + 1);
  }
});

safeAddEventListener(playbackButton, "click", () => {
  if (!playerNode || !playerNode.src) {
    return;
  }

  if (playerNode.paused) {
    playerNode.play().catch(() => {});
  } else {
    playerNode.pause();
  }
});

safeAddEventListener(favoriteButton, "click", () => {
  if (!currentStation || !favoriteButton) {
    return;
  }

  const nextFavoriteState = toggleFavoriteStation({
    index: currentStation.index,
    title: currentStation.title,
    streamUrl: currentStation.streamUrl,
    description: currentStation.description || "Live radio stream",
    image: currentStation.image || "",
    language: currentStation.language || "Tamil"
  });

  if (favoriteIcon) {
    favoriteIcon.innerHTML = nextFavoriteState ? "&#9829;" : "&#9825;";
  }
  favoriteButton.classList.toggle("icon-btn-active", nextFavoriteState);
  favoriteButton.setAttribute("aria-label", nextFavoriteState ? "Remove from favorites" : "Add to favorites");
});

if (shareButton && shareMenu) {
  safeAddEventListener(shareButton, "click", () => {
    const isHidden = shareMenu.hasAttribute("hidden");
    if (isHidden) {
      shareMenu.removeAttribute("hidden");
      shareButton.setAttribute("aria-expanded", "true");
    } else {
      shareMenu.setAttribute("hidden", "");
      shareButton.setAttribute("aria-expanded", "false");
    }
  });
}

if (copyShareLinkButton) {
  safeAddEventListener(copyShareLinkButton, "click", async () => {
    const shareUrl = copyShareLinkButton.dataset.shareUrl || buildStationUrl(currentStation);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        copyShareLinkButton.textContent = "Copied";
        setTimeout(() => {
          copyShareLinkButton.textContent = "Copy Link";
        }, 1500);
        return;
      }
    } catch {
    }

    window.prompt("Copy this station link:", shareUrl);
  });
}

document.addEventListener("click", (event) => {
  if (shareMenu && shareButton && !shareMenu.contains(event.target) && !shareButton.contains(event.target)) {
    shareMenu.setAttribute("hidden", "");
    shareButton.setAttribute("aria-expanded", "false");
  }
});

safeAddEventListener(playerNode, "play", updatePlaybackIcon);
safeAddEventListener(playerNode, "pause", updatePlaybackIcon);
safeAddEventListener(playerNode, "error", () => {
  if (descriptionNode) {
    descriptionNode.textContent = "This station could not be played. The stream may be temporarily unavailable.";
  }
  updatePlaybackIcon();
});

if (!currentStationList.length || stationIndex < 0) {
  if (previousButton) {
    previousButton.disabled = true;
  }
  if (nextButton) {
    nextButton.disabled = true;
  }
}
