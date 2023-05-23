const vm = Vue.createApp({
  data() {
    return {
      itemClassOption,
      optionsByItemClass,
      itemClassValues,
      optionsByItemType,
      itemTypeValues,
      selectedClass: "",
      selectedType: "",
      selectedName: "",
      selectedTier: "T4_",
      selectedEnchant: "",
      selectedQuality: "1",
    };
  },
  watch: {
    selectedClass(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.selectedType = "";
        this.selectedName = "";
      }
    },
  },
  methods: {
    fetchData() {
      this.clearTable();
      let itemClass = this.selectedClass;
      let tier = this.selectedTier;
      let type = this.selectedType;
      let itemName = this.selectedName;
      let enchant = this.selectedEnchant;
      let quality = this.selectedQuality;
      if (itemClass === "" || type === "" || itemName === "") {
        let errString = "";
        if (itemClass === "") errString += "物品類別,";
        if (type === "") errString += "物品種類,";
        if (itemName === "") errString += "物品名稱,";
        alert(errString + " 請填寫正確的搜尋條件");
        return;
      }
      let enchantString =
        enchant === ""
          ? ""
          : type === "MATERIAL" || type === "RAW"
          ? `_LEVEL${enchant}@${enchant}`
          : `@${enchant}`;

      let priceUrl = `https://east.albion-online-data.com/api/v2/stats/prices/${tier}${this.itemTypeValues[itemName]}${enchantString}.json?qualities=${quality}`;
      let historyUrl = `https://east.albion-online-data.com/api/v2/stats/history/${tier}${this.itemTypeValues[itemName]}${enchantString}.json?qualities=${quality}&time-scale=1`;
      let imgUrl = `https://render.albiononline.com/v1/item/${tier}${this.itemTypeValues[itemName]}${enchantString}.png`;
      Promise.all([
        fetch(priceUrl).then((res) => res.json()),
        fetch(historyUrl).then((res) => res.json()),
      ]).then((data) => {
        let table = document.getElementById("table");
        table.classList.add("my-table");
        const itemImg = document.createElement("img");
        itemImg.src = imgUrl;
        document.getElementById("itemImg").appendChild(itemImg);

        let headerRow = document.createElement("tr");
        let headers = [
          "城市",
          "賣出單/直接買入價",
          "賣出價最後更新時間",
          "買入單/直接賣出價",
          "買入價最後更新時間",
          `過去有記錄一小時成交量`,
          `過去有記錄一小時平均價格`,
        ];

        headers.forEach((header) => {
          let th = document.createElement("th");
          th.textContent = header;
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        let cities = data[0]
          .map((item) => item.city)
          .filter((value, index, self) => self.indexOf(value) === index);
        cities.forEach((city) => {
          let row = document.createElement("tr");

          row.setAttribute("data-city", city);
          let cityNameCell = document.createElement("td");
          cityNameCell.textContent = city;

          row.appendChild(cityNameCell);

          let cityItems = data[0].filter((item) => item.city === city);

          let itemdata = data[1].find((item) => item.location === city)
            ? data[1].find((item) => item.location === city)
            : "無資料";

          headers.slice(1).forEach((header) => {
            let cell = document.createElement("td");
            let price;
            let date;

            if (
              header === "賣出單/直接買入價" &&
              Math.min(...cityItems.map((item) => item.sell_price_min)) ==
                "0" &&
              cityItems.map((item) => item.sell_price_min_date) ==
                "0001-01-01T00:00:00"
            ) {
              price = "無資料";
            } else if (
              header === "買入單/直接賣出價" &&
              Math.min(...cityItems.map((item) => item.buy_price_min)) == "0" &&
              cityItems.map((item) => item.buy_price_min_date) ==
                "0001-01-01T00:00:00"
            ) {
              price = "無資料";
            } else if (header === "賣出單/直接買入價") {
              price = Math.min(...cityItems.map((item) => item.sell_price_min));
            } else if (header === "賣出價最後更新時間") {
              date = cityItems.map((item) => item.sell_price_min_date);
            } else if (header === "買入單/直接賣出價") {
              price = Math.max(...cityItems.map((item) => item.buy_price_max));
            } else if (header === "買入價最後更新時間") {
              date = cityItems.map((item) => item.buy_price_max_date);
            } else if (header === "過去有記錄一小時成交量") {
              price =
                itemdata == "無資料"
                  ? "無資料"
                  : itemdata.data[itemdata.data.length - 1].item_count;
            } else if (header === "過去有記錄一小時平均價格") {
              price =
                itemdata == "無資料"
                  ? "無資料"
                  : itemdata.data[itemdata.data.length - 1].avg_price;
            }
            const utcDate = new Date(date);
            const offset = 8; // UTC+8 timezone offset
            const localTimestamp = new Date(
              utcDate.getTime() + offset * 60 * 60 * 1000
            );
            const time = localTimestamp.toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: false,
            });

            cell.textContent = header.includes("最後更新時間")
              ? time != "1/1, 08:00"
                ? time
                : "無資料"
              : price;

            row.appendChild(cell);
          });

          table.appendChild(row);
        });
        let cell = document.querySelector('tr[data-city="5003"]');
        if (cell) {
          cell.querySelector("td:first-child").textContent = "Brecilien";
        }
      });
    },
    clearTable() {
      const existingImg = document.getElementById("itemImg");
      const existingTable = document.getElementById("table");
      if (existingTable) {
        existingTable.innerHTML = "";
      }
      if (existingImg) {
        existingImg.innerHTML = "";
      }
    },
  },
}).mount("#app");
