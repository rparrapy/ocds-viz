export default class BubbleChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  componentDidMount() {
    this.setState({ show: true });
  }

  render() {
    const imgStyle = {
      height: 250,
      margin: "auto",
      visibility: this.state.show ? "visible" : "hidden"
    };

    return (
      <div
        style={{
          height: "100%",
          display: "flex"
        }}
      >
        <img src="/static/images/coming_soon.png" alt="" style={imgStyle} />
      </div>
    );
  }
}
