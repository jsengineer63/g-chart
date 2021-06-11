const barChartOptions = {
  url: `https://api.delkos.com/api/v2/lifesaversentiment/sentiment?api_key=e7ca1635c516597b59845e6908bfc6cc48ab4e5df1d6da81664d6ed554fa6299&license=TYEqfDjJMVYU0aqJA0UykEpLzoiBK6hw`,
  dataOption: {
    brandid: 1,
    orderBy: 'long', // 2. order by total / long / short
    direction: 'desc', // 3. order direction (asc / desc)
    showLinesCount: 20, // 4. how many lines to show
    color1: '#FF0000',
    color2: '#0000FF',
  },
  chartOption: {
    title: "Country Money's Ratio",
    chartArea: { width: '80%' },
    hAxis: {
      title: 'Long - Short Ratio',
      minValue: 0,
    },
    vAxis: {
      title: 'Money type',
    },
    // isStacked: true,
    isStacked: 'percent',
    ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
  },
};

const fetchChartData = async (url) => {
  return fetch(url)
    .then((response) => response.json())
    .then((response) => response.sentiment);
};

const googleArrayToDataTable = (chartData, options) => {
  const { dataOption } = options;
  const {
    brandid,
    showLinesCount,
    orderBy: field,
    direction,
    color1: longColor,
    color2: shortColor,
  } = dataOption;
  if (brandid in chartData) {
    const resData = chartData[brandid]
      .sort((prv, nxt) => {
        const fstData = prv[field] || 0;
        const nxtData = nxt[field] || 0;
        return (fstData - nxtData) * (direction === 'asc' ? 1 : -1);
      })
      .map((row) => {
        const { ticker: name, short, long } = row;
        return [name, long, longColor, short, shortColor];
      })
      .slice(0, showLinesCount);

    console.log(resData);

    return google.visualization.arrayToDataTable([
      ['Segment', 'Long', { role: 'style' }, 'Short', { role: 'style' }],
      ...resData,
    ]);
  }
  return google.visualization.arrayToDataTable([]);
};

const drawMultSeries = async () => {
  const segmentData = await fetchChartData(barChartOptions.url);
  const data = googleArrayToDataTable(segmentData, barChartOptions);

  const chart = new google.visualization.BarChart(
    document.getElementById('chart_div')
  );
  chart.draw(data, barChartOptions.chartOption);
};

google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawMultSeries);
