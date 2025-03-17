// multichart.js
let drawChart1, drawChart2, drawChart3, drawChart4, drawChart5, drawChart6, drawChart7, drawChart8, drawChart9, drawChart10, drawChart11, drawChart12;

const selector = d3.select("#chartSelector");
const chartDiv = d3.select("#chart");
const bigchartDiv = d3.select("#bigchart");

const tableauClassic20 = [
  "#4E79A7", "#A0CBE8", // Xanh dương
  "#F28E2B", "#FFBE7D", // Cam
  "#59A14F", "#8CD17D", // Xanh lá
  "#B6992D", "#F1CE63", // Vàng
  "#499894", "#86BCB6", // Xanh nước biển
  "#E15759", "#FF9D9A", // Đỏ
  "#79706E", "#BAB0AC", // Xám
  "#D37295", "#FFB7D5", // Hồng
  "#B07AA1", "#D4A6C8", // Tím
  "#9D7660", "#D7B5A6"  // Nâu
];

// Hàm xóa biểu đồ
function clearChart() {
  chartDiv.select("svg").remove();
  bigchartDiv.selectAll("svg").remove();
  bigchartDiv.selectAll("h3").remove();
  bigchartDiv.attr("style", null);
}

function formatVND(value) {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(".", ",") + " tr";
  }
  return value.toLocaleString("vi-VN"); // Định dạng số bình thường
}

