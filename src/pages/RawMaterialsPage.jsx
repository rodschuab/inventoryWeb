import { useEffect, useState } from "react";
import { rawMaterialService } from "../api/rawMaterialService";

export default function RawMaterialsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", unit: "", stockQuantity: "" });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setMsg("");
      const data = await rawMaterialService.listar();
      setItems(data);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load raw materials");
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const reset = () => {
    setEditingId(null);
    setForm({ name: "", unit: "", stockQuantity: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setMsg("");
      const payload = {
        name: form.name,
        unit: form.unit,
        stockQuantity: Number(form.stockQuantity),
      };

      if (editingId) await rawMaterialService.atualizar(editingId, payload);
      else await rawMaterialService.criar(payload);

      reset();
      await load();
    } catch (e2) {
      const fields = e2?.response?.data?.fields;
      setMsg(fields ? Object.values(fields).join(" | ") : (e2?.response?.data?.message || "Request failed"));
    }
  };

  const edit = (m) => {
    setEditingId(m.id);
    setForm({
      name: m.name || "",
      unit: m.unit || "",
      stockQuantity: String(m.stockQuantity ?? ""),
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this raw material?")) return;
    try {
      setMsg("");
      await rawMaterialService.excluir(id);
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Raw Materials</h2>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      <div className="grid2">
        <form className="panel" onSubmit={submit}>
          <h3>{editingId ? `Edit #${editingId}` : "Create"}</h3>

          <label className="label">Name</label>
          <input className="input" name="name" value={form.name} onChange={onChange} placeholder="Flour" />

          <label className="label">Unit</label>
          <input className="input" name="unit" value={form.unit} onChange={onChange} placeholder="kg" />

          <label className="label">Stock Quantity</label>
          <input className="input" name="stockQuantity" value={form.stockQuantity} onChange={onChange} placeholder="10" />

          <div className="row">
            <button className="btn primary" type="submit">{editingId ? "Update" : "Create"}</button>
            {editingId && <button className="btn" type="button" onClick={reset}>Cancel</button>}
          </div>

          {msg && <p className="msg">{msg}</p>}
        </form>

        <div className="panel">
          <h3>List</h3>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Stock</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.name}</td>
                  <td>{m.unit}</td>
                  <td>{m.stockQuantity}</td>
                  <td>
                    <button className="btn" onClick={() => edit(m)}>Edit</button>{" "}
                    <button className="btn danger" onClick={() => remove(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="5">No raw materials found.</td></tr>
              )}
            </tbody>
          </table>

          {msg && <p className="msg">{msg}</p>}
        </div>
      </div>
    </section>
  );
}
