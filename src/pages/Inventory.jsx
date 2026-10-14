import { useEffect, useState } from "react";
import {
  getAdminInventory,
  createInventoryItem,
  updateInventoryItem
} from "../services/adminInventoryService";
import "../css/inventorypage.css";
import "../css/forms.css";

const initialForm = {
  category: "",
  item: "",
  price: "",
  size: "",
  pricingUnit: "",
  minArea: "",
  status: "ACTIVE"
};

function formatNaira(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const [showCategoryGuide, setShowCategoryGuide] = useState(false);
  const [filter, setFilter] = useState("ALL");

  function loadInventory() {
    setLoading(true);
    setError(null);

    getAdminInventory()
      .then(setItems)
      .catch((err) =>
        setError(err.message || "Couldn't load inventory.")
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadInventory();
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openCreateModal() {
    setEditingItem(null);
    setForm(initialForm);
    setFormMessage(null);
    setShowCategoryGuide(false);
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingItem(item);

    setForm({
      category: item.category || "",
      item: item.item || "",
      price: item.price ?? "",
      size: item.size || "",
      pricingUnit: item.pricingUnit || "",
      minArea: item.minArea ?? "",
      status: item.status || "ACTIVE"
    });

    setFormMessage(null);
    setShowCategoryGuide(false);
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingItem(null);
    setFormMessage(null);
    setShowCategoryGuide(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setFormMessage(null);

    const requestData = {
      category: form.category,
      item: form.item,
      price: Number(form.price),
      size: form.size || null,
      pricingUnit: form.pricingUnit || null,
      minArea: form.minArea ? Number(form.minArea) : null,
      status: form.status
    };

    try {
      if (editingItem) {
        await updateInventoryItem(
          editingItem.inventoryId,
          requestData
        );

        setFormMessage({
          type: "success",
          text: "Inventory item updated successfully."
        });
      } else {
        await createInventoryItem({
          category: form.category,
          item: form.item,
          price: Number(form.price),
          size: form.size || null,
          pricingUnit: form.pricingUnit || null,
          minArea: form.minArea
            ? Number(form.minArea)
            : null
        });

        setFormMessage({
          type: "success",
          text: "Item added successfully."
        });
      }

      await loadInventory();

      setTimeout(() => {
        setShowModal(false);
        setEditingItem(null);
        setFormMessage(null);
        setShowCategoryGuide(false);
      }, 700);
    } catch (err) {
      setFormMessage({
        type: "error",
        text:
          err.message ||
          "Couldn't save inventory item."
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item) {
    const isActive = item.status === "ACTIVE";

    const confirmed = window.confirm(
      isActive
        ? "Hide this item from the customer website?"
        : "Show this item on the customer website?"
    );

    if (!confirmed) return;

    setError(null);

    try {
      await updateInventoryItem(item.inventoryId, {
        category: item.category,
        item: item.item,
        price: Number(item.price),
        size: item.size || null,
        pricingUnit: item.pricingUnit || null,
        minArea:
          item.minArea !== null &&
          item.minArea !== undefined &&
          item.minArea !== ""
            ? Number(item.minArea)
            : null,
        status: isActive ? "INACTIVE" : "ACTIVE"
      });

      await loadInventory();
    } catch (err) {
      setError(
        err.message ||
          "Couldn't update inventory status."
      );
    }
  }

  const filteredItems = items.filter((item) => {
    if (filter === "ACTIVE") {
      return item.status === "ACTIVE";
    }

    if (filter === "INACTIVE") {
      return item.status === "INACTIVE";
    }

    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-sub">Print stock and pricing.</p>
        </div>

        <button
          className="form-btn inventory-add-btn"
          onClick={openCreateModal}
        >
          + Add Inventory Item
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="inventory-toolbar">
        <div className="inventory-filters">
          <button
            className={
              "inventory-filter-btn" +
              (filter === "ALL" ? " is-active" : "")
            }
            onClick={() => setFilter("ALL")}
          >
            All
          </button>

          <button
            className={
              "inventory-filter-btn" +
              (filter === "ACTIVE" ? " is-active" : "")
            }
            onClick={() => setFilter("ACTIVE")}
          >
            Active
          </button>

          <button
            className={
              "inventory-filter-btn" +
              (filter === "INACTIVE" ? " is-active" : "")
            }
            onClick={() => setFilter("INACTIVE")}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="inventory-table">
        <div className="inventory-header">
          <span>Category</span>
          <span>Item</span>
          <span>Price</span>
          <span>Size</span>
          <span>Unit</span>
          <span>Min Area</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="inventory-loading">
            Loading inventory…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="inventory-empty">
            No inventory items found.
          </div>
        ) : (
          filteredItems.map((it) => (
            <div
              className="inventory-row"
              key={it.inventoryId}
            >
              <span>{it.category}</span>

              <span>{it.item}</span>

              <span>{formatNaira(it.price)}</span>

              <span>{it.size || "—"}</span>

              <span>{it.pricingUnit || "—"}</span>

              <span>{it.minArea ?? "—"}</span>

              <span>
                <span
                  className={
                    "inventory-status inventory-status-" +
                    String(it.status || "ACTIVE").toLowerCase()
                  }
                >
                  {it.status || "ACTIVE"}
                </span>
              </span>

              <span className="inventory-actions">
                <button
                  className="inventory-action-edit"
                  onClick={() => openEditModal(it)}
                >
                  Edit
                </button>

                <button
                  className={
                    it.status === "ACTIVE"
                      ? "inventory-action-deactivate"
                      : "inventory-action-activate"
                  }
                  onClick={() => toggleStatus(it)}
                >
                  {it.status === "ACTIVE"
                    ? "Deactivate"
                    : "Reactivate"}
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div
          className="inventory-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="inventory-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <div>
                <h2>
                  {editingItem
                    ? "Edit Inventory Item"
                    : "Add Inventory Item"}
                </h2>

                <p>
                  {editingItem
                    ? "Update the inventory item's details and status."
                    : "Add a new print stock or pricing item."}
                </p>
              </div>

              <button
                className="inventory-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="inventory-form"
            >
              <label className="field">
                <span>Category *</span>

                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) =>
                    update("category", e.target.value)
                  }
                  placeholder="e.g. LARGEFORMAT"
                />

                <div className="inventory-category-help">
                  <button
                    type="button"
                    className="inventory-category-help-btn"
                    onClick={() =>
                      setShowCategoryGuide((value) => !value)
                    }
                  >
                    ⓘ{" "}
                    {showCategoryGuide
                      ? "Hide category guide"
                      : "What category should I use?"}
                  </button>

                  {showCategoryGuide && (
                    <div className="inventory-category-guide">
                      <div>
                        <strong>LARGEFORMAT</strong>
                        <span>
                          Large prints like banners, priced by ft².
                        </span>
                      </div>

                      <div>
                        <strong>PRINTING</strong>
                        <span>
                          Standard prints like business cards and A4.
                        </span>
                      </div>

                      <div>
                        <strong>CLOTHE</strong>
                        <span>
                          Clothing such as T-shirts.
                        </span>
                      </div>

                      <div>
                        <strong>DI</strong>
                        <span>
                          Other production items.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              <label className="field">
                <span>Item *</span>

                <input
                  type="text"
                  required
                  value={form.item}
                  onChange={(e) =>
                    update("item", e.target.value)
                  }
                  placeholder="e.g. Vinyl Banner"
                />
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>Price *</span>

                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) =>
                      update("price", e.target.value)
                    }
                    placeholder="250"
                  />
                </label>

                <label className="field">
                  <span>Size</span>

                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) =>
                      update("size", e.target.value)
                    }
                    placeholder="per ft²"
                  />
                </label>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Pricing Unit</span>

                  <input
                    type="text"
                    value={form.pricingUnit}
                    onChange={(e) =>
                      update("pricingUnit", e.target.value)
                    }
                    placeholder="e.g. SQFT"
                  />
                </label>

                <label className="field">
                  <span>Min Area</span>

                  <input
                    type="number"
                    value={form.minArea}
                    onChange={(e) =>
                      update("minArea", e.target.value)
                    }
                    placeholder="Optional"
                  />
                </label>
              </div>

              {editingItem && (
                <label className="field">
                  <span>Status</span>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      update("status", e.target.value)
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>
              )}

              {formMessage && (
                <p
                  className={`form-message form-message--${formMessage.type}`}
                >
                  {formMessage.text}
                </p>
              )}

              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="inventory-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="form-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingItem
                      ? "Save Changes"
                      : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}