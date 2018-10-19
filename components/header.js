import { Button, Input, Menu, Layout } from "antd";

const { Header } = Layout;

export default () => (
  <Header style={{ background: "#fff" }}>
    <div style={{ float: "left", fontWeight: "bold", fontSize: 16 }}>
      Ejecución Financiera de Contratos
    </div>

    <Button
      type="primary"
      style={{ float: "right", marginLeft: "20px", marginTop: "15px" }}
    >
      Visualizar
    </Button>

    <div style={{ float: "right" }}>
      <Input placeholder="Ingrese un ocid aquí" />
    </div>

    <Menu
      mode="horizontal"
      defaultSelectedKeys={["1"]}
      style={{ lineHeight: "64px", float: "right" }}
    >
      <Menu.Item key="1">Gráfico</Menu.Item>
      <Menu.Item key="2">Listado</Menu.Item>
    </Menu>
  </Header>
);
