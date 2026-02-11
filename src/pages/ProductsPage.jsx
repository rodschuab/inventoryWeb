import { useEffect, useState } from "react";
import { productService } from "../api/productService";
import { rawMaterialService } from "../api/rawMaterialService";
import { productMaterialService } from "../api/productMaterialService";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [materialsOfProduct, setMaterialsOfProduct] = useState([]);

  const [addForm, setAddForm] = useState({ rawMaterialId: "", quantityRequired: "" });
  const [bomMsg, setBomMsg] = useState("");

  // para edicao inline do quantityRequired
  const [editQty, setEditQty] = useState({}); 

  const loadProducts = async () => {
    try {
      setMsg("");
      const data = await productService.listar();
      setItems(data);

      // se nao tiver produto selecionado e existir produt seleciona o primeiro
      if (!selectedProductId && data.length > 0) {
        setSelectedProductId(data[0].id);
      }
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load products");
    }
  };

  const loadRawMaterials = async () => {
    try {
      const data = await rawMaterialService.listar();
      setRawMaterials(data);
    } catch (e) {
      // nao trava a página 
      console.error(e);
    }
  };

  const loadBOM = async (productId) => {
    if (!productId) return;
    try {
      setBomMsg("");
      const data = await productMaterialService.listarDoProduto(productId);
      setMaterialsOfProduct(data);

      // prepara os campos de ediçao
      const map = {};
      data.forEach((a) => {
        map[a.id] = String(a.quantityRequired ?? "");
      });
      setEditQty(map);
    } catch (e) {
      setBomMsg(e?.response?.data?.message || "Failed to load product materials");
    }
  };

  useEffect(() => {
    loadProducts();
    loadRawMaterials();
  }, []);

  useEffect(() => {
    if (selectedProductId) loadBOM(selectedProductId);
  }, [selectedProductId]);

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
      await loadProducts();
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

      // se deletou o selecionado limpa seleçao
      if (selectedProductId === id) {
        setSelectedProductId(null);
        setMaterialsOfProduct([]);
      }

      await loadProducts();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to delete");
    }
  };

  const onSelectProduct = (e) => {
    const id = Number(e.target.value);
    setSelectedProductId(id);
  };

  const onAddChange = (e) => {
    setAddForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const addMaterial = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      setBomMsg("");

      const payload = {
        rawMaterialId: Number(addForm.rawMaterialId),
        quantityRequired: Number(addForm.quantityRequired),
      };

      await productMaterialService.adicionar(selectedProductId, payload);

      setAddForm({ rawMaterialId: "", quantityRequired: "" });
      await loadBOM(selectedProductId);
    } catch (e2) {
      const fields = e2?.response?.data?.fields;
      setBomMsg(fields ? Object.values(fields).join(" | ") : (e2?.response?.data?.message || "Request failed"));
    }
  };

  const updateAssociation = async (associationId) => {
    if (!selectedProductId) return;

    try {
      setBomMsg("");
      const payload = { quantityRequired: Number(editQty[associationId]) };

      await productMaterialService.atualizar(selectedProductId, associationId, payload);
      await loadBOM(selectedProductId);
    } catch (e) {
      setBomMsg(e?.response?.data?.message || "Failed to update association");
    }
  };

  const removeAssociation = async (associationId) => {
    if (!selectedProductId) return;
    if (!confirm("Remove this raw material from product?")) return;

    try {
      setBomMsg("");
      await productMaterialService.excluir(selectedProductId, associationId);
      await loadBOM(selectedProductId);
    } catch (e) {
      setBomMsg(e?.response?.data?.message || "Failed to remove association");
    }
  };

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Products</h2>
        <button className="btn" onClick={loadProducts}>Refresh</button>
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

      <div style={{ marginTop: 14 }} className="panel">
        <h3>Product Materials </h3>

        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ minWidth: 260 }}>
            <label className="label">Select Product</label>
            <select className="input" value={selectedProductId ?? ""} onChange={onSelectProduct}>
              {items.length === 0 && <option value="">No products</option>}
              {items.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn" onClick={() => loadBOM(selectedProductId)} disabled={!selectedProductId}>
            Refresh
          </button>
        </div>

        <form onSubmit={addMaterial} style={{ marginTop: 12 }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <div style={{ minWidth: 260, flex: 1 }}>
              <label className="label">Raw Material</label>
              <select
                className="input"
                name="rawMaterialId"
                value={addForm.rawMaterialId}
                onChange={onAddChange}
              >
                <option value="">Select</option>
                {rawMaterials.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    #{rm.id} - {rm.name} ({rm.unit})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 220 }}>
              <label className="label">Quantity Required</label>
              <input
                className="input"
                name="quantityRequired"
                value={addForm.quantityRequired}
                onChange={onAddChange}
                placeholder="Ex: 2"
              />
            </div>

            <div style={{ alignSelf: "end" }}>
              <button className="btn primary" type="submit" disabled={!selectedProductId}>
                Add
              </button>
            </div>
          </div>
        </form>

        {bomMsg && <p className="msg">{bomMsg}</p>}

        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Assoc ID</th>
              <th>Raw Material</th>
              <th style={{ width: 180 }}>Unit</th>
              <th style={{ width: 220 }}>Quantity Required</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materialsOfProduct.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>
                  #{a.rawMaterialId} - {a.rawMaterialName}
                </td>
                <td>{a.unit}</td>
                <td>
                  <input
                    className="input"
                    style={{ maxWidth: 180 }}
                    value={editQty[a.id] ?? ""}
                    onChange={(e) => setEditQty((p) => ({ ...p, [a.id]: e.target.value }))}
                  />
                </td>
                <td>
                  <button className="btn" onClick={() => updateAssociation(a.id)}>
                    Save
                  </button>{" "}
                  <button className="btn danger" onClick={() => removeAssociation(a.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}

            {materialsOfProduct.length === 0 && (
              <tr>
                <td colSpan="5">No materials associated for this product.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
