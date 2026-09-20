(function () {
  const playerCard = document.querySelector(".player-detail-card");
  const playerNode = document.getElementById("station-player");
  const playbackButton = document.getElementById("toggle-playback");
  const playbackIcon = document.getElementById("playback-icon");
  const favoriteButton = document.getElementById("toggle-favorite");
  const favoriteIcon = document.getElementById("favorite-icon");
  const shareButton = document.getElementById("share-station");
  const shareMenu = document.getElementById("share-menu");
  const shareWhatsapp = document.getElementById("share-whatsapp");
  const shareTwitter = document.getElementById("share-twitter");
  const shareFacebook = document.getElementById("share-facebook");
  const shareTelegram = document.getElementById("share-telegram");
  const copyShareLinkButton = document.getElementById("copy-share-link");
  const descriptionNode = document.getElementById("station-description");

  if (!playerCard || !playerNode) {
    return;
  }

  const stationData = {
    title: playerCard.dataset.title || document.title,
    streamUrl: playerCard.dataset.streamUrl || "",
    description: playerCard.dataset.description || "",
    image: playerCard.dataset.image || "",
    language: playerCard.dataset.language || "Tamil",
    slug: playerCard.dataset.slug || ""
  };

  let hlsInstance = null;

  function destroyHls() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  }

  function isHlsStream(url) {
    if (!url) {
      return false;
    }
    return /\.m3u8($|\?)/i.test(url);
  }

  function updatePlaybackIcon() {
    if (!playerNode || !playbackIcon || !playbackButton) {
      return;
    }
    const isPaused = playerNode.paused;
    playbackIcon.innerHTML = isPaused ? "&#9654;" : "&#10074;&#10074;";
    playbackButton.setAttribute("aria-label", isPaused ? "Play station" : "Pause station");
  }

  function updateFavoriteIcon() {
    if (!favoriteButton || typeof isFavoriteStation !== "function") {
      return;
    }
    const favorite = isFavoriteStation(stationData.streamUrl);
    if (favoriteIcon) {
      favoriteIcon.innerHTML = favorite ? "&#9829;" : "&#9825;";
    }
    favoriteButton.classList.toggle("icon-btn-active", favorite);
    favoriteButton.setAttribute("aria-label", favorite ? "Remove from favorites" : "Add to favorites");
  }

  function setupShareLinks() {
    const shareUrl = window.location.href;
    const shareText = `${stationData.title} - Listen Live on Radio Star`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    if (shareWhatsapp) {
      shareWhatsapp.href = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
    }
    if (shareTwitter) {
      shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    }
    if (shareFacebook) {
      shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    }
    if (shareTelegram) {
      shareTelegram.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    }
    if (copyShareLinkButton) {
      copyShareLinkButton.dataset.shareUrl = shareUrl;
    }
  }

  function initPlayer() {
    destroyHls();

    const streamUrl = stationData.streamUrl;
    if (!streamUrl) {
      if (descriptionNode) {
        descriptionNode.textContent = "This station is missing a valid stream URL.";
      }
      return;
    }

    if (isHlsStream(streamUrl)) {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(playerNode);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
          playerNode.play().catch(() => {
            updatePlaybackIcon();
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("HLS network error, trying to recover...", data);
                hlsInstance.startLoad();
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("HLS media error, trying to recover...", data);
                hlsInstance.recoverMediaError();
                break;
              default:
                console.error("Fatal HLS error:", data);
                destroyHls();
                if (descriptionNode) {
                  descriptionNode.textContent = "This station could not be played. The stream may be temporarily unavailable.";
                }
                updatePlaybackIcon();
                break;
            }
          }
        });
      } else if (playerNode.canPlayType("application/vnd.apple.mpegurl")) {
        playerNode.src = streamUrl;
        playerNode.load();
        playerNode.play().catch(() => {
          updatePlaybackIcon();
        });
      } else {
        if (descriptionNode) {
          descriptionNode.textContent = "HLS streaming is not supported on this browser.";
        }
      }
    } else {
      playerNode.src = streamUrl;
      playerNode.load();
      playerNode.play().catch(() => {
        updatePlaybackIcon();
      });
    }
  }

  if (playbackButton) {
    playbackButton.addEventListener("click", () => {
      if (!playerNode || (!playerNode.src && !playerNode.currentSrc && !hlsInstance)) {
        return;
      }
      if (playerNode.paused) {
        playerNode.play().catch(() => {});
      } else {
        playerNode.pause();
      }
    });
  }

  if (favoriteButton) {
    favoriteButton.addEventListener("click", () => {
      if (typeof toggleFavoriteStation !== "function") {
        return;
      }
      const nextState = toggleFavoriteStation({
        title: stationData.title,
        streamUrl: stationData.streamUrl,
        description: stationData.description,
        image: stationData.image,
        language: stationData.language,
        pageUrl: window.location.pathname
      });
      if (favoriteIcon) {
        favoriteIcon.innerHTML = nextState ? "&#9829;" : "&#9825;";
      }
      favoriteButton.classList.toggle("icon-btn-active", nextState);
      favoriteButton.setAttribute("aria-label", nextState ? "Remove from favorites" : "Add to favorites");
    });
  }

  if (shareButton && shareMenu) {
    shareButton.addEventListener("click", (event) => {
      event.stopPropagation();
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
    copyShareLinkButton.addEventListener("click", async () => {
      const shareUrl = copyShareLinkButton.dataset.shareUrl || window.location.href;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          copyShareLinkButton.textContent = "Copied";
          setTimeout(() => {
            copyShareLinkButton.textContent = "Copy Link";
          }, 1500);
          return;
        }
      } catch {}
      window.prompt("Copy this station link:", shareUrl);
    });
  }

  document.addEventListener("click", (event) => {
    if (shareMenu && shareButton && !shareMenu.contains(event.target) && !shareButton.contains(event.target)) {
      shareMenu.setAttribute("hidden", "");
      shareButton.setAttribute("aria-expanded", "false");
    }
  });

  playerNode.addEventListener("play", updatePlaybackIcon);
  playerNode.addEventListener("pause", updatePlaybackIcon);
  playerNode.addEventListener("error", () => {
    if (hlsInstance) {
      return;
    }
    if (descriptionNode) {
      descriptionNode.textContent = "This station could not be played. The stream may be temporarily unavailable.";
    }
    updatePlaybackIcon();
  });

  updateFavoriteIcon();
  setupShareLinks();
  initPlayer();
})();
