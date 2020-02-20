<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import dayjs from 'dayjs';
  import utils from './utils/utils.js';
  import {
    width,
    height,
    margin,
    adjust,
  } from './utils/config.js';
  import normalize from './utils/normalize.js';
  import data from './data/data.json';
  import analysis from './data/index.json';

  // share variables
  const minimum = '2020-01-22';
  let dateString = '';
  let drawData = data;
  let messageVariable = {
    country: '',
    province: '',
    total_confirm: '',
    total_death: '',
    total_cure: '',
    confirm: '',
    death: '',
    confirm_rate: '',
  };
  let timer = null;

  // functions define
  const getDayString = (n) => {
    return dayjs(minimum, 'YYYYMMDD')
      .add(n, 'day')
      .format('YYYYMMDD');
  }

  const getDataCount = () => {
    const between = dayjs(dayjs(), 'YYYYMMDD').unix() - dayjs(minimum, 'YYYYMMDD').unix();
    // exclude today
    return Math.floor(between/(24*60*60)) - 1;
  };

  const setTimer = () => {
    if (document.getElementById('bar')) {
      document.getElementById('bar').value = 0;
    }
    if (!timer) {
      timer = setInterval(() => {
        const v = document.getElementById('bar').value
        document.getElementById('bar').value = Number.parseInt(v) + 1;
        handleChange();
      }, 1000);
    }
  }

  const clearTimer = () => {
    clearInterval(timer);
    timer = null;
  }

  // d3 data preprocess
  const yScale = utils.yAxisScale(0, analysis.maxDeathVariation);
  const xScale = utils.xAxisScale(0, 100); // 0 - 100%
  const radius = utils.radiusScale([0, 10000]);

  // event function
  const handleChange = async () => {
    const currentValue = document.getElementById('bar').value;    
    // data preprocess
    dateString = getDayString(currentValue);
    const xAxisData = normalize.genRateRange(drawData, dateString, 'Comfirmed Rate', 100);
    const yAxisData = normalize.genRateRange(drawData, dateString, 'Deaths Variation');
    // draw
    d3.select('#xaxis')
      .transition().duration(500)
      .call(utils.xAxisDraw(xScale, xAxisData));
    d3.select('#yaxis')
      .transition().duration(500)
      .call(utils.yAxisDraw(yScale, yAxisData));
    d3.select('#xgrid').call(utils.xGridDraw(xScale, xAxisData, 500));
    d3.select('#ygrid').call(utils.yGridDraw(yScale, yAxisData, 500));
    d3.select('#g-circle').selectAll('circle')
      .data(drawData[dateString])
      .join('circle')
        .attr('cx', d => xScale(Number.parseFloat(d['Comfirmed Rate'])*100))
        .attr('cy', d => yScale(Number.parseFloat(d['Deaths Variation'])))
        .attr('r', d => radius(Number.parseInt(d['Total Comfirmed'])))
        .attr('transform', `translate(${adjust}, ${-adjust})`)
        .on('mouseover', d => {
          messageVariable = {
            country: d['Country/Region'],
            province: d['Province/State'],
            total_confirm: d['Total Comfirmed'],
            total_death: d['Total Deaths'],
            total_cure: d['Total Recovered'],
            confirm: d['Comfirmed Variation'],
            death: d['Deaths Variation'],
            confirm_rate: (Number.parseFloat(d['Comfirmed Rate'])*100).toFixed(2) + '%',
          }
          document.getElementById('message').style.display = 'block';
        })
        .on('mouseout', () => document.getElementById('message').style.display = 'none');
  }

  onMount(async () => {
    // fetch raw data
    dateString = getDayString(0);
    // data preprocess
    const xAxisData = normalize.genRateRange(drawData, dateString, 'Comfirmed Rate', 100);
    const yAxisData = normalize.genRateRange(drawData, dateString, 'Deaths Variation');

    // draw
    const rootElement = d3.select('main');
    const svg = rootElement.append('svg')
      .attr('id', 'svgElement')
      .attr('viewBox', [0, 0, width, height])
      .style('border', '1px solid black');
    // xaxis
    svg.append('g')
      .attr('id', 'xaxis')
      .attr('transform', `translate(${adjust}, ${height - margin.bottom})`)
      .call(utils.xAxisDraw(xScale, xAxisData));
    // yaxis
    svg.append('g')
      .attr('id', 'yaxis')
      .attr('transform', `translate(${margin.left}, ${-adjust})`)
      .call(utils.yAxisDraw(yScale, yAxisData));
    // grid-x, -y
    svg.append('g')
      .attr('id', 'xgrid')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.2)
      .call(utils.xGridDraw(xScale, xAxisData))
    svg.append('g')
      .attr('id', 'yaxis')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.2)
      .call(utils.yGridDraw(yScale, yAxisData))

    // circle
    const circle = svg.append('g')
      .attr('id', 'g-circle')
      .selectAll('circle')
      .data(drawData[dateString])
      .join('circle')
        .attr('cx', d => xScale(Number.parseFloat(d['Comfirmed Rate'])*100))
        .attr('cy', d => yScale(Number.parseFloat(d['Deaths Variation'])))
        .attr('r', d => radius(Number.parseInt(d['Total Comfirmed'])))
        .attr('transform', `translate(${adjust}, ${-adjust})`)
        .style('fill', '#ff0000')
        .style('stroke', 'black')
        .style('stroke-width', '1px')
        .on('mouseover', d => {
          messageVariable = {
            country: d['Country/Region'],
            province: d['Province/State'],
            total_confirm: d['Total Comfirmed'],
            total_death: d['Total Deaths'],
            total_cure: d['Total Recovered'],
            confirm: d['Comfirmed Variation'],
            death: d['Deaths Variation'],
            confirm_rate: (Number.parseFloat(d['Comfirmed Rate'])*100).toFixed(2) + '%',
          }
          document.getElementById('message').style.display = 'block';
        })
        .on('mouseout', () => document.getElementById('message').style.display = 'none');
    // timer
    setTimer();
  });
</script>

<main></main>
<div id="message">
  國家：{messageVariable.country}
  {#if messageVariable.province !== ""}
    <br>
    省份：{messageVariable.province}
  {/if}
  <br>
  總確診數（人）：{messageVariable.total_confirm}
  <br>
  總死亡數（人）：{messageVariable.total_death}
  <br>
  總治癒數（人）：{messageVariable.total_cure}
  <br>
  當日新增確診數（人）：{messageVariable.confirm}
  <br>
  當日新增死亡數（人）：{messageVariable.death}(Y軸)
  <br>
  確診增加率（％）：{messageVariable.confirm_rate}(X軸)
  <br>
  （<strong>當日新增確診數</strong>除以<strong>總確診數</strong>）
</div>
<input
  type="range"
  name="i"
  id="bar"
  min="0"
  max={getDataCount()}
  value="0"
  style="width: 180px;"
  on:change={handleChange}
  on:mousedown={clearTimer}
/>
<span>{dateString}</span>
<button on:click={setTimer}>
  play
</button>

<style>
  main {
    position: relative;
    z-index: 1000;
  }
  #message {
    display: none;
    position: fixed;
    right: 0;
    top: 0;
    margin: 20px;
    padding: 5px;
    width: 350px;
    height: 400px;
    color: #856404;
    background-color: #fff3cd;
    border: 1px #856404 solid;
    border-radius: 4px;
    z-index: 1001;
  }
</style>