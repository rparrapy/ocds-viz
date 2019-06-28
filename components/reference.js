import { Layout, Input } from "antd";

const { Sider } = Layout;

export default ({ filterValue, onFilterChanged }) => (
  <Sider
    width={300}
    style={{
      background: "#f0f2f5",
      textAlign: "center",
      paddingLeft: "50px",
      paddingTop: "5%"
    }}
  >
    <p>Buscador</p>
    <hr />
    <Input
      style={{ marginBottom: 15 }}
      placeholder="Buscar..."
      defaultValue={filterValue}
      onChange={e => onFilterChanged(e.target.value)}
    />
    <p>Referencias</p>
    <hr />

    <p style={{ textAlign: "left", fontSize: 12 }}>
      Los tamaños de los circulos representan los montos de los contratos.
    </p>

    <svg width={270} height={120}>
      <circle
        cx={55}
        cy={60}
        r={49.993}
        stroke="#adadad"
        strokeDasharray="5, 2"
        fill="#fff"
      />
      <path stroke="#adadad" d="M86 20h64" />
      <text x={160} y={23} fill="gray" fontSize="85%">
        {`100 Mil Millones`}
      </text>
      <circle
        cx={55}
        cy={74}
        r={35.35}
        stroke="#adadad"
        strokeDasharray="5, 2"
        fill="#fff"
      />
      <path stroke="#adadad" d="M87 60h63" />
      <text x={160} y={63} fill="gray" fontSize="85%">
        {`50 Mil Millones`}
      </text>
      <circle
        cx={55}
        cy={94}
        r={15.809}
        stroke="#adadad"
        strokeDasharray="5, 2"
        fill="#fff"
      />
      <path stroke="#adadad" d="M70 100h80" />
      <text x={160} y={103} fill="gray" fontSize="85%">
        {`10 Mil Millones`}
      </text>
    </svg>
    <hr />

    <ul>
      <li>
        <img src="/static/images/ico_dinero.svg" alt="" /> Contrato con Adenda{" "}
      </li>
    </ul>
    <hr />

    <ul>
      {" "}
      <li>
        <img src="/static/images/ico_color1.png" alt="" /> Monto total del
        proyecto
      </li>{" "}
      <li>
        <img src="/static/images/ico_color2.png" alt="" /> Monto pagado del
        proyecto
      </li>{" "}
    </ul>

    <style jsx>{`
      hr {
        margin-bottom: 15px;
        margin-top: 15px;
        border-top: 1px solid #ccc;
      }

      img {
        width: 18px;
        height: 18px;
      }

      ul {
        padding-left: 0px;
        text-align: left;
        margin-bottom: 0px;
      }

      li {
        list-style: none;
        font-size: 12px;
        padding-bottom: 5px;
      }
    `}</style>
  </Sider>
);
