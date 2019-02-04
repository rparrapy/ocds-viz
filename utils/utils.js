import * as d3 from "d3";
import moment from "moment";
import { width, height, center } from "./constants";

/*
 * This data manipulation function takes the raw data from
 * the CSV file and converts it into an array of node objects.
 * Each node will store data and visualization values to visualize
 * a bubble.
 *
 * rawData is expected to be an array of data objects, read in from
 * one of d3's loading functions like d3.csv.
 *
 * This function returns the new node array, with a node in that
 * array for each element in the rawData input.
 */
export function createNodes(rawData) {
  // Use the max total_amount in the data as the max in the scale's domain
  // note we have to ensure the total_amount is a number.

  rawData = rawData.filter(c => c.cod_contrato);
  const maxAmount = d3.max(rawData, d => +d.monto_total);

  // Sizes bubbles based on area.
  // @v4: new flattened scale names.
  const radiusScale = d3
    .scalePow()
    .exponent(0.5)
    .range([2, 85])
    .domain([0, maxAmount]);

  // Use map() to convert raw data into node data.
  // Checkout http://learnjsdata.com/ for more on
  // working with data.
  const myNodes = rawData.map(d => ({
    id: d.cod_contrato,
    radius: radiusScale(+d.monto_total),
    value: d.monto_total ? +d.monto_total : 0,
    adendas: d.adendas ? d.adendas : [],
    year: moment(d.fecha_contrato).year(),
    provider: d.pro_nombre,
    name: d.cod_contrato,
    x: Math.random() * 900,
    y: Math.random() * 800
  }));

  // sort them descending to prevent occlusion of smaller nodes.
  myNodes.sort((a, b) => b.value - a.value);

  return myNodes;
}

export const fillColor = d3
  .scaleOrdinal()
  .domain(["low", "medium", "high"])
  .range(["#d84b2a", "#beccae", "#7aa25c"]);

export function getClusterProps(width, height, keys) {
  const colCount = 3;
  const rowCount = Math.ceil(keys.length / colCount);
  const clusters = keys
    .map((k, i) => {
      const row = Math.trunc(i / colCount);
      let result = {};
      result[k] = {
        x: width * 0.25 * ((i % colCount) + 1),
        y: (height * (row + 1)) / 2,
        name: keys[i],
        dx: width / colCount,
        dy: height,
        row: row,
        col: i % colCount
      };
      return result;
    })
    .reduce((acc, current) => ({ ...acc, ...current }), {});
  return {
    center: { x: width / 2, y: (height * rowCount) / 2 },
    width: width,
    height: (height * (rowCount + 1)) / 2,
    clusters: clusters
  };
}
