import { Slider } from "antd";
import { width } from "../utils/constants";
import moment from "moment";

export default class DateSlider extends React.Component {
  state = {
    until: moment()
  };

  onChange = value => {
    this.setState({
      until: moment.unix(value - 86400)
    });
    this.props.onChanged(moment.unix(value - 86400));
  };

  formatter(value) {
    return moment.unix(value).format("DD/MM/YYYY");
  }

  render() {
    const { data, width } = this.props;
    const { until } = this.state;
    let max = moment();
    let min = moment.min(data.map(d => d.dateSigned)).clone();
    let marks = {};
    marks[min.unix()] = min.format("DD/MM/YYYY");
    marks[max.unix()] = max.format("DD/MM/YYYY");

    return (
      <div style={{ width: width }}>
        <Slider
          tipFormatter={this.formatter}
          style={{ width: "50%", margin: "auto" }}
          min={min.unix()}
          max={max.unix()}
          marks={marks}
          defaultValue={until.unix()}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
