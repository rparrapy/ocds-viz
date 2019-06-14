import * as d3 from "d3";
import { getStroke, getFill, renderImage } from "../utils/utils";

export default class SingleBubble extends React.Component {
  componentDidMount() {
    const { data } = this.props;
    let angulos = [0, 72, 150, 216, 288, 360];

    var width = 300;

    var svgContainer = d3
      .select("#svg-" + data.id)
      .append("svg:svg")
      .attr("width", width)
      .attr("height", "100%");

    var circles = svgContainer
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d =>
        d.is_adenda
          ? width / 2 +
            Math.cos((angulos[d.pos] * 180) / Math.PI) * d.padre.radius
          : "50%"
      )
      .attr("cy", d =>
        d.is_adenda
          ? parseInt(svgContainer.style("height").slice(0, -2)) / 2 -
            Math.sin((angulos[d.pos] * 180) / Math.PI) * d.padre.radius
          : "50%"
      )
      .attr("r", function(d) {
        return d.radius;
      })
      .attr("stroke", function(d) {
        return getStroke(d);
      })
      .style("fill", function(d) {
        renderImage(svgContainer, d, false);
        return getFill(d, null, svgContainer);
      });
  }

  render() {
    const { data } = this.props;

    return <div id={"svg-" + data.id} style={{ height: "100%" }} />;
  }
}
