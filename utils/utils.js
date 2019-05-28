import * as d3 from "d3";
import moment from "moment";
import {
  width,
  height,
  colCount,
  center,
  maxGroups,
  defaultGroup
} from "./constants";

export function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}

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
  const radiusScale = getRadiusScale(rawData);

  // Use map() to convert raw data into node data.
  // Checkout http://learnjsdata.com/ for more on
  // working with data.
  const myNodes = rawData
    .filter(d => d["fecha_contrato"] || d["fecha_primer_pago"])
    .map(d => ({
      id: d.cod_contrato,
      radius: d.monto_total ? radiusScale(+d.monto_total) : 0,
      value: d.monto_total ? +d.monto_total : 0,
      formattedValue: formatNumber(d.monto_total ? +d.monto_total : 0),
      adendas: d.adendas ? d.adendas : [],
      year: moment(d.fecha_contrato).year(),
      provider: d.pro_nombre,
      provider_code: d.pro_cod,
      name: d.llamado_nombre ? d.llamado_nombre : "",
      modalidad: d.mod_nombre,
      rubro: d.rubro_nombre,
      dateSigned: d["fecha_contrato"]
        ? moment(d["fecha_contrato"])
        : moment(d["fecha_primer_pago"]),
      imputaciones: d.imputaciones,
      adendas: d.adendas ? d.adendas : [],
      x: Math.random() * 900,
      y: Math.random() * 800
    }));

  // sort them descending to prevent occlusion of smaller nodes.
  myNodes.sort((a, b) => b.value - a.value);

  let adendas = myNodes
    .filter(_ => _.adendas)
    .flatMap(c => {
      return c.adendas
        .filter(
          _ =>
            _.tipo === "Amp de monto" ||
            _.tipo === "Amp. de monto" ||
            _.tipo === "Reajuste." ||
            _.tipo === "Renovación"
        )
        .map((a, i) => {
          let adenda = Object.assign({}, c);
          adenda.is_adenda = true;
          adenda.radius = radiusScale(a.monto);
          adenda.dateSigned = a["fecha_contrato"]
            ? moment(a["fecha_contrato"])
            : moment(a["fecha_primer_pago"]);
          adenda.x = c.x + c.radius - adenda.radius;
          adenda.y = c.y + c.radius - adenda.radius;
          adenda.pos = i;
          adenda.adendas = [];
          adenda.id = a.cod_contrato;
          adenda.value = a.monto;
          adenda.padre = c;
          adenda.imputaciones = a.imputaciones;
          return adenda;
        });
    });

  return myNodes.concat(adendas);
}

export function getRadiusScale(data, key = "monto_total") {
  const maxAmount = d3.max(data, d => +d[key]);

  // Sizes bubbles based on area.
  // @v4: new flattened scale names.
  return d3
    .scalePow()
    .exponent(0.5)
    .range([2, 50])
    .domain([0, maxAmount]);
}

// export const fillColor = d3
//   .scaleOrdinal()
//   .domain(["low", "medium", "high"])
//   .range(["#d84b2a", "#beccae", "#7aa25c"]);

export function getClusterProps(grouping, data) {
  if (grouping == "all") return getSingleClusterProps();
  const groups = data.reduce((groups, item) => {
    const key = item[grouping];
    groups[key] = groups[key] || 0;
    groups[key] += item.value;
    return groups;
  }, {});

  const topGroups = mergeMinorGroups(groups);
  const keys = Object.keys(topGroups);

  const colCount = 3;
  const rowCount = Math.ceil(keys.length / colCount);
  const clusters = keys
    .map((k, i) => {
      const row = Math.trunc(i / colCount);
      let result = {};
      result[k] = {
        x: width * colCount * 0.25 * ((i % colCount) + 1),
        y: (height * (row + 1)) / 2,
        name: keys[i],
        dx: width,
        dy: height,
        row: row,
        col: i % colCount,
        value: topGroups[k]
      };
      return result;
    })
    .reduce((acc, current) => ({ ...acc, ...current }), {});
  return {
    center: { x: width / 2, y: (height * rowCount) / 2 },
    width: width * colCount,
    height: (height * (rowCount + 1)) / 2,
    clusters: clusters
  };
}

function getSingleClusterProps() {
  return {
    center: center,
    clusters: {
      "": {
        center: center,
        x: center.x,
        y: center.y,
        dx: width,
        dy: height
      }
    },
    height: height,
    width: width * colCount
  };
}

function mergeMinorGroups(groups) {
  const sortedKeys = Object.keys(groups).sort(k => groups[k]);
  const resultKeys = sortedKeys.slice(0, maxGroups);

  const result = resultKeys.reduce((acc, key) => {
    acc[key] = groups[key];
    return acc;
  }, {});

  if (sortedKeys.length > maxGroups) {
    const remainder = sortedKeys
      .slice(maxGroups)
      .reduce((acc, key) => acc + groups[key], 0);

    result[defaultGroup] = remainder;
  }

  return result;
}

export function getPaidAmount(contract, until) {
  if (!contract.imputaciones) return 0;
  until = until || moment();

  return contract.imputaciones.reduce((sum, payment) => {
    return moment(payment.fecha_obl) <= until ? sum + payment.monto : sum;
  }, 0);
}

export function getPaidAmountAddenda(contract, until) {
  if (!contract.adendas) return 0;
  let payments = contract.adendas
    .filter(
      ad =>
        ad.tipo === "Amp de monto" ||
        ad.tipo === "Reajuste." ||
        ad.tipo === "Renovación"
    )
    .map(ad => ad.imputaciones)
    .flat();

  return payments.reduce((sum, payment) => {
    return moment(payment.fecha_obl) <= until ? sum + payment.monto : sum;
  }, 0);
}

export function getTotalPaid(contracts, until) {
  return contracts.reduce(
    (acc, c) => getPaidAmount(c, until) + getPaidAmountAddenda(c, until) + acc,
    0
  );
}

export function getTotalAmount(contracts, until) {
  until = until || moment();

  return contracts.reduce((acc, c) => {
    return c.dateSigned <= until
      ? c.value + getTotalAmountAddendaPerContract(c, until) + acc
      : acc;
  }, 0);
}

export function getTotalAmountAddendaPerContract(contract, until) {
  if (!contract.adendas) return 0;

  until = until || moment();
  return contract.adendas.reduce(
    (acc, ad) =>
      (ad.tipo === "Amp de monto" ||
        ad.tipo === "Reajuste." ||
        ad.tipo === "Renovación") &&
      ad["fecha_contrato"] &&
      moment(ad["fecha_contrato"]) <= until
        ? ad["monto"] + acc
        : acc,
    0
  );
}
