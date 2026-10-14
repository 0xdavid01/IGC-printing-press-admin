import { useEffect, useState } from "react";
import { createCustomer, getCustomers, searchCustomers, updateCustomer } from "../services/customerService";
import "../css/customers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  });

  useEffect(() => {
    loadCustomers();
  }, [page]);

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const data = search.trim()
        ? await searchCustomers(search.trim(), page, 25)
        : await getCustomers(page, 25);

      setCustomers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    setPage(0);
    setLoading(true);
    setError("");

    try {
      const data = search.trim()
        ? await searchCustomers(search.trim(), 0, 25)
        : await getCustomers(0, 25);

      setCustomers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.message || "Failed to search customers.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingCustomer(null);
    setForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(customer) {
    setEditingCustomer(customer);
    setForm({
      customerName: customer.customerName || "",
      customerPhone: customer.customerPhone || "",
      customerEmail: customer.customerEmail || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingCustomer(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.customerId, form);
        setSuccess("Customer updated successfully.");
      } else {
        await createCustomer(form);
        setSuccess("Customer added successfully.");
      }

      setShowForm(false);
      setEditingCustomer(null);
      await loadCustomers();
    } catch (err) {
      setError(err.message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-sub">Manage your customer records.</p>
        </div>

        <button className="primary-button" onClick={openCreateForm}>+ Add Customer</button>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="customer-toolbar">
        <form onSubmit={handleSearch} className="customer-search">
          <input
            type="text"
            placeholder="Search customer by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {search && (
          <button
            className="clear-search"
            onClick={() => {
              setSearch("");
              setPage(0);
              loadCustomers();
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="customers-panel">
        {loading ? (
          <div className="table-state">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="table-state">
            <h3>No customers found</h3>
            <p>There are no customer records to display.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customerId}>
                    <td>#{customer.customerId}</td>
                    <td><strong>{customer.customerName}</strong></td>
                    <td>{customer.customerPhone}</td>
                    <td>{customer.customerEmail}</td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>
                      <button className="table-action" onClick={() => openEditForm(customer)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="customers-pagination">
          <button disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>Next</button>
        </div>
      )}

      {showForm && (
        <div className="customer-modal-backdrop">
          <div className="customer-modal">
            <div className="customer-modal-header">
              <div>
                <h2>{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
                <p>{editingCustomer ? "Update the customer's information." : "Add a new customer record."}</p>
              </div>

              <button className="modal-close" onClick={closeForm} disabled={saving}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="customer-form">
              <label>
                Customer Name
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </label>

              <div className="customer-form-actions">
                <button type="button" className="secondary-button" onClick={closeForm} disabled={saving}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : editingCustomer ? "Update Customer" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}