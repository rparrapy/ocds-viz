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
      is_adenda: false,
      radius: d.monto_total ? radiusScale(+d.monto_total) : 0,
      value: d.monto_total ? +d.monto_total : 0,
      formattedValue: "Gs. " + formatNumber(d.monto_total ? +d.monto_total : 0),
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

export function getFill(contrato, hasta, svg) {
  var limite = hasta || moment();
  //Cambiamos un poco para tener en cuenta las adendas de tiempo
  var is_adenda_tiempo =
    contrato.is_adenda && contrato.tipo === "Amp de plazos";
  var cobrado = is_adenda_tiempo ? 0 : getPaidAmount(contrato, limite);
  var ejecutado = is_adenda_tiempo ? 1 : cobrado / contrato.value;
  ejecutado = isFinite(ejecutado) ? ejecutado : 0;

  var fillColor = contrato.is_adenda ? "#00698C" : "#f56727";
  var bgColor = contrato.is_adenda ? "#bfdfff" : "#ffead4";
  var gradientId = "grad-" + contrato.id;

  //Agrego aca, pero deberiamos hacer en otra parte
  contrato.ejecutado = ejecutado.toFixed(2);
  contrato.monto_pagado = cobrado;

  var imgId = "img-" + contrato.cod_contrato;
  //var imagen = $("#" + imgId);
  //var componente = $("#componentes .active").attr("id");
  // if (!componente || contrato.componente === componente) {
  //   //console.log('mostrar imagen');
  //   imagen.show();
  // }

  if (hasta) {
    d3.select("#" + gradientId + " stop.color")
      .attr("offset", ejecutado.toFixed(2))
      .style("stop-color", fillColor);
    d3.select("#" + gradientId + " stop.blank")
      .attr("offset", ejecutado.toFixed(2))
      .style("stop-color", bgColor);

    if (contrato["adendas"]) {
      // if (
      //   _.every(contrato.adendas, function(adenda) {
      //     return moment(adenda.fecha_contrato) > limite;
      //   })
      // ) {
      //   imagen.hide();
      // }
    }
    if (!contrato.is_adenda) {
      // var displayContrato = d3
      //   .select("#circulo-" + contrato.id)
      //   .style("display");
      // if (displayContrato == "none") {
      //   imagen.hide();
      // }
    }
  } else {
    if (d3.select("#" + gradientId).empty()) {
      var grad = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "100%")
        .attr("y2", "0%");
      grad
        .append("stop")
        .attr("class", "color")
        .attr("offset", ejecutado.toFixed(2))
        .style("stop-color", fillColor);
      grad
        .append("stop")
        .attr("class", "blank")
        .attr("offset", ejecutado.toFixed(2))
        .style("stop-color", bgColor);
    }
  }

  return "url(#" + gradientId + ")";
}

export function getStroke(contrato, hasta) {
  return contrato.is_adenda ? "#006289" : "#ca4600";
}

export function renderImage(svg, contrato, showTooltip = true) {
  var imgId = "img-" + contrato.id;
  var imagen = d3.select("#" + imgId);
  if (contrato["adendas"] && contrato["adendas"].length > 0) {
    var src_img = null;

    if (
      contrato["adendas"].filter(adenda => {
        return adenda.tipo === "Amp de plazos";
      }).length > 0
    ) {
      src_img = "ico_tiempo.svg";
    }

    if (
      contrato["adendas"].filter(adenda => {
        return (
          adenda.tipo === "Amp de monto" ||
          adenda.tipo === "Amp. de monto" ||
          adenda.tipo === "Reajuste." ||
          adenda.tipo === "Renovación"
        );
      }).length > 0
    ) {
      if (src_img === null) {
        src_img = "ico_dinero.svg";
      } else {
        src_img = "ico_ambos.png";
      }
    }

    var imgScale = src_img === "ico_ambos.png" ? 2 : 4;

    if (src_img) {
      if (imagen.empty()) {
        imagen = svg
          .data([contrato])
          .append("image")
          .attr("id", imgId)
          .attr("xlink:href", "static/images/" + src_img)
          .attr("width", (contrato.radius / imgScale) * 2)
          .attr("height", (contrato.radius / imgScale) * 2)
          .on("mouseover", _ => {
            if (showTooltip) {
              showDetail(contrato);
            }
          });
      }
      imagen
        .attr(
          "x",
          showTooltip
            ? contrato.x - contrato.radius / imgScale
            : parseInt(svg.style("width").slice(0, -2)) / 2 -
                contrato.radius / imgScale
        )
        .attr(
          "y",
          showTooltip
            ? contrato.y - contrato.radius / imgScale
            : parseInt(svg.style("height").slice(0, -2)) / 2 -
                contrato.radius / imgScale
        );
    }
  }
}
