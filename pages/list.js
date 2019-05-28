import { dataset } from "../data/data";
import { createNodes, getClusterProps } from "../utils/utils";
import { Table, Layout } from "antd";
import Header from "../components/header";
import Footer from "../components/footer";
import "./list.css";
import { getPaidAmount, formatNumber } from "../utils/utils";

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

  getDetail(record) {
    return (
      <div>
        <table className="table">
          <tbody>
            <tr>
              <td>
                {" "}
                {record.name}
                <br /> Monto total
                <br /> <h5>{formatNumber(record.value)}</h5>
              </td>
              <td rowspan="2" class="txtC" width="30%">
                {" "}
                Monto ejecutado
                <br />{" "}
                <h1 class="per_ejex">
                  {((getPaidAmount(record) / record.value) * 100).toFixed(2)}%
                </h1>{" "}
              </td>
            </tr>
            <tr>
              <td>
                {" "}
                Proveedor
                <br /> <h5>{record.provider}</h5>
              </td>
            </tr>
          </tbody>
        </table>
        <hr style={{ display: "none" }} />
        <table className="tab_sec mb10">
          <tbody>
            <tr>
              <td width="70%">
                {" "}
                Fecha de contrato
                <br /> <strong>
                  {record.dateSigned.format("DD/MM/YYYY")}
                </strong>{" "}
              </td>
              <td>
                {" "}
                Nombre del llamado
                <br /> <strong>
                  106/08 Fiscali. Por Niveles Gemans 5
                </strong>{" "}
              </td>
            </tr>
            <tr>
              <td>
                {" "}
                Código de contratación
                <br /> <strong>{record.id}</strong>{" "}
              </td>
              <td>
                {" "}
                Monto ya pagado
                <br />{" "}
                <strong>Gs. {formatNumber(getPaidAmount(record))}</strong>{" "}
              </td>
            </tr>
            <tr>
              <td>
                {" "}
                Tipo de licitación
                <br /> <strong>Licitación Pública Internacional</strong>{" "}
              </td>
              <td>
                {" "}
                Obra
                <br /> <strong>GMANS 5</strong>{" "}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
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
            expandedRowRender={this.getDetail}
          />
        </Layout>
        <Footer />
      </Layout>
    );
  }
}
