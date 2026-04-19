const FAVORITES_KEY = "radio_star_favorites";

function getFavorites() {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavoriteStation(streamUrl) {
  return getFavorites().some((station) => station.streamUrl === streamUrl);
}

function toggleFavoriteStation(station) {
  const favorites = getFavorites();
  const index = favorites.findIndex((item) => item.streamUrl === station.streamUrl);

  if (index >= 0) {
    favorites.splice(index, 1);
    saveFavorites(favorites);
    return false;
  }

  favorites.unshift(station);
  saveFavorites(favorites);
  return true;
}
