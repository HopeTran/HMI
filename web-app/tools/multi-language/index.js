const axios = require('axios');
const fse = require('fs-extra');
const csv = require('csv-string');

const url = 'https://docs.google.com/spreadsheets/d/1_2nNAUeltmXPrkXWTkV_2F-EqodIZkUEmPjchmvKQ3U/export?format=csv';

function processData() {
  axios
    .get(url)
    .then((response) => {
      const lines = csv.parse(response.data);
      const headers = lines[0];

      const languages = {};
      const keyIndex = headers.findIndex((header) => header === 'key');
      if (keyIndex < 0) {
        console.error('Header key not found');
        return;
      }
      for (let i = keyIndex + 1; i < headers.length; i++) {
        languages[headers[i]] = {};
      }

      // Ignore first line (lines[0])
      for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
        // loop all language after 'key'
        for (let headerIndex = keyIndex + 1; headerIndex < headers.length; headerIndex++) {
          // Ignore if key is empty
          if (lines[lineIndex][keyIndex] !== '') {
            languages[headers[headerIndex]][lines[lineIndex][keyIndex]] = lines[lineIndex][headerIndex];
          }
        }
      }

      Object.keys(languages).forEach((key) => {
        fse.ensureDir('./src/statics/i18n', () => {
          const data = 'export default ' + JSON.stringify(languages[key], null, 2);
          fse.writeFile(`./src/statics/i18n/${key}.js`, data);
        });
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

processData();
