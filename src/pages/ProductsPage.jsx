import { useEffect, useState } from "react";
import { productService } from "../api/productService";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setMsg("");
      const data = await productService.listar();
      setItems(data);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load products");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const reset = () => {
    setEditingId(null);
    setForm({ name: "", description: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setMsg("");
      if (editingId) await productService.atualizar(editingId, form);
      else await productService.criar(form);

      reset();
      await load();
    } catch (e2) {
      const fields = e2?.response?.data?.fields;
      setMsg(fields ? Object.values(fields).join(" | ") : (e2?.response?.data?.message || "Request failed"));
    }
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name || "", description: p.description || "" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      setMsg("");
      await productService.excluir(id);
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Products</h2>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      <div className="grid2">
        <form className="panel" onSubmit={submit}>
          <h3>{editingId ? `Edit #${editingId}` : "Create"}</h3>

          <label className="label">Name</label>
          <input className="input" name="name" value={form.name} onChange={onChange} placeholder="Cake" />

          <label className="label">Description</label>
          <input className="input" name="description" value={form.description} onChange={onChange} placeholder="Optional" />

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
                <th>Description</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>
                    <button className="btn" onClick={() => edit(p)}>Edit</button>{" "}
                    <button className="btn danger" onClick={() => remove(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {msg && <p className="msg">{msg}</p>}
        </div>
      </div>
    </section>
  );
}
