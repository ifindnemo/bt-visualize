document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('menuBtn');
    const optionsList = document.getElementById('optionsList');
    const chartTitle = document.querySelector('h2');

    // Mở/đóng menu khi click vào nút
    menuBtn.addEventListener('click', function () {
        optionsList.classList.toggle('show');
    });

    // Sửa phần xử lý click như sau:
    optionsList.addEventListener('click', function (e) {
        const option = e.target.closest('.option');
        if (option && option.dataset.chart) { // Thêm check tồn tại data-chart
            const selectedText = option.querySelector('.option-text').textContent;
            chartTitle.textContent = selectedText;

            const chartType = option.dataset.chart;
            if (chartType === 'chart1') {
                drawChart1();
            } else if (chartType === 'chart2') {
                drawChart2();
            } else if (chartType === 'chart3') {
                drawChart3();
            } else if (chartType === 'chart4') {
                drawChart4();
            } else if (chartType === 'chart5') {
                drawChart5();
            } else if (chartType === 'chart6') {
                drawChart6();
            } else if (chartType === 'chart7') {
                drawChart7();
            } else if (chartType === 'chart8') {
                drawChart8();
            } else if (chartType === 'chart9') {
                drawChart9();
            } else if (chartType === 'chart10') {
                drawChart10();
            } else if (chartType === 'chart11') {
                drawChart11();
            } else if (chartType === 'chart12') {
                drawChart12();
            }

            optionsList.classList.remove('show');
        }
    });

    // Thêm code D3 thực tế vào các hàm drawChart
    window.drawChart1 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 1');
    };

    window.drawChart2 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 2');
    };

    window.drawChart3 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 3');
    };

    window.drawChart4 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 4');
    };

    window.drawChart5 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 5');
    };

    window.drawChart6 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 6');
    };

    window.drawChart7 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 7');
    };

    window.drawChart8 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 8');
    };

    window.drawChart9 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 9');
    };

    window.drawChart10 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 10');
    };

    window.drawChart11 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 11');
    };

    window.drawChart12 = function() {
        d3.select('#chart').html('');
        console.log('Vẽ chart 12');
    };
});