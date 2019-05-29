import { dataset } from "../data/data";
import { createNodes, getClusterProps } from "../utils/utils";
import { Table, Layout } from "antd";
import Header from "../components/header";
import Footer from "../components/footer";
import "./list.css";
import { getPaidAmount, formatNumber } from "../utils/utils";
import moment from "moment";

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
    width: "14%"
  },
  {
    title: "Modalidad",
    dataIndex: "modalidad",
    key: "modalidad"
  }
];

const paymentColumns = [
  {
    title: "Cod. de Contrato",
    dataIndex: "codigo_contrato",
    key: "codigo_contrato",
    width: "15%"
  },
  {
    title: "Fecha de Contrato",
    dataIndex: "fecha_contrato",
    key: "fecha_contrato",
    width: "30%"
  },
  {
    title: "Fecha de Obligación",
    dataIndex: "formattedDate",
    key: "formattedDate",
    width: "10%"
  },
  {
    title: "Concepto",
    dataIndex: "concepto",
    key: "concepto"
  },
  {
    title: "Monto",
    dataIndex: "formattedValue",
    key: "formattedValue",
    width: "15%"
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

  formatPayments(
    record,
    payments,
    codigo_contrato_key = "id",
    fecha_contrato_key = "dateSigned"
  ) {
    payments.forEach((imp, i) => {
      imp["codigo_contrato"] = record[codigo_contrato_key];
      imp["fecha_contrato"] = moment(record[fecha_contrato_key]).format(
        "DD/MM/YYYY"
      );
      imp["formattedValue"] = "Gs. " + formatNumber(imp.monto);
      imp["formattedDate"] = moment(imp.fecha_obl).format("DD/MM/YYYY");
      imp["id"] = record[codigo_contrato_key] + i;
    });
    return payments;
  }

  getDetail = record => {
    let payments = this.formatPayments(record, record.imputaciones);
    let adendaPayments = record.adendas
      ? record.adendas
          .filter(adenda => {
            return (
              adenda.tipo === "Amp de monto" ||
              adenda.tipo === "Amp. de monto" ||
              adenda.tipo === "Reajuste." ||
              adenda.tipo === "Renovación"
            );
          })
          .flatMap(a =>
            this.formatPayments(
              a,
              a.imputaciones,
              "cod_contrato",
              "fecha_contrato"
            )
          )
      : [];

    payments.push(...adendaPayments);

    return (
      <div>
        <table className="table">
          <tbody>
            <tr>
              <td>
                {" "}
                {record.name}
                <br /> Monto total
                <br /> <h5>Gs. {formatNumber(record.value)}</h5>
              </td>
              <td className="txtC" width="30%">
                {" "}
                Monto ejecutado
                <br />{" "}
                <h1 className="per_ejex">
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
            </tr>
          </tbody>
        </table>
        <Table
          dataSource={record.imputaciones}
          columns={paymentColumns}
          rowKey="id"
          size="small"
          pagination={false}
          bordered={true}
        />
      </div>
    );
  };

  render() {
    console.log(this.state.data);
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
