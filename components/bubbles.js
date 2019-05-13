import PropTypes from "prop-types";
import * as d3 from "d3";
import {
  getTotalPaid,
  getTotalAmount,
  getPaidAmount,
  getTotalAmountAddendaPerContract,
  getPaidAmountAddenda
} from "../utils/utils";
import { defaultGroup } from "../utils/constants";
import moment from "moment";
import { floatingTooltip } from "./tooltip";

export default class Bubbles extends React.Component {
  constructor(props) {
    super(props);
    String.prototype.toProperCase = function() {
      return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };

    const { forceStrength, center } = props;
    this.simulation = d3
      .forceSimulation()
      .velocityDecay(0.2)
      .force(
        "x",
        d3
          .forceX()
          .strength(forceStrength)
          .x(center.x)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(forceStrength)
          .y(center.y)
      )
      .force(
        "collision",
        d3.forceCollide().radius(function(d) {
          return d.radius;
        })
      )
      .on("tick", this.ticked.bind(this))
      .stop();
  }

  state = {
    g: null
  };

  componentWillReceiveProps(nextProps) {
    let filteredData = nextProps.data;
    if (nextProps.filterValue !== "" || nextProps.until !== this.props.until) {
      filteredData = this.filterBubbles(
        nextProps.data,
        nextProps.filterValue,
        nextProps.until
      );
    }

    if (filteredData !== this.props.data) {
      this.renderBubbles(filteredData, nextProps.until);
    }

    if (nextProps.until !== this.props.until) {
      this.refillBubbles(nextProps.until);
    }

    if (nextProps.grouping !== this.props.grouping) {
      this.regroupBubbles(nextProps.grouping, nextProps.clusterCenters);
    }

    this.renderLabels(
      nextProps.data,
      nextProps.clusterCenters,
      nextProps.grouping
    );
  }

  shouldComponentUpdate() {
    // we will handle moving the nodes on our own with d3.js
    // make React ignore this component
    return false;
  }

  componentDidMount() {
    this.setState({ g: d3.select(".bubbles") }, () => {
      this.renderBubbles(this.props.data);
      this.renderLabels(
        this.props.data,
        this.props.clusterCenters,
        this.props.grouping
      );
    });
  }

  ticked() {
    this.state.g
      .selectAll(".bubble")
      .attr("cx", d => d.x)
      .attr("cy", d => {
        renderImage(this.state.g, d);
        return d.y;
      });
  }

  regroupBubbles = (grouping, clusterCenters) => {
    const { forceStrength, center } = this.props;

    if (grouping != "all") {
      this.simulation
        .force(
          "x",
          d3
            .forceX()
            .strength(forceStrength)
            .x(d =>
              clusterCenters[d[grouping]]
                ? clusterCenters[d[grouping]].x
                : clusterCenters[defaultGroup].x
            )
        )
        .force(
          "y",
          d3
            .forceY()
            .strength(forceStrength)
            .y(d =>
              clusterCenters[d[grouping]]
                ? clusterCenters[d[grouping]].y
                : clusterCenters[defaultGroup].y
            )
        );
    } else {
      this.simulation
        .force(
          "x",
          d3
            .forceX()
            .strength(forceStrength)
            .x(center.x)
        )
        .force(
          "y",
          d3
            .forceY()
            .strength(forceStrength)
            .y(center.y)
        );
    }
    this.simulation.alpha(1).restart();
  };

  renderBubbles(data, until) {
    if (!this.state.g) return;

    const bubbles = this.state.g.selectAll(".bubble").data(data, d => d.id);

    this.state.g
      .selectAll("image")
      .attr("display", d => getImageDisplay(d, data));

    // Exit
    bubbles.exit().remove();

    // Enter
    const bubblesE = bubbles
      .enter()
      .append("circle")
      .classed("bubble", true)
      .attr("id", function(d) {
        return d.is_adenda
          ? "circulo-adenda-" + d.padre + d.pos
          : "circulo-" + d.id;
      })
      .attr("r", 0)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", d => getFill(d, until, this.state.g))
      .attr("stroke", d => getStroke(d))
      .on("mouseover", showDetail) // eslint-disable-line
      .on("mouseout", hideDetail); // eslint-disable-line

    bubblesE
      .transition()
      .duration(2000)
      .attr("r", d => d.radius)
      .on("end", () => {
        this.simulation
          .nodes(data)
          .alpha(1)
          .restart();
      });
  }

  refillBubbles(until) {
    const bubbles = this.state.g.selectAll("circle");
    bubbles.attr("fill", d => getFill(d, until, this.state.g));
  }

