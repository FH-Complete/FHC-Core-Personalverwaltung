const chartdemo = {
	name: 'ChartDemo',
    data () {
        return {
          title: '',
          numNum: Number,
          durationOptions: [0, 500, 1000, 2000],
          points: [10, 0, 8, 2, 6, 4, 5, 5],
          chartType: 'Spline',
          seriesColor: '#6fcd98',
          colorInputIsSupported: null,
          animationDuration: 1000,
          updateArgs: [true, true, {duration: 1000}],
          chartOptions: {
            chart: {
              type: 'spline'
            },
            title: {
              text: 'Sin chart'
            },
            series: [{
              data: [10, 0, 8, 2, 6, 4, 5, 5],
              color: '#6fcd98'
            }]
          }
        }
      },
      created () {
        let i = document.createElement('input')
        i.setAttribute('type', 'color');
        (i.type === 'color') ? this.colorInputIsSupported = true : this.colorInputIsSupported = false
      },
      watch: {
        title (newValue) {
          this.chartOptions.title.text = newValue
        },
        points: {
          handler(newValue) {
            this.chartOptions.series[0].data = newValue
          },
          deep: true
        },
        chartType (newValue) {
          this.chartOptions.chart.type = newValue.toLowerCase()
        },
        seriesColor (newValue) {
          this.chartOptions.series[0].color = newValue.toLowerCase()
        },
        animationDuration (newValue) {
          this.updateArgs[2].duration = Number(newValue)
        }
      },
      template: `
      <div class="chartElem">
        <div class="row">
            <highcharts class="chart" :options="chartOptions" :updateArgs="updateArgs"></highcharts>
            <div>
            <h3>Flexibly change the value of each point:</h3>
            <h4>Points:</h4>
            <form class="row points">
                <div v-for="index in 8" :key="index">
                <p>{{index}}</p>
                <input v-model.number="points[index-1]" type="number" class="numberInput">
                </div>
            </form>
            </div>
        </div>
        <div class="row">
            <div id="title">
            <h3>Set chart title dynamically:</h3>
            <input type="text" v-model="title">
            </div>
            <div id="chartType">
            <h3>Select chart type:</h3>
            <select v-model="chartType">
                <option>Spline</option>
                <option>AreaSpline</option>
                <option>Line</option>
                <option>Scatter</option>
                <option>Column</option>
                <option>Area</option>
            </select>
            </div>
            <div id="animationDuration">
            <h3>Select update animation duration:</h3>
            <select v-model.number="animationDuration">
                <option v-for="option in durationOptions" :value="option" v-bind:key="option">
                {{ option }}
                </option>
            </select>
            </div>
            <div id="seriesColor">
            <h3>Select color of the series:</h3>
            <div class="row">
                <input id="colorPicker" v-if="colorInputIsSupported" type="color"  v-model="seriesColor">
                <select v-else v-model="seriesColor">
                <option>Red</option>
                <option>Green</option>
                <option>Blue</option>
                <option>Pink</option>
                <option>Orange</option>
                <option>Brown</option>
                <option>Black</option>
                <option>Purple</option>
                </select>
            </div>
            <p>Current color: {{seriesColor}}</p>
            </div>
        </div>
      </div>
      `
}