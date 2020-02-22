#!/usr/bin/env node

// import * as Papa from 'papaparse';
// var Papa = require('papaparse');

var slugify = require('slugify')
require('dotenv').config();
const fs = require('fs');

console.log('Converting groups CSV to JSON');

// var data = Papa.parse('./src/_data/groups.csv');


let Airtable = require('airtable')
Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });

const base = Airtable.base(process.env.AIRTABLE_BASE_ABUNDANCE_NETWORK);

let data = [];
let  geojson = {
  type: "FeatureCollection",
  features: []
};

base('Groups').select({
    view: 'Grid view'
}).firstPage(function(err, records) {
  if (err) { console.error(err); return; }
  records.forEach(function(record) {
    console.log('Retrieved', record.get('name'));
    // console.log('Retrieved', record.fields);
    // let group = JSON.parse(JSON.stringify(record.fields));
    let group = JSON.parse(JSON.stringify(record.fields));
    data.push(group);

    let coords = record.fields.geolocation.split(',');
    console.log(coords);
    coords = [coords[1].trim(), coords[0].trim()];
    console.log(coords);

    let feature = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": coords
      },
      "properties": {
        "name": record.fields.name,
        'slug': slugify(record.fields.name, { lower: true })
      }
    };
    geojson.features.push(feature);
  });

  // Output data file for 11ty
  let output = JSON.stringify(data);
  console.log(output);
  fs.writeFileSync('./src/_data/groups.json', output, 'utf-8'); 

  // Output GeoJSON file for the map
  let geojsonOutput = JSON.stringify(geojson);
  console.log(geojsonOutput);
  fs.writeFileSync('./src/files/groups.geojson', geojsonOutput, 'utf-8'); 
});



