const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const dayjs = require('dayjs');
require('dotenv').config();

/**
 * config
 */
const dataPath = '../src/data';
const config = {
  minimum: '2020-01-22',
  baseUrl: process.env.MAIN_HOST,
}

/**
 * @param {string} date 
 */
function trnasformDate(date) {
  return dayjs(date, 'YYYY-MM-DD').format('YYYYMMDD');
}

/**
 * @param {string} path
 */
function pathCreate(targetPath) {
  if (!fs.existsSync(path.resolve(__dirname, targetPath))) {
    fs.mkdirSync(path.resolve(__dirname, targetPath))
  }
}

/**
 * @param {string} date 
 */
async function fetchData(date) {
  const response = await axios.get(`${config.baseUrl}/nCoV/query/?date=${date}`)
    .catch(err => console.log(err));
  const rawData = response.data;
  if (rawData.status) {
    return { [date]: rawData.data };
  } else {
    return { [date]: [] };
  }
};

(async () => {
  const currentDate = dayjs().format('YYYY-MM-DD');
  const jsonData = {};
  const analysis = {
    maxDeathVariation: -Infinity,
    countries: {},
  };
  pathCreate(dataPath);

  for (
    let minDate = config.minimum;
    minDate !== currentDate;
    minDate = dayjs(minDate, 'YYYYMMDD').add(1, 'day').format('YYYY-MM-DD')
  ) {
    // fetch data
    const data = await fetchData(minDate);
    // analysis
    data[minDate].forEach(d => {
      if (d['Deaths Variation'] > analysis.maxDeathVariation) {
        analysis.maxDeathVariation = d['Deaths Variation']
      }
      if (analysis.countries[d['Country/Region']]===undefined) {
        analysis.countries[d['Country/Region']] = '#ffffff';
      }
    });
    // write rawdata
    jsonData[trnasformDate(minDate)] = data[minDate];
  }
  // write analysis
  const dataString = JSON.stringify(jsonData);
  fs.writeFileSync(path.resolve(__dirname, dataPath, `data.json`) , dataString, {
    encoding: 'utf-8',
    flag: 'w',
  });
  const analysisString = JSON.stringify(analysis);
  fs.writeFileSync(path.resolve(__dirname, dataPath, 'index.json'), analysisString, {
    encoding: 'utf-8',
    flag: 'w',
  });
})();