  renderLabels(data, clusterCenters, grouping) {
    if (!this.state.g) return;
    this.state.g.selectAll(".label").remove();
    this.state.g.selectAll(".monto-label").remove();
    if (grouping === "all") {
      var totalAmount = getTotalAmount(data);
      var totalPaid = getTotalPaid(data);
      var paidPercentage = ((totalPaid / totalAmount) * 100).toFixed(0);
      paidPercentage = isNaN(paidPercentage) ? 0 : paidPercentage;
      var labelAll =
        "Total Ejecutado: Gs. " +
        totalPaid.toLocaleString() +
        " (" +
        paidPercentage.toLocaleString() +
        "% del monto total de contratos)";
    }

    this.state.g
      .selectAll(".label")
      .data(Object.values(clusterCenters))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("text-anchor", "start")
      .text(function(d) {
        let label;
        if (grouping === "all") {
          label =
            "Monto Total de Contratos: Gs. " + totalAmount.toLocaleString();
        } else {
          label = d.name.toProperCase();

          if (label) {
            label = label.length > 45 ? label.slice(0, 42) + "..." : label;
          }
        }
        return d.name !== undefined || grouping === "all" ? label : "No aplica";
      })
      .attr("transform", function(d) {
        if (grouping === "all") {
          //este valor se deberia de calcular de manera automatica.
          return "translate(315 , 80)";
        }
        return `translate(${d.x -
          this.getComputedTextLength() / 2}, ${d.y - d.dy / 4 - 25})`;
      });

    this.state.g
      .selectAll(".monto-label")
      .data(Object.values(clusterCenters))
      .enter()
      .append("text")
      .attr("class", "monto-label")
      .attr("text-anchor", "start")
      .attr("fill", "#666")
      .text(function(d) {
        return grouping === "all"
          ? labelAll
          : "Gs. " + d.value.toLocaleString();
      })
      .attr("transform", function(d) {
        if (grouping === "all") {
          //este valor se deberia de calcular de manera automatica.
          return `translate(${d.x - this.getComputedTextLength() / 2} , 100)`;
        }

        return `translate(${d.x -
          this.getComputedTextLength() / 2}, ${d.y - d.dy / 5 - 25})`;
      });
  }

  filterBubbles(data, filterValue, until) {
    return data.filter(
      s =>
        s.name &&
        s.name.toLowerCase().includes(filterValue.toLowerCase()) &&
        s.dateSigned <= until
    );
  }

  render() {
    return <g className="bubbles" />;
  }
}

Bubbles.propTypes = {
  center: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  forceStrength: PropTypes.number.isRequired,
  grouping: PropTypes.string.isRequired,
  clusterCenters: PropTypes.objectOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }).isRequired
  ).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
      radius: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
      adendas: PropTypes.array.isRequired,
      name: PropTypes.string.isRequired
    })
  )
};

let tooltip = null;
/*
 * Function called on mouseover to display the
 * details of a bubble in the tooltip.
 */
export function showDetail(d) {
  // change outline to indicate hover state.
  tooltip = tooltip || floatingTooltip("gates_tooltip", 240);
  d3.select(this).attr("stroke", "black");
  const totalAmount = d.value + getTotalAmountAddendaPerContract(d);
  const totalPaid = getPaidAmount(d) + getPaidAmountAddenda(d);

  const content =
    `<span class="name">${
      d.name.length > 80 ? d.name.slice(0, 77) + "..." : d.name
    }</span><br/><br/>` +
    `<span class="name">${d.provider}</span><br/><br/>` +
    `<span class="value">Monto total: Gs. ${totalAmount.toLocaleString()}</span>` +
    `<span class="value" style="float: right">Monto ejecutado:&nbsp&nbsp<span class="percentage" style="float: right">${(
      (totalPaid / totalAmount) *
      100
    ).toFixed(0)}%</span></span><br/>` +
    "<hr>" +
    `<span class="value" style="display:table;
    margin:0 auto;">Click en el círculo para ver más detalles</span>`;

  tooltip.showTooltip(content, d3.event);
}

/*
 * Hides tooltip
 */
export function hideDetail(d) {
  // reset outline
  d3.select(this).attr("stroke", getStroke(d));
  tooltip.hideTooltip();
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
      var displayContrato = d3
        .select("#circulo-" + contrato.id)
        .style("display");

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

export function renderImage(svg, contrato) {
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
            showDetail(contrato);
          });
      }
      imagen
        .attr("x", contrato.x - contrato.radius / imgScale)
        .attr("y", contrato.y - contrato.radius / imgScale);
    }
  }
}

export function getImageDisplay(image, data) {
  const filtered = data.filter(d => d.id === image.id);
  return filtered.length > 0 ? "block" : "none";
}
