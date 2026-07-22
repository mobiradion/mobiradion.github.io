const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const baseDir = __dirname;
const files = [
  ['HindiRadiosCSV.csv', 'hindi-data.js', 'HINDI_RADIOS'],
  ['PunjabiRadiosCSV.csv', 'punjabi-data.js', 'PUNJABI_RADIOS'],
  ['MarathiRadiosCSV.csv', 'marathi-data.js', 'MARATHI_RADIOS'],
  ['KannadaRadiosCSV.csv', 'kannada-data.js', 'KANNADA_RADIOS'],
  ['TeluguRadiosCSV.csv', 'telugu-data.js', 'TELUGU_RADIOS'],
  ['MalayalamRadiosCSV.csv', 'malayalam-data.js', 'MALAYALAM_RADIOS'],
  ['AirRadiosCSV.csv', 'air-data.js', 'AIR_RADIOS']
];

async function run() {
  for (const [csvName, jsName, varName] of files) {
    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(baseDir, csvName), { encoding: 'utf8' })
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const stations = rows.map((row) => ({
      title: (row.Name || row.name || row.Title || '').trim(),
      streamUrl: (row.URL || row.Url || row.url || row.StreamURL || '').trim(),
      description: (row.Description || row.description || row.Desc || '').trim(),
      image: (row.Image || row.image || row.Img || '').trim(),
    }));

    const content = `window.${varName} = ${JSON.stringify(stations, null, 2)};\n`;
    fs.writeFileSync(path.join(baseDir, jsName), content, 'utf8');
    console.log(`Wrote ${jsName} with ${stations.length} stations`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
