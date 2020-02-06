import * as d3 from 'd3';
import { width, height, margin, adjust } from './config';

/**
 * @param {Number} minValue
 * @param {Number} maxValue
 * @returns {d3.ScaleLinear}
 */
const yAxisScale = (minValue, maxValue) => (
  d3.scaleLinear()
    .domain([minValue, maxValue])
    .range([height - margin.bottom, margin.top])
);

/**
 * @param {Number} minValue
 * @param {Number} maxValue
 * @returns {d3.ScaleLinear}
 */
const xAxisScale = (minValue, maxValue) => (
  d3.scaleLinear()
    .domain([minValue, maxValue])
    .range([margin.left, width - margin.top])
);

/**
 * @param {[Number, Number]} domain
 * @param {[Number, Number]} range 
 */
const radiusScale = (domain) => (
  d3.scaleSqrt(domain, [3, width / 24])
);

/**
 * @param {d3.scaleLinear} scale
 * @param {{min: Number, max: Number, tick: Number[]}} rateData
 */
const yAxisDraw = (scale, rateData) => (
  d3.axisLeft(scale)
    .tickValues(rateData.tick)
);

/**
 * @param {d3.scaleLinear} scale
 * @param {{min: Number, max: Number, tick: Number[]}} rateData
 */
const xAxisDraw = (scale, rateData) => (
  d3.axisBottom(scale)
    .tickValues(rateData.tick)
);

/**
 * @param {d3.scaleLinear} scale
 * @param {{min: Number, max: Number, tick: Number[]}} rateData
 * @param {Number} duration default: 0
 */
const xGridDraw = (scale, rateData, duration=0) => (
  g => g.selectAll('line')
    .data(rateData.tick)
    .join('line')
      .transition().duration(duration)
      .attr('x1', d => scale(d) + adjust)
      .attr('y1', margin.top - adjust)
      .attr('x2', d => scale(d) + adjust)
      .attr('y2', height - margin.bottom)
);

/**
 * @param {d3.scaleLinear} scale
 * @param {{min: Number, max: Number, tick: Number[]}} rateData
 * @param {Number} duration default: 0
 */
const yGridDraw = (scale, rateData, duration=0) => (
  g => g.selectAll('line')
    .data(rateData.tick)
    .join('line')
      .transition().duration(duration)
      .attr('x1', margin.left)
      .attr('y1', d => scale(d) - adjust)
      .attr('x2', width - margin.right + 20)
      .attr('y2', d => scale(d) - adjust)
);

export default {
  yAxisScale,
  xAxisScale,
  radiusScale,
  yAxisDraw,
  xAxisDraw,
  xGridDraw,
  yGridDraw,
};
