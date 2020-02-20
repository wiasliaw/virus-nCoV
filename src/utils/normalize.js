import _ from 'lodash';

/**
 * @param {JSON} data
 * @param {string} date
 * @param {string} field
 * @returns {string[]}
 */
const obj2Array = (data, date, field) => (
  data[date].map(d => d[field])
);

/**
 * @param {Object} analysis
 * @returns {Number[]}
 */
const genAnalysisResult = (analysis) => {
  const returnArray = [];
  for (let [k, v] of Object.entries(analysis)) {
    if (v>=0) {
      returnArray.push(Number.parseInt(k));
    }
  }
  return returnArray;
}

/**
 * @param {JSON} data
 * @param {string} date
 * @param {string} field
 * @param {Number} zoom default 1
 * @returns {{min: Number, max: Number, tick: Number[]}}
 */
const genRateRange = (data, date, field, zoom=1) => {
  let currentMin = Infinity;
  let currentMax = -Infinity;
  let analysis = {};

  obj2Array(data, date, field).forEach(d => {
    const n = Number.parseFloat((Number.parseFloat(d) * zoom).toFixed(0));
    if (n > currentMax) {
      currentMax = n;
    } else if (n < currentMin) {
      currentMin = n;
    }
    (analysis[Math.floor(n)])
      ? (analysis[Math.floor(n)]++)
      : (analysis[Math.floor(n)] = 1);
  });

  const returnArray = [
    ...genAnalysisResult(analysis),
    currentMin,
    currentMax,
  ];

  return {
    min: currentMin,
    max: currentMax,
    tick: _.uniq(returnArray).sort((a,b) => a-b),
  };
}

export default {
  genRateRange,
}
