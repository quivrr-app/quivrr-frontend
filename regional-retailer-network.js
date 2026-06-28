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
      item.appendChild(img);
      return item;
    }

    const name = document.createElement("span");
    name.className = "retailer-network-name";
    name.textContent = retailer.name;
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
