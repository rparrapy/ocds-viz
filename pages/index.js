import { Layout } from "antd";
import Header from "../components/header";
import Footer from "../components/footer";
import Reference from "../components/reference";
import BubbleView from "../components/bubble_view";

const { Content } = Layout;

export default class Index extends React.Component {
  state = {
    filterValue: ""
  };

  onFilterChanged = newFilterValue => {
    this.setState({
      filterValue: newFilterValue
    });
  };

  render() {
    const { filterValue } = this.state;

    return (
      <Layout style={{ height: "100vh" }}>
        <Header />
        <Layout>
          <Reference
            filterValue={filterValue}
            onFilterChanged={this.onFilterChanged}
          />
          <Content>
            <BubbleView filterValue={filterValue} />
          </Content>
        </Layout>
        <Footer />
      </Layout>
    );
  }
}
