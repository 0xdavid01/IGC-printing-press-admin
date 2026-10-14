import { useEffect, useMemo, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  PDFDownloadLink
} from "@react-pdf/renderer";
import { getInventory } from "../services/inventoryService";
import logo from "../assets/igc-logo.png";
import "../css/createquote.css";

/* ---------- helpers ---------- */

function normalizeCategory(category) {
  return String(category || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function createQuoteNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `Q-${year}${month}${day}-${random}`;
}

// source: "inventory" | "custom"
function createEmptyItem(source = "inventory") {
  return {
    source,
    inventoryId: "",
    customName: "",
    customPrice: "",
    quantity: 1,
    size: "",
    width: "",
    height: "",
    specifications: ""
  };
}

function findInventoryItem(inventory, inventoryId) {
  return inventory.find(
    (entry) => Number(entry.inventoryId) === Number(inventoryId)
  );
}

// Single source of truth for title / unit price / total / details.
function resolveLine(item, inventory) {
  const quantity = Number(item.quantity || 0);
  const specs = item.specifications?.trim() || "";

  if (item.source === "custom") {
    const unitPrice = Number(item.customPrice || 0);

    return {
      title: item.customName?.trim() || "Custom item",
      unitPrice,
      total: unitPrice * quantity,
      details: [item.size ? `Size: ${item.size}` : "", specs]
        .filter(Boolean)
        .join(" • "),
      isLargeFormat: false,
      inventoryItem: null
    };
  }

  const inventoryItem = findInventoryItem(inventory, item.inventoryId);

  if (!inventoryItem) {
    return {
      title: "Inventory item",
      unitPrice: 0,
      total: 0,
      details: specs,
      isLargeFormat: false,
      inventoryItem: null
    };
  }

  const price = Number(inventoryItem.price || 0);
  const isLargeFormat =
    normalizeCategory(inventoryItem.category) === "LARGEFORMAT";
  const width = Number(item.width || 0);
  const height = Number(item.height || 0);

  let unitPrice = price;
  let total = price * quantity;

  if (isLargeFormat) {
    unitPrice = width && height ? price * width * height : price;
    total = width && height && quantity ? price * width * height * quantity : 0;
  }

  return {
    title: inventoryItem.item || "Inventory item",
    unitPrice,
    total,
    details: [
      item.size ? `Size: ${item.size}` : "",
      isLargeFormat && width && height ? `${item.width} × ${item.height} ft` : "",
      specs
    ]
      .filter(Boolean)
      .join(" • "),
    isLargeFormat,
    inventoryItem
  };
}

/* ---------- PDF ---------- */

const pdfStyles = StyleSheet.create({
  page: {
    padding: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#111111"
  },
  brand: { flexDirection: "column", alignItems: "flex-start" },
  // Width only: react-pdf computes height from the image's aspect ratio
  brandLogo: { width: 130, objectFit: "contain" },
  brandSub: { fontSize: 8, color: "#666666", marginTop: 6 },
  documentInfo: { alignItems: "flex-end" },
  documentTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  documentNumber: { fontSize: 10, fontWeight: "bold" },
  documentDate: { fontSize: 9, color: "#666666", marginTop: 3 },
  customerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 24
  },
  customerBlock: { width: "65%" },
  statusBlock: { width: "25%", alignItems: "flex-end" },
  label: {
    fontSize: 8,
    color: "#777777",
    textTransform: "uppercase",
    marginBottom: 5
  },
  customerName: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  customerDetail: { fontSize: 9, color: "#555555", marginBottom: 2 },
  status: { fontSize: 9, fontWeight: "bold" },
  table: { width: "100%" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111111",
    color: "#ffffff",
    padding: 8
  },
  tableHeaderDescription: { width: "47%", fontSize: 8, fontWeight: "bold" },
  tableHeaderQty: {
    width: "10%",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center"
  },
  tableHeaderPrice: {
    width: "21%",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "right"
  },
  tableHeaderAmount: {
    width: "22%",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "right"
  },
  tableRow: {
    flexDirection: "row",
    padding: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd"
  },
  description: { width: "47%" },
  descriptionTitle: { fontSize: 9, fontWeight: "bold" },
  descriptionDetail: {
    fontSize: 7,
    color: "#666666",
    marginTop: 3,
    lineHeight: 1.4
  },
  quantity: { width: "10%", textAlign: "center", fontSize: 9 },
  unitPrice: { width: "21%", textAlign: "right", fontSize: 9 },
  amount: {
    width: "22%",
    textAlign: "right",
    fontSize: 9,
    fontWeight: "bold"
  },
  summary: { marginTop: 20, marginLeft: "55%", width: "45%" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5
  },
  summaryLabel: { fontSize: 9, color: "#666666" },
  summaryValue: { fontSize: 9, fontWeight: "bold" },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#111111"
  },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold" },
  grandTotalValue: { fontSize: 12, fontWeight: "bold" },
  notes: { marginTop: 28, padding: 12, backgroundColor: "#f5f5f5" },
  notesTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 5 },
  notesText: { fontSize: 8, color: "#555555", lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 35,
    left: 42,
    right: 42,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  footerText: { fontSize: 7, color: "#777777" }
});

