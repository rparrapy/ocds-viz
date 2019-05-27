import { Button, Input, Menu, Layout } from "antd";
import Link from "next/link";

const { Header } = Layout;

export default class MenuHeader extends React.Component {
  state = {
    selected: this.props.selected
  };

  render = () => (
    <Header style={{ background: "#fff" }}>
      <div style={{ float: "left", fontWeight: "bold", fontSize: 16 }}>
        Ejecución Financiera de Contratos
      </div>

      {/* <Button
        type="primary"
        style={{ float: "right", marginLeft: "20px", marginTop: "15px" }}
      >
        Visualizar
      </Button>

      <div style={{ float: "right" }}>
        <Input placeholder="Ingrese un ocid aquí" />
      </div> */}

      <Menu
        mode="horizontal"
        defaultSelectedKeys={[this.state.selected]}
        style={{ lineHeight: "64px", float: "right" }}
      >
        <Menu.Item key="1">
          <Link href="/index">
            <a>Gráfico</a>
          </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link href="list">
            <a>Listado</a>
          </Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
}
