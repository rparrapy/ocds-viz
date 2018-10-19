import { Layout, Icon } from "antd";

const { Footer } = Layout;

export default () => (
  <Footer style={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.45)" }}>
    Desarrollado con <Icon type="heart" theme="twoTone" /> por{" "}
    <a href="https://github.com/rparrapy">Rodrigo Parra</a> con el apoyo del
    programa de bounties de la{" "}
    <a href="https://www.open-contracting.org">Open Contracting Partnership</a>.
  </Footer>
);