// Đọc dữ liệu từ file CSV
d3.csv("data.csv", function (d) {
  d["Mặt hàng"] = `[${d["Mã mặt hàng"]}] ${d["Tên mặt hàng"]}`;
  d["Nhóm hàng"] = `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`;
  d["Tháng"] = `Tháng ${d3.timeFormat("%m")(new Date(d["Thời gian tạo đơn"]))}`;
  return d;
}).then(function (data) {
  // Hàm vẽ biểu đồ doanh số theo sản phẩm
  drawChart1 = function() {
    clearChart();

    const revenueByItem = d3.rollup(
      data,
      (v) => ({
        revenue: d3.sum(v, (d) => +d["Thành tiền"]),
        group: v[0]["Nhóm hàng"],
      }),
      (d) => `[${d["Mã mặt hàng"]}] ${d["Tên mặt hàng"]}`
    );

    const dataset = Array.from(revenueByItem, ([item, { revenue, group }]) => ({
      item,
      revenue,
      group,
    })).sort((a, b) => d3.descending(a.revenue, b.revenue));

    Ve_Chart_Ngang(dataset, "Q1");
  }

  // Hàm vẽ biểu đồ doanh số theo nhóm hàng
  drawChart2 = function() {
    clearChart();

    const revenueByGroup = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => +d["Thành tiền"]),
      (d) => d["Nhóm hàng"]
    );

    const dataset = Array.from(revenueByGroup, ([group, revenue]) => ({
      item: group,
      revenue,
      group,
    })).sort((a, b) => d3.descending(a.revenue, b.revenue));

    Ve_Chart_Ngang(dataset, "Q2");
  }

  // Hàm vẽ biểu đồ doanh số theo tháng
  drawChart3 = function() {
    clearChart();

    const revenueByMonth = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => +d["Thành tiền"]),
      (d) => d["Tháng"]
    );

    const dataset = Array.from(revenueByMonth, ([month, revenue]) => ({
      item: month,
      revenue,
      group: "Tháng",
    })).sort((a, b) => d3.ascending(a.item, b.item));

    Ve_Chart_Doc(dataset, "Q3");
  }

  drawChart4 = function() {
    clearChart();

    // Tạo hàm định dạng ngày trong tuần (Saturday, Sunday, ...)
    const formatDayOfWeek = d3.timeFormat("%A");

    // Mapping từ tiếng Anh sang tiếng Việt
    const dayMapping = {
        "Monday": "Thứ hai",
        "Tuesday": "Thứ ba",
        "Wednesday": "Thứ tư",
        "Thursday": "Thứ năm",
        "Friday": "Thứ sáu",
        "Saturday": "Thứ bảy",
        "Sunday": "Chủ nhật"
    };

    // Chuẩn hóa thời gian thành "YYYY-MM-DD" để tính ngày duy nhất
    const parseDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // Trả về định dạng "YYYY-MM-DD"
    };

    // Nhóm dữ liệu theo ngày trong tuần
    const revenueByDayOfWeek = d3.rollup(
        data,
        (v) => {
            const totalRevenue = d3.sum(v, (d) => +d["Thành tiền"]);

            // Lấy số ngày duy nhất trong nhóm (theo "YYYY-MM-DD")
            const uniqueDays = new Set(v.map(d => parseDate(d["Thời gian tạo đơn"]))).size;

            // Tính doanh số trung bình
            return uniqueDays > 0 ? totalRevenue / uniqueDays : 0;
        },
        (d) => dayMapping[formatDayOfWeek(new Date(d["Thời gian tạo đơn"]))]
    );

    // Định nghĩa thứ tự ngày trong tuần bằng tiếng Việt
    const dayOrder = {
        "Thứ hai": 1,
        "Thứ ba": 2,
        "Thứ tư": 3,
        "Thứ năm": 4,
        "Thứ sáu": 5,
        "Thứ bảy": 6,
        "Chủ nhật": 7
    };

    // Chuyển đổi thành mảng và sắp xếp theo thứ tự ngày trong tuần
    const dataset = Array.from(revenueByDayOfWeek, ([day, avgRevenue]) => ({
        item: day,
        revenue: avgRevenue,
        group: "Ngày trong tuần",
    })).sort((a, b) => dayOrder[a.item] - dayOrder[b.item]);

    // Kiểm tra dữ liệu đầu ra
    console.log("Dataset:", dataset);

    // Vẽ biểu đồ ngang
    Ve_Chart_Doc(dataset, "Q4");
  }
  
  drawChart5 = function() {
    clearChart();

    // Hàm lấy ngày trong tháng (01, 02, ..., 31)
    const getDayOfMonth = (dateString) => {
        const date = new Date(dateString);
        return `Ngày ${String(date.getDate()).padStart(2, '0')}`; // Định dạng "Ngày 01", "Ngày 02", ...
    };

    // Chuẩn hóa thời gian thành "YYYY-MM-DD" để tính ngày duy nhất
    const parseDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // Trả về định dạng "YYYY-MM-DD"
    };

    // Nhóm dữ liệu theo ngày trong tháng
    const revenueByDayOfMonth = d3.rollup(
        data,
        (v) => {
            const totalRevenue = d3.sum(v, (d) => +d["Thành tiền"]);

            // Lấy số ngày duy nhất trong nhóm (theo "YYYY-MM-DD")
            const uniqueDays = new Set(v.map(d => parseDate(d["Thời gian tạo đơn"]))).size;

            // Tính doanh số trung bình
            return uniqueDays > 0 ? totalRevenue / uniqueDays : 0;
        },
        (d) => getDayOfMonth(d["Thời gian tạo đơn"])
    );

    // Chuyển đổi thành mảng và sắp xếp theo thứ tự ngày trong tháng
    const dataset = Array.from(revenueByDayOfMonth, ([day, avgRevenue]) => ({
        item: day,
        revenue: avgRevenue,
        group: "Ngày trong tháng",
    })).sort((a, b) => a.item.localeCompare(b.item, undefined, { numeric: true }));

    // Vẽ biểu đồ ngang
    Ve_Chart_Doc(dataset, "Q5");
    } 

  drawChart6 = function() {
    clearChart();

    // Hàm xác định khung giờ (ví dụ: "08:00-08:59")
    const getTimeRange = (dateString) => {
        const date = new Date(dateString);
        const hour = date.getHours();
        const startHour = String(hour).padStart(2, '0');
        const endHour = String(hour + 1).padStart(2, '0');
        return `${startHour}:00-${endHour}:00`;
    };

    // Chuẩn hóa thời gian thành "YYYY-MM-DD" để tính ngày duy nhất
    const parseDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // Trả về định dạng "YYYY-MM-DD"
    };

    // Nhóm dữ liệu theo khung giờ
    const revenueByTimeRange = d3.rollup(
        data,
        (v) => {
            const totalRevenue = d3.sum(v, (d) => +d["Thành tiền"]);

            // Lấy số ngày duy nhất trong nhóm (theo "YYYY-MM-DD")
            const uniqueDays = new Set(v.map(d => parseDate(d["Thời gian tạo đơn"]))).size;

            // Tính doanh số trung bình
            return uniqueDays > 0 ? totalRevenue / uniqueDays : 0;
        },
        (d) => getTimeRange(d["Thời gian tạo đơn"])
    );

    // Tạo danh sách khung giờ từ 08:00-08:59 đến 23:00-23:59
    const timeRanges = Array.from({ length: 16 }, (_, i) => {
        const startHour = String(i + 8).padStart(2, '0'); // Bắt đầu từ 08:00
        const endHour = String(i + 9).padStart(2, '0');
        return `${startHour}:00-${endHour}:00`;
    });

    // Tạo dataset và đảm bảo đầy đủ các khung giờ (nếu thiếu thì doanh số = 0)
    const dataset = timeRanges.map((timeRange) => ({
        item: timeRange,
        revenue: revenueByTimeRange.get(timeRange) || 0,
        group: "Khung giờ",
    }));

    // Kiểm tra dữ liệu đầu ra
    console.log("Dataset (Khung giờ):", dataset);

    // Vẽ biểu đồ ngang
    Ve_Chart_Doc(dataset, "Q6");
  }

  drawChart7 = function() {
    clearChart();
    // Tổng số đơn hàng (unique Mã đơn hàng)
    const totalOrders = new Set(data.map(d => d["Mã đơn hàng"])).size;

    // Tính xác suất bán hàng theo nhóm hàng
    const probabilityByGroup = d3.rollup(
        data,
        (v) => {
            // Số lượng đơn hàng duy nhất theo nhóm
            const uniqueOrders = new Set(v.map(d => d["Mã đơn hàng"])).size;

            // Xác suất bán hàng = Số lượng đơn hàng duy nhất / Tổng số đơn hàng
            return uniqueOrders / totalOrders;
        },
        (d) => d["Nhóm hàng"]
    );

    // Chuyển đổi thành mảng và sắp xếp theo xác suất giảm dần
    const dataset = Array.from(probabilityByGroup, ([group, probability]) => ({
      item: group,
      revenue: probability, // Xác suất bán hàng (dạng thập phân)
      revenueFormatted: (probability * 100).toFixed(1) + "%", // Chuyển thành phần trăm
      group: group,
    })).sort((a, b) => d3.descending(a.revenue, b.revenue));

    // Kiểm tra dữ liệu đầu ra
    console.log("Dataset (Xác suất bán hàng theo nhóm hàng):", dataset);

    // Vẽ biểu đồ ngang
    Ve_Chart_Ngang(dataset, "Q7");
  }

  drawChart8 = function() {
    clearChart();

    // Tổng số đơn hàng (unique Mã đơn hàng) theo tháng
    const totalOrdersByMonth = d3.rollup(
      data,
      (v) => new Set(v.map((d) => d["Mã đơn hàng"])).size,
      (d) => d["Tháng"]
    );

    // Tính xác suất bán hàng và số lượng đơn bán theo nhóm hàng và tháng
    const probabilityByGroupAndMonth = d3.rollup(
      data,
      (v) => {
        const uniqueOrders = new Set(v.map((d) => d["Mã đơn hàng"])).size; // Số lượng đơn duy nhất
        const month = v[0]["Tháng"];
        const probability = uniqueOrders / totalOrdersByMonth.get(month);
        return { probability, orderCount: uniqueOrders }; // Trả về cả xác suất và số lượng đơn
      },
      (d) => d["Nhóm hàng"],
      (d) => d["Tháng"]
    );

    // Chuyển đổi thành mảng
    const dataset = Array.from(probabilityByGroupAndMonth, ([group, months]) => {
      return {
        group,
        values: Array.from(months, ([month, { probability, orderCount }]) => ({
          month,
          probability,
          probabilityFormatted: (probability * 100).toFixed(1) + "%", // Xác suất dạng %
          orderCount, // Thêm số lượng đơn bán
        })).sort((a, b) => d3.ascending(a.month, b.month)),
      };
    });

    // Vẽ biểu đồ đường
    drawLineChart(dataset, "Q8");
  }

  drawChart9 = function() {
    clearChart();

    // Tổng số đơn hàng theo từng Nhóm hàng
    const totalOrdersByGroup = d3.rollup(
      data,
      (v) => new Set(v.map(d => d["Mã đơn hàng"])).size,
      (d) => d["Nhóm hàng"]
    );

    // Tính xác suất bán hàng theo Mặt hàng trong mỗi Nhóm hàng
    const probabilityByItem = d3.rollup(
      data,
      (v) => {
        const group = v[0]["Nhóm hàng"];
        const uniqueOrders = new Set(v.map(d => d["Mã đơn hàng"])).size;

        // Xác suất bán hàng = Số lượng đơn hàng duy nhất / Tổng số đơn hàng trong Nhóm hàng
        return uniqueOrders / totalOrdersByGroup.get(group);
      },
      (d) => d["Nhóm hàng"],
      (d) => d["Mặt hàng"]
    );

    // Tạo dataset: mỗi phần tử là một nhóm hàng với các mặt hàng con
    const dataset = Array.from(probabilityByItem, ([group, items]) => {
      return {
        group: group,
        items: Array.from(items, ([item, probability]) => ({
          item: item,
          revenue: probability,
          revenueFormatted: (probability * 100).toFixed(1) + "%",
          group: group
        })).sort((a, b) => d3.descending(a.revenue, b.revenue))
      };
    });

    d3.select("#bigchart")
      .style("width", "1800px")
      .style("height", "900px")
      .style("display", "grid")
      .style("grid-template-columns", "repeat(3, 1fr)")
      .style("grid-template-rows", "repeat(2, 1fr)")
      .style("gap", "10px");

    // Lấy 5 nhóm lớn nhất
    const topGroups = d3.groups(data, d => d["Nhóm hàng"])
                        .sort((a, b) => d3.descending(d3.sum(a[1], d => d.revenue), d3.sum(a[1], d => d.revenue)))
                        .slice(0, 5);

    // ✅ Bước 1: Tạo danh sách tất cả các Mặt hàng duy nhất từ toàn bộ dataset
    const allItems = Array.from(new Set(dataset.flatMap(d => d.items.map(item => item.item))));

    const colorScale = d3.scaleOrdinal(tableauClassic20).domain(allItems);

    topGroups.forEach((groupData, index) => {
      const containerId = `chart9-container-${index}`;
      // Tạo phần tử chứa biểu đồ + tiêu đề
      const chartContainer = d3.select("#bigchart")
        .append("div")
        .attr("id", containerId)
        .style("border", "1px solid #ccc")
        .style("box-shadow", "0 4px 8px rgba(0, 0, 0, 0.1)")
        .style("border-radius", "8px")
        .style("padding", "10px");

      // Lấy dữ liệu Mặt hàng theo từng Nhóm hàng
      const chartData = dataset.find(d => d.group === groupData[0]).items;

      // Gọi Ve_Chart với colorScale dùng chung
      Ve_Chart(chartData, "Q9", containerId, colorScale);
    });
  }

  drawChart11 = function() {
    clearChart();

    // Tính số lần mua của mỗi khách hàng
    const purchasesByCustomer = d3.rollup(
      data,
      (v) => new Set(v.map(d => d["Mã đơn hàng"])).size,
      (d) => d["Mã khách hàng"]
    );

    // Tính số lượng khách hàng theo số lần mua
    const purchaseFrequency = d3.rollup(
      Array.from(purchasesByCustomer.values()),
      (v) => v.length,
      (count) => count
    );

    const dataset = Array.from(purchaseFrequency, ([purchases, customers]) => ({
      item: purchases,
      customers,
      group: "Số lần mua"
    })).sort((a, b) => d3.ascending(a.item, b.item));

    VeChart_11_12(dataset, "Q11");
  }

  drawChart12 = function() {
    clearChart();

    // Tính tổng Thành tiền của mỗi khách hàng
    const spendingByCustomer = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d["Thành tiền"]),
      (d) => d["Mã khách hàng"]
    );

    // Xác định bin (khoảng mức chi trả cách nhau 50,000)
    const binSize = 50000;
    const binnedData = d3.rollup(
      Array.from(spendingByCustomer.values()),
      (v) => v.length,
      (amount) => Math.floor(amount / binSize) * binSize
    );

    // Tạo dataset từ binnedData
    const dataset = Array.from(binnedData, ([spending, customers]) => ({
      item: spending, // Mức chi trả (theo bin)
      customers: customers,
      group: "Mức chi trả"
    })).sort((a, b) => d3.ascending(a.item, b.item));

    // Vẽ biểu đồ
    VeChart_11_12(dataset, "Q12");
  };

  // Hàm vẽ biểu đồ cột chung
  function Ve_Chart_Ngang(dataset, chartType) {
    const tableauClassic10 = [
      "#4E79A7", // Xanh dương
      "#F28E2B", // Cam
      "#E15759", // Đỏ
      "#76B7B2", // Xanh nước biển
      "#59A14F", // Xanh lá
      "#EDC948", // Vàng
      "#B07AA1", // Tím
      "#FF9DA7", // Hồng
      "#9C755F", // Nâu
      "#BAB0AC", // Xám
    ];
    const margin = { top: 20, right: 40, bottom: 40, left: 220 };
    const width = 1000;
    const height = 600;

    const svg = chartDiv
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const y = d3.scaleBand()
      .domain(dataset.map((d) => d.item))
      .range([0, height])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(dataset, (d) => d.revenue) * 1.15])
      .range([0, width - 200]);

    const colorScale = d3.scaleOrdinal()
      .domain(chartType === "Q1" || chartType === "Q2"
        ? Array.from(new Set(dataset.map((d) => d.group))).sort(d3.ascending) // Q1: Sắp xếp tăng dần
        : chartType === "Q7"
        ? Array.from(new Set(data.map((d) => d["Nhóm hàng"]))) // Q7: Lấy từ dữ liệu gốc
        : Array.from(new Set(dataset.map(d => d.group))) // Mặc định
      )
      .range(tableauClassic10);

    // Vẽ trục
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .attr("class", "axis-label");

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => {
        if (chartType === "Q7") {
          return d3.format(".0%")(d); // Hiển thị phần trăm (0%, 10%, 20%...)
        }
        if (d < 1000) return d;                          // Hiển thị số nhỏ hơn 1000
        if (d < 1000000) return (d / 1000) + "K";        // Hiển thị từ 1K đến 999K
        if (d < 1000000000) return (d / 1000000) + "M";  // Hiển thị từ 1M đến 999M
        return (d / 1000000000) + "B";                  // Hiển thị từ 1B trở lên
      }))


    // Vẽ gridlines dọc (trục X - scaleLinear hoặc scaleBand)
    svg.selectAll("line.vertical-grid")
      .data(x.ticks())        // Tạo các vạch lưới theo trục X
      .enter()
      .append("line")
      .attr("class", "vertical-grid")
      .attr("x1", (d) => x(d)) // Bắt đầu từ từng giá trị của trục X
      .attr("y1", 0)           // Bắt đầu từ đỉnh (top)
      .attr("x2", (d) => x(d)) // Kết thúc cùng vị trí theo trục X
      .attr("y2", height)      // Kéo xuống đáy (bottom)
      .style("stroke", "gray") // Màu lưới
      .style("opacity", 0.2); // Độ mờ
    

    svg.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.item))
      .attr("width", (d) => x(d.revenue))
      .attr("height", y.bandwidth())
      .attr("fill", (d) => chartType === "Q7" ? colorScale(d.item) : colorScale(d.group));


    // Hiển thị giá trị trên thanh
    svg.selectAll(".label")
      .data(dataset)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.revenue) + 5)
      .attr("y", (d) => y(d.item) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("font-size", "10px")
      .text((d) => chartType === "Q7" ? d.revenueFormatted : `${d3.format(",.0f")(d.revenue / 1000000)} triệu VND`);


     // Thêm legend chỉ cho chart1
    if (chartType === "Q1") {
      const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .attr("transform", "translate(0, 50)")
        .selectAll("g")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

      legend.append("rect")
        .attr("x", width - 100)
        .attr("y", -50)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", colorScale);

      legend.append("text")
        .attr("x", width - 75)
        .attr("y", 9.5-50)
        .attr("dy", "0.32em")
        .text((d) => d);
    }
  }


  function Ve_Chart_Doc(dataset, chartType) {
    clearChart();
    const tableauClassic10 = [
      "#4E79A7", // Xanh dương
      "#F28E2B", // Cam
      "#E15759", // Đỏ
      "#76B7B2", // Xanh nước biển
      "#59A14F", // Xanh lá
      "#EDC948", // Vàng
      "#B07AA1", // Tím
      "#FF9DA7", // Hồng
      "#9C755F", // Nâu
      "#BAB0AC", // Xám
    ];
    
    const tableauClassic20 = [
      "#4E79A7", "#A0CBE8", // Xanh dương
      "#F28E2B", "#FFBE7D", // Cam
      "#59A14F", "#8CD17D", // Xanh lá
      "#B6992D", "#F1CE63", // Vàng
      "#499894", "#86BCB6", // Xanh nước biển
      "#E15759", "#FF9D9A", // Đỏ
      "#79706E", "#BAB0AC", // Xám
      "#D37295", "#FFB7D5", // Hồng
      "#B07AA1", "#D4A6C8", // Tím
      "#9D7660", "#D7B5A6"  // Nâu
    ];

    const tableauClassic40 = [
      "#4E79A7", "#A0CBE8", "#1F77B4", "#6BAED6", // Xanh dương
      "#F28E2B", "#FFBE7D", "#FF7F0E", "#FDB863", // Cam
      "#59A14F", "#8CD17D", "#2CA02C", "#66C2A5", // Xanh lá
      "#B6992D", "#F1CE63", "#BCBD22", "#FFD92F", // Vàng
      "#499894", "#86BCB6", "#17BECF", "#74C476", // Xanh nước biển
      "#E15759", "#FF9D9A", "#D62728", "#E41A1C", // Đỏ
      "#79706E", "#BAB0AC", "#7F7F7F", "#999999", // Xám
      "#D37295", "#FFB7D5", "#E377C2", "#FDA4D4", // Hồng
      "#B07AA1", "#D4A6C8", "#9467BD", "#BC80BD", // Tím
      "#9D7660", "#D7B5A6", "#8C564B", "#D9A679"  // Nâu
    ];
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };
    const width = 1100;
    const height = 600;

    const svg = chartDiv.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
      .domain(dataset.map(d => d.item))
      .range([0, width])
      .padding(0.2);

    
    const y = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.revenue)])
      .range([height, 0]);

    const selectedColors = chartType === "Q5"
      ? tableauClassic40
      : (chartType === "Q3" || chartType === "Q6" ? tableauClassic20 : tableauClassic10);

    const colorScale = d3.scaleOrdinal()
      .domain(dataset.map(d => d.item))
      .range(selectedColors);

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat((d) => {
          if (d < 1000) return d;                          // Hiển thị số nhỏ hơn 1000
          if (d < 1000000) return (d / 1000) + "K";        // Hiển thị từ 1K đến 999K
          if (d < 1000000000) return (d / 1000000) + "M";  // Hiển thị từ 1M đến 999M
          return (d / 1000000000) + "B";                  // Hiển thị từ 1B trở lên
      }));

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", chartType === "Q5" ? "rotate(-45)" : "rotate(0)")
      .style("text-anchor", chartType === "Q5" ? "end" : "middle");

    svg.selectAll("line.horizontal-grid")
      .data(y.ticks())  // Tạo 10 vạch lưới (có thể chỉnh số lượng)
      .enter()
      .append("line")
      .attr("class", "horizontal-grid")
      .attr("x1", 0)            // Bắt đầu từ cạnh trái
      .attr("y1", (d) => y(d))  // Vị trí dọc theo trục Y
      .attr("x2", width)        // Kết thúc ở cạnh phải
      .attr("y2", (d) => y(d))  // Cùng tọa độ Y
      .style("stroke", "gray")  // Màu lưới
      .style("opacity", 0.2);  // Độ mờ

    svg.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("x", d => x(d.item))
      .attr("y", d => y(d.revenue)) 
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.revenue))
      .attr("fill", (d) => colorScale(d.item));
      
      svg.selectAll(".label")
      .data(dataset)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.item) + x.bandwidth() / 2)  // Căn giữa cột
      .attr("y", d => y(d.revenue) - 5)  // Đặt nhãn phía trên cột
      .attr("text-anchor", "middle")  // Căn giữa theo chiều ngang
      .style("fill", "black")  // Màu chữ
      .style("font-size", "10px")
      .text(d => {
        if (chartType === "Q3") {
          return `${d3.format(",.0f")(d.revenue / 1_000_000)} triệu VND`;
        } else if (chartType === "Q5") {
          return formatVND(d.revenue);
        }
        return `${d3.format(",.0f")(d.revenue)} VND`;
    });
    
  }

  function drawLineChart(dataset, chartType) {
    // Kích thước biểu đồ
    const margin = { top: 40, right: 210, bottom: 50, left: 70 },
          width = 1000
          height = 600

    // Xóa biểu đồ cũ nếu có
    d3.select("#chart").selectAll("*" ).remove();

    // Tạo SVG container
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tạo danh sách các tháng (T01, T02, ...)
    const months = dataset[0].values.map(d => d.month);

    // Thang đo trục X (danh mục các tháng)
    const x = d3.scalePoint()
      .domain(months)
      .range([0, width])
      .padding(0.5);

    // Thang đo trục Y (0% - 100%)
    const y = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d3.max(d.values, v => v.probability)) * 1.1])
      .range([height, 0]);

    // Sắp xếp nhóm hàng tăng dần
    const sortedGroups = dataset.map(d => d.group).sort(d3.ascending);

    // Tạo colorScale dựa theo nhóm hàng đã sắp xếp
    const colorScale = d3.scaleOrdinal()
      .domain(sortedGroups)
      .range(d3.schemeTableau10);

    // Tạo trục X
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px");

    // Tạo trục Y với định dạng phần trăm
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${(d * 100).toFixed(0)}%`))
      .selectAll("text")
      .style("font-size", "12px");

    // Tạo đường line
    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.probability));

    // Vẽ mỗi đường theo nhóm hàng
    svg.selectAll(".line")
      .data(dataset)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.group))
      .attr("stroke-width", 2)
      .attr("d", d => line(d.values));
    // Tạo legend (chú thích nhóm hàng)
    const legend = svg.selectAll(".legend")
      .data(sortedGroups)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width + 40}, ${i * 25})`);

      // Thêm ô màu
      legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => colorScale(d));

      // Thêm nhãn chú thích
      legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .text(d => d);

    // Thêm đường ngang gridlines (opacity 20%)
    svg.selectAll(".y-grid")
      .data(y.ticks()) // Lấy các giá trị tick từ thang đo Y
      .enter()
      .append("line")
      .attr("class", "y-grid")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.8)
      .attr("opacity", 0.2);

    // Tooltip khi hover
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("border-radius", "4px");

    svg.selectAll(".dot")
      .data(dataset.flatMap(d => d.values.map(v => ({ group: d.group, ...v }))))
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.month))
      .attr("cy", d => y(d.probability))
      .attr("r", 4)
      .style("fill", d => colorScale(d.group))
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .html(`<strong>Nhóm hàng:</strong> ${d.group}<br>
                 <strong>Tháng:</strong> ${d.month}<br>
                 <strong>Xác suất theo tháng:</strong> ${(d.probability * 100).toFixed(1)}%<br>
                 <strong>Số lượng đơn:</strong> ${d.orderCount}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY - 20}px`).style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));
  }

  function Ve_Chart(dataset, chartType, containerId, colorScale) {
    // Xóa nội dung container cụ thể (tránh bị chồng chéo khi vẽ lại)
    d3.select(`#${containerId}`).html("");

    const margin = { top: 40, right: 1, bottom: 50, left: 200 },
          width = 360
          height = 300
        
    // Tạo SVG cho mỗi chart
    const svg = d3.select(`#${containerId}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tạo thang đo Y (Mặt hàng)
    const y = d3.scaleBand()
      .domain(dataset.map(d => d.item))
      .range([0, height])
      .padding(0.3);

    // Tạo thang đo X (Xác suất bán hàng)
    const x = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.revenue)])
      .range([0, width-70]);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ddd")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("opacity", 0);

    svg.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => y(d.item))
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.revenue))
      .attr("fill", d => colorScale(d.item))
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
          .html(`Mặt hàng: ${d.item}<br>Nhóm hàng: ${dataset[0].group}<br>Xác suất Bán / Nhóm hàng: ${d.revenueFormatted}`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // Vẽ trục Y (Mặt hàng)
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    // Vẽ trục X (Xác suất, dạng phần trăm)
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")));

    // Thêm tiêu đề cho biểu đồ
    svg.append("text")
    .attr("x", width / 4)              // Căn giữa theo chiều ngang
    .attr("y", -20)                    // Đẩy lên phía trên
    .attr("text-anchor", "middle")     // Căn giữa văn bản
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .style("fill", "#4E79A7")
    .text(`${dataset[0].group}`);
  } 


  function VeChart_11_12(dataset, chartType) {
    const tableauClassic10 = [
      "#4E79A7", // Xanh dương
      "#F28E2B", // Cam
      "#E15759", // Đỏ
      "#76B7B2", // Xanh nước biển
      "#59A14F", // Xanh lá
      "#EDC948", // Vàng
      "#B07AA1", // Tím
      "#FF9DA7", // Hồng
      "#9C755F", // Nâu
      "#BAB0AC", // Xám
    ];

    const margin = { top: 20, right: 40, bottom: chartType === "Q12" ? 80 : 40, left: 50 };
    const width = 1200;
    const height = 600;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
      .domain(dataset.map((d) => d.item))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(dataset, (d) => d.customers) * 1.15])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(new Set(dataset.map(d => d.group)))
      .range(tableauClassic10);

    // Vẽ trục Y
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat((d) => d))
      .attr("class", "axis-label");

    // Vẽ trục X
    const xAxis = svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10));

    if (chartType === "Q12") {
      xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-90) translate(-2,-12)")
        .text(d => `${(d+50000) / 1000}K`); // Hiển thị dạng 50K, 100K...
    }

    // Vẽ gridlines ngang (trục Y - scaleLinear)
    svg.selectAll("line.horizontal-grid")
      .data(y.ticks())
      .enter()
      .append("line")
      .attr("class", "horizontal-grid")
      .attr("x1", 0)
      .attr("y1", (d) => y(d))
      .attr("x2", width)
      .attr("y2", (d) => y(d))
      .style("stroke", "gray")
      .style("opacity", 0.2);

    // Tạo phần tử tooltip (ẩn mặc định)
    const tooltip = d3.select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("border-radius", "8px")
      .style("padding", "8px")
      .style("box-shadow", "0 2px 6px rgba(0,0,0,0.2)")
      .style("opacity", 0);

    // Vẽ các thanh dọc
    svg.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.item) - (x.bandwidth() * 0.14))  // Điều chỉnh để căn giữa khi to hơn
      .attr("y", (d) => y(d.customers))
      .attr("width", x.bandwidth() * 1.16) // Tăng kích thước thanh
      .attr("height", (d) => height - y(d.customers))
      .attr("fill", (d) => colorScale(d.group))
      .on("mouseover", (event, d) => {
        const tooltipContent = chartType === "Q11"
          ? `Đã mua ${d.item} lần<br>Số lượng KH: ${d.customers.toLocaleString()}`
          : `Đã chi tiêu từ ${d.item.toLocaleString()}K đến ${(d.item + 50000).toLocaleString()}K<br>
             Số lượng KH: ${d.customers.toLocaleString()}`;
      
        tooltip.style("opacity", 1).html(tooltipContent);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  }



  selector.on("change", function () {
    const value = d3.select(this).property("value");
    if (value === "chart1") drawChart1();
    else if (value === "chart2") drawChart2();
    else if (value === "chart3") drawChart3();
    else if (value === "chart4") drawChart4();
    else if (value === "chart5") drawChart5();
    else if (value === "chart6") drawChart6();
    else if (value === "chart7") drawChart7();
    else if (value === "chart8") drawChart8();
    else if (value === "chart9") drawChart9();
    else if (value === "chart10") drawChart10();
    else if (value === "chart11") drawChart11();
    else if (value === "chart12") drawChart12();
  });

  drawChart1();
});

  
