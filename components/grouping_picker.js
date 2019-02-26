import PropTypes from "prop-types";

export default class GroupingPicker extends React.Component {
  onBtnClick = event => {
    this.props.onChanged(event.target.name);
  };
  render() {
    const { active } = this.props;
    return (
      <div className="GroupingPicker">
        <button
          className={`button ${active === "all" && "active"}`}
          name="all"
          onClick={this.onBtnClick}
        >
          Todos
        </button>
        <button
          className={`button ${active === "provider" && "active"}`}
          name="provider"
          onClick={this.onBtnClick}
        >
          Proveedor
        </button>
        <button
          className={`button ${active === "rubro_nombre" && "active"}`}
          name="rubro"
          onClick={this.onBtnClick}
        >
          Rubro
        </button>
        <button
          className={`button ${active === "modalidad" && "active"}`}
          name="modalidad"
          onClick={this.onBtnClick}
        >
          Modalidad
        </button>
      </div>
    );
  }
}

GroupingPicker.propTypes = {
  onChanged: PropTypes.func.isRequired,
  active: PropTypes.oneOf(["all", "provider", "rubro", "modalidad"]).isRequired
};
