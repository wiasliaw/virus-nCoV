import dayjs from 'dayjs';

/**
 * @param {string} date
 * @returns {JSON}
 */
const fetchData = async (date) => {
  const formatDate = dayjs(date, 'YYYYMMDD').format('YYYY-MM-DD');
  const rawData = await fetch(`https://dcmoe.csie.ncku.edu.tw/nCoV/query/?date=${formatDate}`, {
    method: 'GET',
    mode: 'cors'
  }).then(resp => resp.json())
    .catch(() => void console.error('Fetch Error'));
  if (!rawData.status) {
    return { [date]: [] };
  }
  return { [date]: rawData.data };
};

export default fetchData;
