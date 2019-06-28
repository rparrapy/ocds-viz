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

  const data = rawData.records.flatMap(d => {
    const awards = d.compiledRelease.awards.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});

    d.compiledRelease.contracts.forEach(c => {
      c.tenderName = d.compiledRelease.tender.id;
      c.supplierName = awards[c.awardID].suppliers[0].name;
      c.supplierCode = awards[c.awardID].suppliers[0].identifier.id;
      c.buyerName = d.compiledRelease.tender.procuringEntity.name;
    });
    return d.compiledRelease.contracts;
  });
  const radiusScale = getRadiusScale(data);

  // Use map() to convert raw data into node data.
  // Checkout http://learnjsdata.com/ for more on
  // working with data.
  const myNodes = data.map(d => ({
    id: d.id,
    is_adenda: false,
    radius: d.value.amount ? radiusScale(+d.value.amount) : 0,
    value: d.value.amount ? +d.value.amount : 0,
    currency: d.value.currency,
    formattedValue:
      d.value.currency +
      " " +
      formatNumber(d.value.amount ? +d.value.amount : 0),
    adendas: d.amendments ? d.amendments : [],
    year: moment(d.dateSigned).year(),
    provider: d.supplierName,
    provider_code: d.supplierCode,
    name: d.tenderName ? d.tenderName : "",
    convocante: d.buyerName,
    dateSigned: moment(d.dateSigned),
    imputaciones:
      d.implementation && d.implementation.transactions
        ? d.implementation.transactions
        : [],
    adendas: d.amendments ? d.amendments : [],
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
            _.rationale === "Amp de monto" ||
            _.rationale === "Amp. de monto" ||
            _.rationale === "Reajuste." ||
            _.rationale === "Renovación"
        )
        .map((a, i) => {
          let adenda = Object.assign({}, c);
          adenda.is_adenda = true;
          adenda.radius = 0;
          adenda.dateSigned = a.date;
          adenda.x = c.x + c.radius - adenda.radius;
          adenda.y = c.y + c.radius - adenda.radius;
          adenda.pos = i;
          adenda.adendas = [];
          adenda.id = c.id;
          adenda.value = 0;
          adenda.padre = c;
          adenda.imputaciones = [];
          return adenda;
        });
    });

  return myNodes.concat(adendas);
}

export function getRadiusScale(data) {
  const maxAmount = d3.max(data, d => +d["value"]["amount"]);

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
    return moment(payment.date) <= until ? sum + payment.value : sum;
  }, 0);
}

export function getPaidAmountAddenda(contract, until) {
  if (!contract.adendas) return 0;
  let payments = contract.adendas
    .filter(
      ad =>
        ad.rationale === "Amp de monto" ||
        ad.rationale === "Reajuste." ||
        ad.rationale === "Renovación"
    )
    .map(ad => ad.imputaciones)
    .flat();

  return payments.reduce((sum, payment) => {
    return moment(payment.date) <= until ? sum + payment.value : sum;
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
      (ad.rationale === "Amp de monto" ||
        ad.rationale === "Reajuste." ||
        ad.rationale === "Renovación") &&
      moment(ad.parent.dateSigned) <= until
        ? ad.value + acc
        : acc,
    0
  );
}

export function getFill(contrato, hasta, svg) {
  var limite = hasta || moment();
  //Cambiamos un poco para tener en cuenta las adendas de tiempo
  var is_adenda_tiempo =
    contrato.is_adenda && contrato.rationale === "Amp de plazos";
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

export function renderImage(svg, contrato, showDetail = null) {
  var imgId = "img-" + contrato.id;
  var imagen = d3.select("#" + imgId);
  if (contrato["adendas"] && contrato["adendas"].length > 0) {
    var src_img = null;

    if (
      contrato["adendas"].filter(adenda => {
        return adenda.rationale === "Amp de plazos";
      }).length > 0
    ) {
      src_img = "ico_tiempo.svg";
    }

    if (contrato["adendas"].length > 0) {
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
            if (showDetail) {
              showDetail(contrato);
            }
          });
      }
      imagen
        .attr(
          "x",
          showDetail
            ? contrato.x - contrato.radius / imgScale
            : parseInt(svg.style("width").slice(0, -2)) / 2 -
                contrato.radius / imgScale
        )
        .attr(
          "y",
          showDetail
            ? contrato.y - contrato.radius / imgScale
            : parseInt(svg.style("height").slice(0, -2)) / 2 -
                contrato.radius / imgScale
        );
    }
  }
}
