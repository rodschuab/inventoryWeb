import { useState } from "react";
import ProductsPage from "./pages/ProductsPage";
import RawMaterialsPage from "./pages/RawMaterialsPage";
import ProductionPage from "./pages/ProductionPage";
import "./styles.css";

export default function App() {
  const [page, setPage] = useState("products");

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="title">Inventory Web</h1>
          <p className="subtitle">Products • Raw Materials • Production</p>
        </div>

        <nav className="nav">
          <button
            className={`navBtn ${page === "products" ? "active" : ""}`}
            onClick={() => setPage("products")}
          >
            Products
          </button>
          <button
            className={`navBtn ${page === "rawMaterials" ? "active" : ""}`}
            onClick={() => setPage("rawMaterials")}
          >
            Raw Materials
          </button>
          <button
            className={`navBtn ${page === "production" ? "active" : ""}`}
            onClick={() => setPage("production")}
          >
            Production
          </button>
        </nav>
      </header>

      <main className="main">
        {page === "products" && <ProductsPage />}
        {page === "rawMaterials" && <RawMaterialsPage />}
        {page === "production" && <ProductionPage />}
      </main>

      <footer className="footer">
        <span>InventoryAPI: http://localhost:8080</span>
      </footer>
    </div>
  );
}
