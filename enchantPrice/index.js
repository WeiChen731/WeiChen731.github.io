const vm = Vue.createApp({
  data() {
    return {
      cities,
      selectedCity: "5003",
      selectedTier: "",
    };
  },
  methods: {
    async calculateEnchantPrice() {
      this.clearTable();
      let city = this.selectedCity;
      let tier = this.selectedTier;
      let itemNameList = ["Rune", "SOUL", "RELIC", "總共", "整套(不含背包)"];

      let table = document.getElementById("table");
      table.classList.add("my-table");

      let headerRow = document.createElement("tr");
      let headers = [
        "城市",
        "賣出最低價格",
        "賣出最低價格時間",
        "賣出最高價格",
        "賣出最高價格時間",
        "頭腳披風、副手",
        "衣服、背包",
        "單手武器",
        "雙手武器",
      ];

      headers.forEach((header) => {
        let th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      for (var i = 4; i <= 8; i++) {
        let helmetTotal = 0;
        let bodyTotal = 0;
        let oneHandTotal = 0;
        let twoHandTotal = 0;
        let oneHandAll = 0;
        let twoHandAll = 0;
        for (var j = 0; j < itemNameList.length; j++) {
          let tierString = tier === "" ? `T${i}_` : tier;
          let priceUrl = `https://east.albion-online-data.com/api/v2/stats/prices/${tierString}${itemNameList[j]}.json?locations=${city}`;
          await fetch(priceUrl)
            .then((resp) => resp.json())
            .then((data) => {
              let item = data[0];
              let row = document.createElement("tr");
              let itemNameCell = document.createElement("td");
              let itemName = "";
              if (j == 3) {
                itemName = "總共";
              } else if (j == 4) {
                itemName = "整套(不含包包)";
              } else {
                itemName = item.item_id;
              }

              if (itemName.includes("RUNE")) {
                itemName = itemName.replace("RUNE", "符文");
              } else if (itemName.includes("SOUL")) {
                itemName = itemName.replace("SOUL", "精魂");
              } else if (itemName.includes("RELIC")) {
                itemName = itemName.replace("RELIC", "聖物");
              }

              itemNameCell.textContent = itemName;
              row.appendChild(itemNameCell);

              headers.slice(1).forEach((header) => {
                let cell = document.createElement("td");
                let content;
                if (j == 0 || j == 1 || j == 2) {
                  if (header === "賣出最低價格") {
                    content = item.sell_price_min;
                  } else if (header === "賣出最低價格時間") {
                    content = item.sell_price_min_date;
                  } else if (header === "賣出最高價格") {
                    content = item.sell_price_max;
                  } else if (header === "賣出最高價格時間") {
                    content = item.sell_price_max_date;
                  } else if (header === "頭腳披風、副手") {
                    content = 48 * item.sell_price_min;
                    helmetTotal += content;
                  } else if (header === "衣服、背包") {
                    content = 96 * item.sell_price_min;
                    bodyTotal += content;
                  } else if (header === "單手武器") {
                    content = 144 * item.sell_price_min;
                    oneHandTotal += content;
                  } else if (header === "雙手武器") {
                    content = 192 * item.sell_price_min;
                    twoHandTotal += content;
                  }
                } else if (j == 3) {
                  if (header === "頭腳披風、副手") {
                    content = helmetTotal;
                  } else if (header === "衣服、背包") {
                    content = bodyTotal;
                  } else if (header === "單手武器") {
                    content = oneHandTotal;
                  } else if (header === "雙手武器") {
                    content = twoHandTotal;
                  }
                } else if (j == 4) {
                  if (header === "單手武器") {
                    content = helmetTotal * 4 + bodyTotal + oneHandTotal;
                  } else if (header === "雙手武器") {
                    content = helmetTotal * 4 + bodyTotal + twoHandTotal;
                  }
                }

                cell.textContent = content;

                row.appendChild(cell);
              });
              table.appendChild(row);
            });
          if (tierString === tier && j == itemNameList.length - 1) {
            return;
          }
        }
        let row = document.createElement("tr");
        row.setAttribute("id", "blank");
        // let cell = document.createElement("td");
        // row.appendChild(cell);
        table.appendChild(row);
      }
    },
    clearTable() {
      const existingTable = document.getElementById("table");
      if (existingTable) {
        const table = document.getElementById("table");
        table.innerHTML = "";
      }
    },
  },
}).mount("#app");
