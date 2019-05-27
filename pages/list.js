import { dataset } from "../data/data";
import { createNodes, getClusterProps } from "../utils/utils";
import { Table, Layout } from "antd";
import Header from "../components/header";
import Footer from "../components/footer";
import "./list.css";

const columns = [
  {
    title: "Cod. de Contratación",
    dataIndex: "id",
    key: "id",
    width: "15%"
  },
  {
    title: "Nombre",
    dataIndex: "name",
    key: "name",
    width: "30%"
  },
  {
    title: "RUC",
    dataIndex: "provider_code",
    key: "provider_code",
    width: "10%"
  },
  {
    title: "Proveedor",
    dataIndex: "provider",
    key: "provider"
  },
  {
    title: "Monto",
    dataIndex: "formattedValue",
    key: "formattedValue",
    width: "11%"
  },
  {
    title: "Modalidad",
    dataIndex: "modalidad",
    key: "modalidad"
  }
];

export default class List extends React.Component {
  state = {
    data: []
  };

  componentDidMount() {
    this.setState({
      data: createNodes(dataset.contratos)
    });
  }

  render() {
    return (
      <Layout style={{ height: "100vh" }}>
        <Header selected={"2"} />
        <Layout style={{ margin: "2%" }}>
          <Table
            dataSource={this.state.data}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 5 }}
            bordered={true}
          />
        </Layout>
        <Footer />
      </Layout>
    );
  }
}
