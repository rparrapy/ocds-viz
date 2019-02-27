import PropTypes from "prop-types";
import { Radio } from "antd";

export default class GroupingPicker extends React.Component {
  state = {
    active: "all"
  };
  onBtnClick = event => {
    this.setState({ active: event.target.value });
    this.props.onChanged(event.target.value);
  };

  render() {
    const { active, width } = this.props;
    return (
      <div
        className="GroupingPicker"
        style={{ textAlign: "center", width: width, paddingTop: "50px" }}
      >
        <Radio.Group value={active} onChange={this.onBtnClick}>
          <Radio.Button value="all">Todos</Radio.Button>
          <Radio.Button value="provider">Proveedor</Radio.Button>
          <Radio.Button value="rubro">Rubro</Radio.Button>
          <Radio.Button value="modalidad">Modalidad</Radio.Button>
        </Radio.Group>
      </div>
    );
  }
}

GroupingPicker.propTypes = {
  onChanged: PropTypes.func.isRequired,
  active: PropTypes.oneOf(["all", "provider", "rubro", "modalidad"]).isRequired
};
