import PropTypes from "prop-types";
import { Radio } from "antd";

export default class GroupingPicker extends React.Component {
  state = {
    active: "all",
    show: false
  };

  componentDidMount() {
    this.setState({ show: true });
  }

  onBtnClick = event => {
    this.setState({ active: event.target.value });
    this.props.onChanged(event.target.value);
  };

  render() {
    const { active, width } = this.props;
    return (
      <div
        className="GroupingPicker"
        style={{
          textAlign: "center",
          width: width,
          paddingTop: "50px",
          visibility: this.state.show ? "visible" : "hidden"
        }}
      >
        <Radio.Group value={active} onChange={this.onBtnClick}>
          <Radio.Button value="all">Todos</Radio.Button>
          <Radio.Button value="provider">Proveedor</Radio.Button>
          <Radio.Button value="convocante">Convocante</Radio.Button>
        </Radio.Group>
      </div>
    );
  }
}

GroupingPicker.propTypes = {
  onChanged: PropTypes.func.isRequired,
  active: PropTypes.oneOf(["all", "provider", "convocante"]).isRequired
};
