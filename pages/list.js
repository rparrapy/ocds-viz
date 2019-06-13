import { dataset } from "../data/data";
import { Table, Layout, Input, Button, Icon } from "antd";
import Header from "../components/header";
import Footer from "../components/footer";
import "./list.css";
import { getPaidAmount, formatNumber, createNodes } from "../utils/utils";
import moment from "moment";
import Highlighter from "react-highlight-words";

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
    const urlParams = new URLSearchParams(window.location.search);
    this.setState({
      data: createNodes(dataset.contratos),
      filteredInfo: { id: urlParams.get("id") }
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

    return (
      <div>
        <div style={{ textAlign: "center" }}>
          <div id="prueba" style={{ minWidth: "200px" }} />
        </div>

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
                <br /> <strong>{record.name}</strong>{" "}
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
        <br />
        <Table
          dataSource={payments.concat(adendaPayments)}
          columns={paymentColumns}
          rowKey="id"
          size="small"
          pagination={false}
          bordered={true}
        />
      </div>
    );
  };

  getColumnSearchProps = (dataIndex, label) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }} className="ant-table-filter-dropdown">
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Buscar ${label}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Filtrar
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Limpiar
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      value
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : true,
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    )
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    if (this.state.filteredInfo) {
      this.setState({ filteredInfo: { id: selectedKeys[0] } });
    } else {
      this.setState({ searchText: selectedKeys[0] });
    }
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
  };

  render = () => {
    let { filteredInfo } = this.state;
    filteredInfo = filteredInfo || {};

    const columns = [
      {
        title: "Cod. de Contratación",
        dataIndex: "id",
        key: "id",
        width: "15%",
        filteredValue: [filteredInfo.id] || null,
        ...this.getColumnSearchProps("id", "Cod. de Contratación")
      },
      {
        title: "Nombre",
        dataIndex: "name",
        key: "name",
        width: "30%",
        ...this.getColumnSearchProps("name", "Nombre")
      },
      {
        title: "RUC",
        dataIndex: "provider_code",
        key: "provider_code",
        width: "10%",
        ...this.getColumnSearchProps("provider_code", "RUC")
      },
      {
        title: "Proveedor",
        dataIndex: "provider",
        key: "provider",
        ...this.getColumnSearchProps("provider", "Proveedor")
      },
      {
        title: "Monto",
        dataIndex: "formattedValue",
        key: "formattedValue",
        width: "14%",
        ...this.getColumnSearchProps("formattedValue", "Monto")
      },
      {
        title: "Modalidad",
        dataIndex: "modalidad",
        key: "modalidad",
        ...this.getColumnSearchProps("modalidad", "Modalidad")
      }
    ];

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
  };
}
