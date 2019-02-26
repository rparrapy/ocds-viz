import PropTypes from "prop-types";
import * as d3 from "d3";
import { fillColor } from "../utils/utils";
import { defaultGroup } from "../utils/constants";

//import tooltip from "./tooltip";

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
    if (nextProps.data !== this.props.data) {
      this.renderBubbles(nextProps.data);
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
      this.renderBubbles(this.props.data, this.props.clusterCenters);
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
      .attr("cy", d => d.y);
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

  renderBubbles(data, clusterCenters) {
    if (!this.state.g) return;

    const bubbles = this.state.g.selectAll(".bubble").data(data, d => d.id);

    // Exit
    bubbles.exit().remove();

    // Enter
    const bubblesE = bubbles
      .enter()
      .append("circle")
      .classed("bubble", true)
      .attr("r", 0)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", d => fillColor(d.group))
      .attr("stroke", d => d3.rgb(fillColor(d.group)).darker())
      .attr("stroke-width", 2)
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

  renderLabels(data, clusterCenters, grouping) {
    if (!this.state.g) return;
    this.state.g.selectAll(".label").remove();
    this.state.g.selectAll(".monto-label").remove();
    let totalALaFecha = data.reduce((acc, contrato) => {
      let totalAdendas = contrato.adendas
        .filter(v => v.tipo.includes("monto"))
        .reduce((ac, ad) => ac + ad.monto, 0);

      return acc + contrato.value + totalAdendas;
    }, 0);

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
            "Monto Total de Contratos: Gs. " + totalALaFecha.toLocaleString();
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
          return "translate(350 , 20)";
        }
        return (
          "translate(" +
          (d.x - this.getComputedTextLength() / 2) +
          ", " +
          (d.y - d.dy / 4 - 25) +
          ")"
        );
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
        return grouping === "all" ? "aaa" : "Gs. " + d.value.toLocaleString();
      })
      .attr("transform", function(d) {
        return (
          "translate(" +
          (d.x - this.getComputedTextLength() / 2) +
          ", " +
          (d.y - d.dy / 5 - 25) +
          ")"
        );
      });
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

/*
 * Function called on mouseover to display the
 * details of a bubble in the tooltip.
 */
export function showDetail(d) {
  // change outline to indicate hover state.
  d3.select(this).attr("stroke", "black");

  const content =
    `<span class="name">Title: </span><span class="value">${
      d.name
    }</span><br/>` +
    `<span class="name">Amount: </span><span class="value">$${
      d.value
    }</span><br/>` +
    `<span class="name">Year: </span><span class="value">${d.year}</span>`;

  //tooltip.showTooltip(content, d3.event);
}

/*
 * Hides tooltip
 */
export function hideDetail(d) {
  // reset outline
  d3.select(this).attr("stroke", d3.rgb(fillColor(d.group)).darker());

  //tooltip.hideTooltip();
}
