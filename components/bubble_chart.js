import PropTypes from "prop-types";

export default class BubbleChart extends React.Component {
  state = {
    active: "all",
    show: false
  };

  componentDidMount() {
    this.setState({ show: true });
  }

  render() {
    const { height, width, children } = this.props;
    return (
      <svg
        className="bubbleChart"
        style={{ display: this.state.show ? "block" : "none" }}
        width={width}
        height={height}
      >
        {children}
      </svg>
    );
  }
}

BubbleChart.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  children: PropTypes.node
};
