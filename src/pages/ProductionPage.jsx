import { useEffect, useState } from "react";
import { productionService } from "../api/productionService";

export default function ProductionPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setMsg("");
      const data = await productionService.listarDisponiveis();
      setItems(data);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load production list");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Production Available</h2>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      {msg && <p className="msg">{msg}</p>}

      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Product ID</th>
              <th>Product Name</th>
              <th style={{ width: 180 }}>Producible Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.productId}>
                <td>{p.productId}</td>
                <td>{p.productName}</td>
                <td><b>{p.producibleQuantity}</b></td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="3">No data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