function QuotePDF({
  quoteNumber,
  quoteDate,
  customerName,
  customerPhone,
  customerEmail,
  items,
  inventory,
  total
}) {
  const lines = items.map((item) => resolveLine(item, inventory));

  return (
    <Document
      title={`IGC Print Press Quote ${quoteNumber}`}
      author="IGC Print Press"
      subject="Quotation"
    >
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View style={pdfStyles.brand}>
            <Image src={logo} style={pdfStyles.brandLogo} />
            <Text style={pdfStyles.brandSub}>PHC • Print • Packaging</Text>
          </View>

          <View style={pdfStyles.documentInfo}>
            <Text style={pdfStyles.documentTitle}>QUOTATION</Text>
            <Text style={pdfStyles.documentNumber}>{quoteNumber}</Text>
            <Text style={pdfStyles.documentDate}>{quoteDate}</Text>
          </View>
        </View>

        <View style={pdfStyles.customerSection}>
          <View style={pdfStyles.customerBlock}>
            <Text style={pdfStyles.label}>Bill To</Text>
            <Text style={pdfStyles.customerName}>
              {customerName || "Customer Name"}
            </Text>
            {customerPhone && (
              <Text style={pdfStyles.customerDetail}>{customerPhone}</Text>
            )}
            {customerEmail && (
              <Text style={pdfStyles.customerDetail}>{customerEmail}</Text>
            )}
          </View>

          <View style={pdfStyles.statusBlock}>
            <Text style={pdfStyles.label}>Quote Status</Text>
            <Text style={pdfStyles.status}>ESTIMATE</Text>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.tableHeaderDescription}>Description</Text>
            <Text style={pdfStyles.tableHeaderQty}>Qty</Text>
            <Text style={pdfStyles.tableHeaderPrice}>Unit Price</Text>
            <Text style={pdfStyles.tableHeaderAmount}>Amount</Text>
          </View>

          {lines.map((line, index) => (
            <View style={pdfStyles.tableRow} key={index}>
              <View style={pdfStyles.description}>
                <Text style={pdfStyles.descriptionTitle}>{line.title}</Text>
                {line.details ? (
                  <Text style={pdfStyles.descriptionDetail}>
                    {line.details}
                  </Text>
                ) : null}
              </View>

              <Text style={pdfStyles.quantity}>
                {items[index].quantity || 0}
              </Text>
              <Text style={pdfStyles.unitPrice}>
                {formatNaira(line.unitPrice)}
              </Text>
              <Text style={pdfStyles.amount}>{formatNaira(line.total)}</Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.summary}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Subtotal</Text>
            <Text style={pdfStyles.summaryValue}>{formatNaira(total)}</Text>
          </View>

          <View style={pdfStyles.grandTotal}>
            <Text style={pdfStyles.grandTotalLabel}>Total</Text>
            <Text style={pdfStyles.grandTotalValue}>{formatNaira(total)}</Text>
          </View>
        </View>

        <View style={pdfStyles.notes}>
          <Text style={pdfStyles.notesTitle}>Notes</Text>
          <Text style={pdfStyles.notesText}>
            This quotation is based on the specifications and quantities listed
            above. Final production may require confirmation of artwork,
            dimensions and finishing requirements.
          </Text>
        </View>

        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>
            IGC Print Press • PHC • Print • Packaging
          </Text>
          <Text style={pdfStyles.footerText}>Thank you for choosing IGC.</Text>
        </View>
      </Page>
    </Document>
  );
}

/* ---------- component ---------- */

export default function CreateQuote({ onClose }) {
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [quoteNumber] = useState(createQuoteNumber);
  const [quoteDate] = useState(formatDate());

  const [items, setItems] = useState([createEmptyItem("inventory")]);

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoadingInventory(true);
        setError("");

        const response = await getInventory();
        setInventory(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load inventory. You can still add custom items.");
      } finally {
        setLoadingInventory(false);
      }
    }

    loadInventory();
  }, []);

  function updateItem(index, field, value) {
    setItems((current) => {
      const updated = [...current];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleInventoryChange(index, inventoryId) {
    setItems((current) => {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        inventoryId,
        width: "",
        height: "",
        size: ""
      };
      return updated;
    });
  }

  function handleSourceChange(index, source) {
    setItems((current) => {
      if (current[index].source === source) {
        return current;
      }

      const updated = [...current];
      updated[index] = {
        ...createEmptyItem(source),
        quantity: current[index].quantity,
        specifications: current[index].specifications
      };
      return updated;
    });
  }

  function addItem(source) {
    setItems((current) => [...current, createEmptyItem(source)]);
  }

  function removeItem(index) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  const lines = useMemo(
    () => items.map((item) => resolveLine(item, inventory)),
    [items, inventory]
  );

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.total, 0),
    [lines]
  );

  function validateQuote() {
    if (!customerName.trim()) {
      return "Customer name is required.";
    }

    if (!customerPhone.trim()) {
      return "Customer phone number is required.";
    }

    if (!items.length) {
      return "Add at least one item.";
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const position = index + 1;

      const quantity = Number(item.quantity);

      if (item.source === "custom") {
        if (!item.customName.trim()) {
          return `Please enter a description for item ${position}.`;
        }

        if (item.customPrice === "" || Number(item.customPrice) < 0) {
          return `Please enter a valid unit price for item ${position}.`;
        }

        if (!quantity || quantity < 1) {
          return `Quantity must be at least 1 for item ${position}.`;
        }

        continue;
      }

      if (!item.inventoryId) {
        return `Please select an inventory item for item ${position}.`;
      }

      const selectedInventory = findInventoryItem(inventory, item.inventoryId);

      if (!selectedInventory) {
        return `Invalid inventory item for item ${position}.`;
      }

      if (!quantity || quantity < 1) {
        return `Quantity must be at least 1 for item ${position}.`;
      }

      if (normalizeCategory(selectedInventory.category) === "LARGEFORMAT") {
        const width = Number(item.width);
        const height = Number(item.height);

        if (!width || width <= 0) {
          return `Width is required for item ${position}.`;
        }

        if (!height || height <= 0) {
          return `Height is required for item ${position}.`;
        }

        if (
          selectedInventory.minArea &&
          width * height < Number(selectedInventory.minArea)
        ) {
          return `The minimum area for ${selectedInventory.item} is ${selectedInventory.minArea} ft².`;
        }
      }
    }

    return "";
  }

  function handleDownloadClick(event) {
    const validationError = validateQuote();

    if (validationError) {
      event.preventDefault();
      setError(validationError);
      return;
    }

    setError("");
  }

  return (
    <div className="create-quote-overlay">
      <div className="create-quote-modal">
        <header className="create-quote-header no-print">
          <div>
            <span className="create-quote-eyebrow">QUOTE GENERATOR</span>
            <h2>Create Quote</h2>
            <p>
              Build a quotation from your inventory, type items manually, or
              mix both.
            </p>
          </div>

          <button
            type="button"
            className="create-quote-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {error && <div className="create-quote-error no-print">{error}</div>}

        <div className="create-quote-body">
          <section className="quote-builder no-print">
            {/* CUSTOMER */}
            <div className="quote-builder-section">
              <div className="quote-builder-section-heading">
                <span>01</span>
                <div>
                  <h3>Customer</h3>
                  <p>Who is this quotation for?</p>
                </div>
              </div>

              <div className="quote-builder-grid">
                <label>
                  <span>Customer Name</span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="e.g. Kunle Adebayo"
                  />
                </label>

                <label>
                  <span>Phone Number</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="+234 803 123 4567"
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder="customer@email.com"
                  />
                </label>
              </div>
            </div>

            {/* ITEMS */}
            <div className="quote-builder-section">
              <div className="quote-builder-section-heading">
                <span>02</span>
                <div>
                  <h3>Quote Items</h3>
                  <p>Pick from inventory or enter an item manually.</p>
                </div>
              </div>

              <div className="quote-items">
                {items.map((item, index) => {
                  const line = lines[index];
                  const isCustom = item.source === "custom";

                  return (
                    <div className="quote-item" key={index}>
                      <div className="quote-item-top">
                        <div>
                          <span>
                            ITEM {String(index + 1).padStart(2, "0")}
                          </span>
                          <strong>
                            {isCustom
                              ? item.customName.trim() || "Custom item"
                              : line.inventoryItem?.item || "Select inventory"}
                          </strong>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            className="quote-item-remove"
                            onClick={() => removeItem(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="quote-source-toggle" role="tablist">
                        <button
                          type="button"
                          className={!isCustom ? "active" : ""}
                          onClick={() => handleSourceChange(index, "inventory")}
                        >
                          From inventory
                        </button>

                        <button
                          type="button"
                          className={isCustom ? "active" : ""}
                          onClick={() => handleSourceChange(index, "custom")}
                        >
                          Custom item
                        </button>
                      </div>

                      <div className="quote-item-grid">
                        {isCustom ? (
                          <label>
                            <span>Item Description</span>
                            <input
                              type="text"
                              value={item.customName}
                              onChange={(event) =>
                                updateItem(index, "customName", event.target.value)
                              }
                              placeholder="e.g. Branded A5 notebooks"
                            />
                          </label>
                        ) : (
                          <label>
                            <span>Inventory Item</span>
                            <select
                              value={item.inventoryId}
                              onChange={(event) =>
                                handleInventoryChange(index, event.target.value)
                              }
                              disabled={loadingInventory}
                            >
                              <option value="">
                                {loadingInventory
                                  ? "Loading inventory..."
                                  : "Select inventory"}
                              </option>

                              {inventory.map((inventoryItem) => (
                                <option
                                  key={inventoryItem.inventoryId}
                                  value={inventoryItem.inventoryId}
                                >
                                  {inventoryItem.item}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}

                        <label>
                          <span>Quantity</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(index, "quantity", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          <span>Size</span>
                          <input
                            type="text"
                            value={item.size}
                            onChange={(event) =>
                              updateItem(index, "size", event.target.value)
                            }
                            placeholder={
                              line.inventoryItem?.size || "Optional"
                            }
                          />
                        </label>
                      </div>

                      {isCustom && (
                        <label className="quote-custom-price">
                          <span>Unit Price (₦)</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.customPrice}
                            onChange={(event) =>
                              updateItem(index, "customPrice", event.target.value)
                            }
                            placeholder="0.00"
                          />
                        </label>
                      )}

                      {line.isLargeFormat && (
                        <div className="quote-dimensions">
                          <div className="quote-dimensions-title">
                            Large Format Dimensions
                          </div>

                          <div className="quote-dimensions-grid">
                            <label>
                              <span>Width (ft)</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.width}
                                onChange={(event) =>
                                  updateItem(index, "width", event.target.value)
                                }
                              />
                            </label>

                            <label>
                              <span>Height (ft)</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.height}
                                onChange={(event) =>
                                  updateItem(index, "height", event.target.value)
                                }
                              />
                            </label>
                          </div>

                          <small>Price is calculated per square foot.</small>
                        </div>
                      )}

                      <label className="quote-specifications">
                        <span>Specifications</span>
                        <textarea
                          value={item.specifications}
                          onChange={(event) =>
                            updateItem(index, "specifications", event.target.value)
                          }
                          placeholder="Optional production details..."
                        />
                      </label>

                      <div className="quote-item-total">
                        <span>Item subtotal</span>
                        <strong>{formatNaira(line.total)}</strong>
                      </div>
                    </div>
                  );
                })}

                <div className="quote-add-row">
                  <button
                    type="button"
                    className="quote-add-item"
                    onClick={() => addItem("inventory")}
                  >
                    + Add From Inventory
                  </button>

                  <button
                    type="button"
                    className="quote-add-item"
                    onClick={() => addItem("custom")}
                  >
                    + Add Custom Item
                  </button>
                </div>
              </div>
            </div>

            <div className="quote-builder-total">
              <span>Total Quote</span>
              <strong>{formatNaira(total)}</strong>
            </div>
          </section>

          {/* LIVE PREVIEW */}
          <section className="quote-document">
            <div className="quote-letterhead">
              <div className="quote-brand">
                <img
                  src={logo}
                  alt="IGC Print Press"
                  className="quote-logo-img"
                />
                <p>PHC • Print • Packaging</p>
              </div>

              <div className="quote-document-title">
                <span>QUOTATION</span>
                <strong>{quoteNumber}</strong>
                <small>{quoteDate}</small>
              </div>
            </div>

            <div className="quote-letterhead-rule" />

            <div className="quote-customer">
              <div>
                <span>BILL TO</span>
                <strong>{customerName || "Customer Name"}</strong>
                {customerPhone && <small>{customerPhone}</small>}
                {customerEmail && <small>{customerEmail}</small>}
              </div>

              <div className="quote-validity">
                <span>QUOTE STATUS</span>
                <strong>ESTIMATE</strong>
              </div>
            </div>

            <div className="quote-document-table">
              <div className="quote-table-header">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Amount</span>
              </div>

              {lines.map((line, index) => (
                <div className="quote-table-row" key={index}>
                  <div>
                    <strong>{line.title}</strong>
                    {line.details && <small>{line.details}</small>}
                  </div>

                  <span>{items[index].quantity || 0}</span>
                  <span>{formatNaira(line.unitPrice)}</span>
                  <strong>{formatNaira(line.total)}</strong>
                </div>
              ))}
            </div>

            <div className="quote-document-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatNaira(total)}</strong>
              </div>

              <div className="quote-document-grand-total">
                <span>Total</span>
                <strong>{formatNaira(total)}</strong>
              </div>
            </div>

            <div className="quote-notes">
              <strong>Notes</strong>
              <p>
                This quotation is based on the specifications and quantities
                listed above. Final production may require confirmation of
                artwork, dimensions and finishing requirements.
              </p>
            </div>

            <div className="quote-document-footer">
              <div>
                <strong>IGC Print Press</strong>
                <span>PHC • Print • Packaging</span>
              </div>

              <span>Thank you for choosing IGC.</span>
            </div>
          </section>
        </div>

        <footer className="create-quote-footer no-print">
          <button
            type="button"
            className="create-quote-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <PDFDownloadLink
            document={
              <QuotePDF
                quoteNumber={quoteNumber}
                quoteDate={quoteDate}
                customerName={customerName}
                customerPhone={customerPhone}
                customerEmail={customerEmail}
                items={items}
                inventory={inventory}
                total={total}
              />
            }
            fileName={`IGC-Print-Press-Quote-${quoteNumber}.pdf`}
            className="create-quote-primary"
            onClick={handleDownloadClick}
          >
            {({ loading }) =>
              loading ? "Generating PDF..." : "Download Quote PDF"
            }
          </PDFDownloadLink>
        </footer>
      </div>
    </div>
  );
}