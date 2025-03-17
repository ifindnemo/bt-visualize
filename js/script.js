/* global d3 */

// eslint-disable-next-line no-unused-vars
const projectName = 'bar-chart';

var width = 800,
  height = 400,
  barWidth = width / 275;

var tooltip = d3
  .select('.visHolder')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

var overlay = d3
  .select('.visHolder')
  .append('div')
  .attr('class', 'overlay')
  .style('opacity', 0);

var svgContainer = d3
  .select('.visHolder')
  .append('svg')
  .attr('width', width + 100)
  .attr('height', height + 60);

// Dữ liệu từ tệp CSV
d3.csv("data.csv", function(d) {
    // Thêm cột mới "Nhóm hàng" vào từng dòng dữ liệu
    d["Nhóm hàng"] = `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`;
    return d;
  }).then(function(data) {
    
    // Group theo cột mới "Nhóm hàng"
    const revenueByItem = d3.rollup(data, 
      v => ({
        revenue: d3.sum(v, d => +d["Thành tiền"]),
        group: v[0]["Nhóm hàng"] // Lấy từ cột đã tạo
      }), 
      d => "[" + d["Mã mặt hàng"] + "] "+ d["Tên mặt hàng"]
    );

    // Tạo dataset với thông tin nhóm
    const dataset = Array.from(revenueByItem, ([item, {revenue, group}]) => ({ 
      item, 
      revenue, 
      group 
    })).sort((a, b) => d3.descending(a.revenue, b.revenue));

    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(dataset.map(d => d.group))]) // Danh sách nhóm duy nhất
      .range(d3.schemeCategory10); // Chọn palette màu




    // Kích thước biểu đồ
    const margin = { top: 20, right: 30, bottom: 40, left: 250 };
    const width = 1000;
    const height = dataset.length * 30;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Thang đo
    const y = d3.scaleBand()
      .domain(dataset.map(d => d.item))
      .range([0, height])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.revenue)])
      .range([0, width-200]);

    // Vẽ trục
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .attr("class", "axis-label");

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(",")));

    // Vẽ các thanh
    svg.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => y(d.item))
      .attr("width", d => x(d.revenue))
      .attr("height", y.bandwidth())
      .attr("fill", d => colorScale(d.group)); // Thêm màu theo nhóm



    // Hiển thị giá trị trên thanh
    svg.selectAll(".label")
      .data(dataset)
      .enter()
      .append("text")
      .attr("x", d => x(d.revenue) + 5)
      .attr("y", d => y(d.item) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .text(d => d3.format(",")(d.revenue));

    // Sau khi tạo colorScale, thêm phần legend
    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);
    
    // Thêm ô màu vào legend
    legend.append("rect")
        .attr("x", width - 80) // Vị trí bên phải biểu đồ
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", colorScale);
    // Thêm text vào legend
    legend.append("text")
        .attr("x", width - 55)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);
  });