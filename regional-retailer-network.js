(function () {
  const REGION_NETWORKS = {
    AU: {
      label: "Australian Retailer Network",
      retailers: [
        { name: "Surfboard Empire", logoFile: "surfboard_empire.png" },
        { name: "Natural Necessity", logoFile: "natural_necessity.png" },
        { name: "Beachin Surf", logoFile: "beachin_surf.png" },
        { name: "The Board Lab", logoFile: "the_board_lab.png" },
        { name: "Onboard Store", logoFile: "onboard_store.png" },
        { name: "Wicks Surf", logoFile: "wicks_surf.png" },
        { name: "Coopers Board Store", logoFile: "coopers_board_store.png" },
        { name: "Sanbah Surf Shop", logoFile: "sanbah_surf_shop.png" },
        { name: "Trigger Bros Surfboards" },
        { name: "Surf FX", logoFile: "surf_fx.png" },
        { name: "Surfection Bondi", logoFile: "surfection_bondi.png" },
        { name: "Sideways Surf", logoFile: "sideways_surf.png" },
        { name: "Aloha Surf Manly", logoFile: "aloha_surf_manly.jpg" },
        { name: "Star Surf and Skate", logoFile: "star_surf_and_skate.jpg" },
        { name: "Powerhouse Surf", logoFile: "powerhouse_surf.webp" },
        { name: "Classic Malibu", logoFile: "classic_malibu.png" },
        { name: "Extreme Boardriders", logoFile: "extreme_boardriders.png" }
      ]
    },
    EU: {
      label: "European Retailer Network",
      retailers: [
        { name: "58 Surf" },
        { name: "Pukas Surf Shop" },
        { name: "Mundo Surf" },
        { name: "Bell Surf" },
        { name: "Surf Boss" },
        { name: "Surf Corner" },
        { name: "Single Quiver" },
        { name: "Board Exchange" },
        { name: "Pop Up Surf Shop" },
        { name: "Noordzee Boardstore" },
        { name: "GSI Europe" },
        { name: "Tablas Surf Shop" }
      ]
    },
    US: {
      label: "United States Retailer Network",
      retailers: [
        { name: "Surf Station" },
        { name: "Jack's Surfboards" },
        { name: "Real Watersports" },
        { name: "Cleanline Surf" },
        { name: "Hawaiian South Shore" },
        { name: "Bird's Surf Shed" },
        { name: "Island Water Sports" },
        { name: "Surf N Sea" },
        { name: "Kimo's Surf Hut" },
        { name: "Moment Surf Co" },
        { name: "Degree 33 Surfboards" },
        { name: "Surfboard Broker" },
        { name: "Infinity Surfboards" },
        { name: "Walden Surfboards" },
        { name: "Stewart Surfboards" },
        { name: "Bing Surfboards" },
        { name: "Robert August Surf Company" },
        { name: "Dark Arts Surf" },
        { name: "Catalyst Surf Shop" },
        { name: "Warm Winds" }
      ]
    },
    ID: {
      label: "Indonesia Retailer Network",
      retailers: [
        { name: "BGS Bali" },
        { name: "Onboard Store Indonesia", logoFile: "onboard_store.png" },
        { name: "Boardriders Bali" },
        { name: "Drifter Surf" }
      ]
    }
  };

  function logoPath(logoFile) {
    return "/assets/retailers/" + logoFile;
  }

  function applyTextFallbackTheme(item) {
    item.classList.add("retailer-network-item-dark");
    item.classList.add("retailer-network-item-text");
  }

  function evaluateRetailerLogoCard(img, item) {
    if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
      return;
    }

    const sampleWidth = Math.min(96, img.naturalWidth);
    const sampleHeight = Math.min(96, img.naturalHeight);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return;
    }

    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    context.clearRect(0, 0, sampleWidth, sampleHeight);
    context.drawImage(img, 0, 0, sampleWidth, sampleHeight);

    const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);
    let transparentPixels = 0;
    let opaquePixels = 0;
    let whitePixels = 0;
    let edgePixels = 0;
    let edgeTransparentPixels = 0;
    let edgeWhitePixels = 0;
    const alphaThreshold = 32;

    for (let y = 0; y < sampleHeight; y += 1) {
      for (let x = 0; x < sampleWidth; x += 1) {
        const offset = (y * sampleWidth + x) * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const alpha = data[offset + 3];
        const isEdge =
          x < 6 ||
          y < 6 ||
          x >= sampleWidth - 6 ||
          y >= sampleHeight - 6;

        if (alpha <= alphaThreshold) {
          transparentPixels += 1;
          if (isEdge) {
            edgePixels += 1;
            edgeTransparentPixels += 1;
          }
          continue;
        }

        opaquePixels += 1;

        const maxChannel = Math.max(red, green, blue);
        const minChannel = Math.min(red, green, blue);
        const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        const lowSaturation = maxChannel - minChannel <= 22;
        const isWhiteish = luminance >= 232 && lowSaturation;

        if (isWhiteish) {
          whitePixels += 1;
        }

        if (isEdge) {
          edgePixels += 1;
          if (isWhiteish) {
            edgeWhitePixels += 1;
          }
        }
      }
    }

    const totalPixels = sampleWidth * sampleHeight;
    const transparentRatio = transparentPixels / totalPixels;
    const whiteRatio = opaquePixels > 0 ? whitePixels / opaquePixels : 0;
    const edgeTransparencyRatio = edgePixels > 0 ? edgeTransparentPixels / edgePixels : 0;
    const edgeWhiteRatio = edgePixels > 0 ? edgeWhitePixels / edgePixels : 0;
    const hasWhiteBackdrop = edgeTransparencyRatio < 0.08 && edgeWhiteRatio > 0.58;
    const shouldUseDarkCard =
      transparentRatio > 0.55 ||
      edgeTransparencyRatio > 0.7 ||
      (whiteRatio > 0.72 && transparentRatio > 0.15 && !hasWhiteBackdrop);

    item.classList.toggle("retailer-network-item-dark", shouldUseDarkCard);
  }

  function buildRetailerItem(retailer) {
    const item = document.createElement("div");
    item.className = "retailer-network-item";
    item.setAttribute("aria-label", retailer.name);

    if (retailer.logoFile) {
      const img = document.createElement("img");
      img.className = "retailer-network-logo";
      img.src = logoPath(retailer.logoFile);
      img.alt = retailer.name;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("load", function () {
        evaluateRetailerLogoCard(img, item);
      });
      img.addEventListener("error", function () {
        item.classList.remove("retailer-network-item-dark");
      });
      item.appendChild(img);
      if (img.complete) {
        queueMicrotask(function () {
          evaluateRetailerLogoCard(img, item);
        });
      }
      return item;
    }

    const name = document.createElement("span");
    name.className = "retailer-network-name";
    name.textContent = retailer.name;
    applyTextFallbackTheme(item);
    item.appendChild(name);
    return item;
  }

  function renderRetailerNetwork(strip) {
    const regionCode = strip.getAttribute("data-region-network");
    const region = REGION_NETWORKS[regionCode];
    const track = strip.querySelector("[data-region-network-track]");
    const label = strip.querySelector("[data-region-network-label]");

    if (!region || !track) {
      return;
    }

    if (label) {
      label.textContent = region.label;
    }

    track.innerHTML = "";

    const repeatedRetailers = region.retailers.concat(region.retailers);
    repeatedRetailers.forEach(function (retailer) {
      track.appendChild(buildRetailerItem(retailer));
    });
  }

  function boot() {
    document
      .querySelectorAll("[data-region-network]")
      .forEach(renderRetailerNetwork);
  }

  window.QuivrrRetailerNetwork = {
    regions: REGION_NETWORKS,
    renderRetailerNetwork: renderRetailerNetwork
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
