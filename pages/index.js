import { Layout } from "antd";
import Header from "../components/header";
import Footer from "../components/footer";
import Reference from "../components/reference";
import BubbleView from "../components/bubble_view";

const { Content } = Layout;

export default () => (
  <Layout style={{ height: "100vh" }}>
    <Header />
    <Layout>
      <Reference />
      <Content>
        <BubbleView />
      </Content>
    </Layout>
    <Footer />
  </Layout>
);
