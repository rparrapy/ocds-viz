import { Layout } from "antd";
import Header from "../components/header";
import Footer from "../components/footer";
import Reference from "../components/reference";
import BubbleChart from "../components/bubble_chart";

const { Content } = Layout;

export default () => (
  <Layout style={{ height: "100vh" }}>
    <Header />
    <Layout>
      <Reference />
      <Content>
        <BubbleChart />
      </Content>
    </Layout>
    <Footer />
  </Layout>
);
