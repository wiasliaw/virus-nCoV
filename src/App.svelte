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
    countryColorMap,
  } from './utils/config.js';
  import normalize from './utils/normalize.js';
  import fetchData from './utils/fetchData.js';

  // share variables
  const minimum = '20200122';
  let dateString = '';
  let drawData = null;
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

  // event function
  const handleChange = async () => {
    const currentValue = document.getElementById('bar').value;    
    // data preprocess
    dateString = getDayString(currentValue);
    drawData = await fetchData(dateString);
    const xAxisData = normalize.genRateRange(drawData, dateString, 'Comfirmed Rate', 100);
    const yAxisData = normalize.genRateRange(drawData, dateString, 'Deaths Variation');
    // d3 update
    const yScale = utils.yAxisScale(yAxisData.min, yAxisData.max);
    const xScale = utils.xAxisScale(xAxisData.min, xAxisData.max);
    const radius = utils.radiusScale([0, 10000]);
    const colorScale = d3.scaleSequential()
      .domain([0, 30])
      .interpolator(d3.interpolateRainbow);
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
        .transition().duration(500)
        .attr('cx', d => xScale(Number.parseFloat(d['Comfirmed Rate'])*100))
        .attr('cy', d => yScale(Number.parseFloat(d['Deaths Variation'])))
        .attr('r', d => radius(Number.parseInt(d['Total Comfirmed'])))
        .attr('transform', `translate(${adjust}, ${-adjust})`)
  }

  onMount(async () => {
    // fetch raw data
    dateString = getDayString(0);
    drawData = await fetchData(dateString);

    // data preprocess
    const xAxisData = normalize.genRateRange(drawData, dateString, 'Comfirmed Rate', 100);
    const yAxisData = normalize.genRateRange(drawData, dateString, 'Deaths Variation');

    // d3 data preprocess
    const yScale = utils.yAxisScale(yAxisData.min, yAxisData.max);
    const xScale = utils.xAxisScale(xAxisData.min, xAxisData.max);
    const radius = utils.radiusScale([0, 10000]);
    const colorScale = d3.scaleSequential()
      .domain([0, 30])
      .interpolator(d3.interpolateRainbow);

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
        .style('fill', d => colorScale(countryColorMap[d['Country/Region']]))
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
  max={getDataCount(10)}
  value="0"
  style="width: 180px;"
  on:change={handleChange}
/>
<span>{dateString}</span>

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