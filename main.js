setInterval(() => {
  console.log("YouTube Ad Skipper Extension - Skipping ads");
  document.querySelector(".ytp-ad-skip-button")?.click();
  document.querySelector(".ytp-ad-overlay-close-button")?.click();
}, 1000);
