import * as d3 from "d3";
import { dataset } from "../data/data";
import { width, height, center } from "../utils/constants";
import { createNodes, getClusterProps } from "../utils/utils";
import BubbleChart from "./bubble_chart";
import GroupingPicker from "./grouping_picker";
import Bubbles from "./bubbles";

export default class BubbleView extends React.Component {
  centerProps = {
    center: center,
    clusters: {
      "": {
        center: center,
        x: center.x,
        y: center.y
      }
    },
    height: height,
    width: width
  };

  state = {
    data: [],
    grouping: "all",
    clusterCenters: this.centerProps.clusters,
    height: height,
    width: width
  };

  componentDidMount() {
    this.setState({
      data: createNodes(dataset.contratos)
    });
  }

  onGroupingChanged = newGrouping => {
    const groupingKeys = Array.from(
      new Set(this.state.data.map(x => x[newGrouping]))
    );

    const clusterProps =
      newGrouping == "all"
        ? this.centerProps
        : getClusterProps(width, height, groupingKeys);

    this.setState({
      grouping: newGrouping,
      center: clusterProps.center,
      clusterCenters: clusterProps.clusters,
      height: clusterProps.height
    });
  };

  render() {
    const { data, grouping, width, height, clusterCenters } = this.state;
    return (
      <div className="App">
        <GroupingPicker onChanged={this.onGroupingChanged} active={grouping} />
        <BubbleChart width={width} height={height}>
          <Bubbles
            data={data}
            forceStrength={0.03}
            center={center}
            clusterCenters={clusterCenters}
            groupByProvider={grouping === "provider"}
          />
          {/* {grouping === "year" && (
            <YearsTitles width={width} yearCenters={yearCenters} />
          )} */}
        </BubbleChart>
      </div>
    );
  }
}
