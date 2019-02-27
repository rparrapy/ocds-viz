import * as d3 from "d3";
import { dataset } from "../data/data";
import { width, height, center } from "../utils/constants";
import { createNodes, getClusterProps } from "../utils/utils";
import BubbleChart from "./bubble_chart";
import GroupingPicker from "./grouping_picker";
import Bubbles from "./bubbles";

export default class BubbleView extends React.Component {
  centerProps = getClusterProps("all");
  state = {
    data: [],
    grouping: "all",
    clusterCenters: this.centerProps.clusters,
    height: this.centerProps.height,
    width: this.centerProps.width
  };

  componentDidMount() {
    this.setState({
      data: createNodes(dataset.contratos)
    });
  }

  onGroupingChanged = newGrouping => {
    const clusterProps = getClusterProps(newGrouping, this.state.data);

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
        <GroupingPicker
          width={width}
          onChanged={this.onGroupingChanged}
          active={grouping}
        />
        <BubbleChart width={width} height={height}>
          <Bubbles
            data={data}
            forceStrength={0.03}
            center={center}
            clusterCenters={clusterCenters}
            grouping={grouping}
          />
          {/* {grouping === "year" && (
            <YearsTitles width={width} yearCenters={yearCenters} />
          )} */}
        </BubbleChart>
      </div>
    );
  }
}
