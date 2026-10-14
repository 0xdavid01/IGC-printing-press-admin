import { useEffect, useMemo, useState } from "react";

import { createStaffJob } from "../services/jobsService";

import {
  getDesignInventory,
  getInventory
} from "../services/inventoryService";

import "../css/jobform.css";

const PAYMENT_OPTIONS = [50, 75, 100];
const PAYMENT_METHODS = ["CASH", "TRANSFER", "POS"];

function normalizeCategory(category) {
  return String(category || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function createEmptyItem() {
  return {
    inventoryId: "",
    quantity: 1,
    size: "",
    width: "",
    height: "",
    specifications: "",
    message: "",
    designRequired: false
  };
}

export default function JobForm({ onSuccess, onCancel }) {
  const [inventory, setInventory] = useState([]);
  const [designItem, setDesignItem] = useState(null);

  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingDesign, setLoadingDesign] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [items, setItems] = useState([
    createEmptyItem()
  ]);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentPercent, setPaymentPercent] = useState(50);
  const [customAmount, setCustomAmount] = useState("");

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoadingInventory(true);

        const response = await getInventory();

        setInventory(
          Array.isArray(response)
            ? response
            : []
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load inventory.");
      } finally {
        setLoadingInventory(false);
      }
    }

    loadInventory();
  }, []);

  useEffect(() => {
    async function loadDesignInventory() {
      try {
        setLoadingDesign(true);

        const response =
          await getDesignInventory();

        if (
          response &&
          typeof response === "object" &&
          response.inventoryId
        ) {
          setDesignItem(response);
        } else {
          setDesignItem(null);
        }
      } catch (err) {
        console.error(err);
        setDesignItem(null);
      } finally {
        setLoadingDesign(false);
      }
    }

    loadDesignInventory();
  }, []);

  function getInventoryItem(inventoryId) {
    return inventory.find(
      (item) =>
        Number(item.inventoryId) ===
        Number(inventoryId)
    );
  }

  function calculateItemTotal(item) {
    const selectedInventory =
      getInventoryItem(item.inventoryId);

    if (!selectedInventory) {
      return 0;
    }

    const price = Number(
      selectedInventory.price || 0
    );

    const quantity = Number(
      item.quantity || 0
    );

    const category = normalizeCategory(
      selectedInventory.category
    );

    if (category === "LARGEFORMAT") {
      const width = Number(item.width || 0);
      const height = Number(item.height || 0);

      if (
        !width ||
        !height ||
        !quantity
      ) {
        return 0;
      }

      return (
        price *
        width *
        height *
        quantity
      );
    }

    return price * quantity;
  }

  const itemTotals = useMemo(() => {
    return items.map((item) =>
      calculateItemTotal(item)
    );
  }, [items, inventory]);

  const printTotal = useMemo(() => {
    return itemTotals.reduce(
      (total, amount) =>
        total + amount,
      0
    );
  }, [itemTotals]);

  const designTotal = useMemo(() => {
    if (!designItem) {
      return 0;
    }

    const hasDesign = items.some(
      (item) => item.designRequired
    );

    return hasDesign
      ? Number(designItem.price || 0)
      : 0;
  }, [items, designItem]);

  const total =
    printTotal + designTotal;

  const amountPaid = useMemo(() => {
    if (paymentPercent === "custom") {
      return Math.round(
        Number(customAmount || 0)
      );
    }

    return Math.round(
      total *
        (Number(paymentPercent) / 100)
    );
  }, [
    total,
    paymentPercent,
    customAmount
  ]);

  const balance = Math.max(
    total - amountPaid,
    0
  );

  const minimumCustomAmount =
    Math.floor(total * 0.5) + 1;

  function updateItem(
    index,
    field,
    value
  ) {
    setItems((current) => {
      const updated = [...current];

      updated[index] = {
        ...updated[index],
        [field]: value
      };

      return updated;
    });
  }

  function handleInventoryChange(
    index,
    inventoryId
  ) {
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

  function addItem() {
    setItems((current) => [
      ...current,
      createEmptyItem()
    ]);
  }

  function removeItem(index) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  }

  function toggleDesign(index) {
    setItems((current) => {
      const updated = [...current];

      const currentItem =
        updated[index];

      updated[index] = {
        ...currentItem,
        designRequired:
          !currentItem.designRequired
      };

      return updated;
    });
  }

  function validateForm() {
    if (!fullName.trim()) {
      return "Customer name is required.";
    }

    if (!phoneNumber.trim()) {
      return "Customer phone number is required.";
    }

    if (
      !PAYMENT_METHODS.includes(
        paymentMethod
      )
    ) {
      return "Please select a payment method.";
    }

    if (!items.length) {
      return "Add at least one job item.";
    }

    for (
      let index = 0;
      index < items.length;
      index += 1
    ) {
      const item = items[index];

      if (!item.inventoryId) {
        return `Please select an item for item ${
          index + 1
        }.`;
      }

      const selectedInventory =
        getInventoryItem(
          item.inventoryId
        );

      if (!selectedInventory) {
        return `Invalid inventory item for item ${
          index + 1
        }.`;
      }

      const quantity = Number(
        item.quantity
      );

      if (
        !quantity ||
        quantity < 1
      ) {
        return `Quantity must be at least 1 for item ${
          index + 1
        }.`;
      }

      const category =
        normalizeCategory(
          selectedInventory.category
        );

      if (
        category === "LARGEFORMAT"
      ) {
        const width = Number(
          item.width
        );

        const height = Number(
          item.height
        );

        if (
          !width ||
          width <= 0
        ) {
          return `Width is required for item ${
            index + 1
          }.`;
        }

        if (
          !height ||
          height <= 0
        ) {
          return `Height is required for item ${
            index + 1
          }.`;
        }

        if (
          selectedInventory.minArea
        ) {
          const area =
            width * height;

          if (
            area <
            Number(
              selectedInventory.minArea
            )
          ) {
            return `The minimum area for ${selectedInventory.item} is ${selectedInventory.minArea} ft².`;
          }
        }
      }

      if (item.designRequired) {
        if (!designItem) {
          return "Design service is not available in inventory.";
        }
      }
    }

    if (paymentPercent === "custom") {
      const custom =
        Number(customAmount);

      if (
        !custom ||
        custom <= total * 0.5
      ) {
        return `Custom amount must be greater than ${formatNaira(
          total * 0.5
        )}.`;
      }

      if (custom > total) {
        return `Custom amount cannot be greater than the order total of ${formatNaira(
          total
        )}.`;
      }
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const requestData = {
      fullName: fullName.trim(),

      phoneNumber:
        phoneNumber.trim(),

      email:
        email.trim() || null,

      paymentMethod,

      amountPaid,

      items: items.map((item) => {
        const selectedInventory =
          getInventoryItem(
            item.inventoryId
          );

        const category =
          normalizeCategory(
            selectedInventory.category
          );

        return {
          inventoryId: Number(
            item.inventoryId
          ),

          quantity: Number(
            item.quantity
          ),

          size:
            item.size.trim() ||
            null,

          width:
            category ===
            "LARGEFORMAT"
              ? Number(item.width)
              : null,

          height:
            category ===
            "LARGEFORMAT"
              ? Number(item.height)
              : null,

          dimensionUnit:
            category ===
            "LARGEFORMAT"
              ? "ft"
              : null,

          specifications:
            item.specifications.trim() ||
            null,

          message:
            item.message.trim() ||
            null,

          designRequired:
            Boolean(
              item.designRequired
            ),

          designBrief:
            item.designRequired
              ? "No brief provided"
              : null,

          artworkFileIndex: null,

          designFileIndex: null
        };
      })
    };

    try {
      setSubmitting(true);

      const response =
        await createStaffJob(
          requestData
        );

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to create the job. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const loading =
    loadingInventory ||
    loadingDesign;

  return (
    <div className="job-form-overlay">
      <div className="job-form-modal">

        <header className="job-form-header">
          <div>
            <p className="job-form-eyebrow">
              WALK-IN ORDER
            </p>

            <h2>
              Create New Job
            </h2>

            <p>
              Record a customer's
              production order and
              payment.
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              className="job-form-close"
              onClick={onCancel}
              disabled={submitting}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </header>

        {error && (
          <div className="job-form-error">
            {error}
          </div>
        )}

        <form
          className="job-form-body"
          onSubmit={handleSubmit}
        >

          <section className="job-form-section">
            <div className="job-form-section-heading">
              <div>
                <span className="job-form-section-number">
                  01
                </span>

                <div>
                  <h3>
                    Customer Details
                  </h3>

                  <p>
                    Basic information about
                    the customer.
                  </p>
                </div>
              </div>
            </div>

            <div className="job-form-grid job-form-grid-3">

              <label className="job-form-field">
                <span>
                  Full Name
                </span>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Kunle Adebayo"
                  required
                />
              </label>

              <label className="job-form-field">
                <span>
                  Phone Number
                </span>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(
                      event.target.value
                    )
                  }
                  placeholder="+234 803 123 4567"
                  required
                />
              </label>

              <label className="job-form-field">
                <span>
                  Email (optional)
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="customer@email.com"
                />
              </label>

            </div>
          </section>

          <section className="job-form-section">

            <div className="job-form-section-heading">
              <div>
                <span className="job-form-section-number">
                  02
                </span>

                <div>
                  <h3>
                    Job Items
                  </h3>

                  <p>
                    Add the products or
                    services the customer
                    wants.
                  </p>
                </div>
              </div>
            </div>

            <div className="job-items">

              {items.map(
                (item, index) => {
                  const selectedInventory =
                    getInventoryItem(
                      item.inventoryId
                    );

                  const category =
                    normalizeCategory(
                      selectedInventory?.category
                    );

                  const itemTotal =
                    itemTotals[index] ||
                    0;

                  return (
                    <div
                      className="job-item-card"
                      key={index}
                    >

                      <div className="job-item-header">

                        <div>
                          <span className="job-item-number">
                            ITEM{" "}
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <h4>
                            Production Item
                          </h4>
                        </div>

                        {items.length >
                          1 && (
                          <button
                            type="button"
                            className="job-remove-item"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            disabled={
                              submitting
                            }
                          >
                            Remove
                          </button>
                        )}

                      </div>

                      <div className="job-form-grid job-form-grid-3">

                        <label className="job-form-field">
                          <span>
                            Item
                          </span>

                          <select
                            value={
                              item.inventoryId
                            }
                            onChange={(
                              event
                            ) =>
                              handleInventoryChange(
                                index,
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              loading ||
                              submitting
                            }
                            required
                          >
                            <option value="">
                              Select inventory
                            </option>

                            {inventory.map(
                              (
                                inventoryItem
                              ) => (
                                <option
                                  key={
                                    inventoryItem.inventoryId
                                  }
                                  value={
                                    inventoryItem.inventoryId
                                  }
                                >
                                  {
                                    inventoryItem.item
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <label className="job-form-field">
                          <span>
                            Quantity
                          </span>

                          <input
                            type="number"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "quantity",
                                event.target
                                  .value
                              )
                            }
                            required
                          />
                        </label>

                        <label className="job-form-field">
                          <span>
                            Size
                          </span>

                          <input
                            type="text"
                            value={
                              item.size
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "size",
                                event.target
                                  .value
                              )
                            }
                            placeholder={
                              selectedInventory?.size ||
                              "Optional"
                            }
                          />
                        </label>

                      </div>

                      {category ===
                        "LARGEFORMAT" && (
                        <div className="job-dimensions">

                          <div className="job-subsection-label">
                            Dimensions
                          </div>

                          <div className="job-form-grid job-form-grid-2">

                            <label className="job-form-field">
                              <span>
                                Width (ft)
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.width
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    index,
                                    "width",
                                    event.target
                                      .value
                                  )
                                }
                                required
                              />
                            </label>

                            <label className="job-form-field">
                              <span>
                                Height (ft)
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.height
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    index,
                                    "height",
                                    event.target
                                      .value
                                  )
                                }
                                required
                              />
                            </label>

                          </div>
                        </div>
                      )}

                      <div className="job-form-grid job-form-grid-2">

                        <label className="job-form-field">
                          <span>
                            Specifications
                          </span>

                          <textarea
                            value={
                              item.specifications
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "specifications",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Optional production specifications..."
                          />
                        </label>

                        <label className="job-form-field">
                          <span>
                            Message
                          </span>

                          <textarea
                            value={
                              item.message
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "message",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Optional message or instruction..."
                          />
                        </label>

                      </div>

                      {designItem && (
                        <div className="job-design-section">

                          <div className="job-design-toggle-row">

                            <div className="job-design-toggle-copy">

                              <div className="job-design-toggle-title">
                                Customer wants design
                              </div>

                              <div className="job-design-toggle-description">
                                IGC will create the
                                artwork for this item.
                              </div>

                            </div>

                            <button
                              type="button"
                              className={`job-design-toggle ${
                                item.designRequired
                                  ? "is-on"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleDesign(
                                  index
                                )
                              }
                              disabled={
                                submitting
                              }
                              aria-label="Toggle design service"
                              aria-pressed={
                                item.designRequired
                              }
                            >
                              <span className="job-design-toggle-track">
                                <span className="job-design-toggle-knob" />
                              </span>
                            </button>

                          </div>

                          {item.designRequired && (
                            <div className="job-design-fields">

                              <div className="job-design-price">

                                <div>
                                  <span>
                                    Design Service
                                  </span>

                                  <small>
                                    Added automatically
                                    by the system
                                  </small>
                                </div>

                                <strong>
                                  {formatNaira(
                                    designItem.price
                                  )}
                                </strong>

                              </div>

                            </div>
                          )}

                        </div>
                      )}

                      <div className="job-item-total">
                        <span>
                          Item subtotal
                        </span>

                        <strong>
                          {formatNaira(
                            itemTotal
                          )}
                        </strong>
                      </div>

                    </div>
                  );
                }
              )}

              <button
                type="button"
                className="job-add-item"
                onClick={addItem}
                disabled={submitting}
              >
                + Add Another Item
              </button>

            </div>
          </section>

          <section className="job-form-section">

            <div className="job-form-section-heading">
              <div>
                <span className="job-form-section-number">
                  03
                </span>

                <div>
                  <h3>
                    Payment
                  </h3>

                  <p>
                    Record how much the
                    customer is paying upfront.
                  </p>
                </div>
              </div>
            </div>

            <div className="job-payment-layout">

              <div>
                <div className="job-subsection-label">
                  Payment Method
                </div>

                <div className="job-payment-methods">

                  {PAYMENT_METHODS.map(
                    (method) => (
                      <button
                        type="button"
                        key={method}
                        className={`job-payment-method ${
                          paymentMethod ===
                          method
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() =>
                          setPaymentMethod(
                            method
                          )
                        }
                        disabled={
                          submitting
                        }
                      >
                        <span className="job-payment-method-indicator" />

                        <span>
                          {method}
                        </span>
                      </button>
                    )
                  )}

                </div>
              </div>

              <div>

                <div className="job-subsection-label">
                  Amount Paid
                </div>

                <div className="job-payment-options">

                  {PAYMENT_OPTIONS.map(
                    (percentage) => (
                      <button
                        type="button"
                        key={
                          percentage
                        }
                        className={`job-payment-option ${
                          paymentPercent ===
                          percentage
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() => {
                          setPaymentPercent(
                            percentage
                          );

                          setCustomAmount("");
                        }}
                        disabled={
                          submitting
                        }
                      >
                        <strong>
                          {percentage}%
                        </strong>

                        <span>
                          {formatNaira(
                            Math.round(
                              total *
                                (percentage /
                                  100)
                            )
                          )}
                        </span>
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className={`job-payment-option ${
                      paymentPercent ===
                      "custom"
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setPaymentPercent(
                        "custom"
                      )
                    }
                    disabled={
                      submitting
                    }
                  >
                    <strong>
                      Custom
                    </strong>

                    <span>
                      Above 50%
                    </span>
                  </button>

                </div>

                {paymentPercent ===
                  "custom" && (
                  <div
                    style={{
                      marginTop: "12px"
                    }}
                  >
                    <label className="job-form-field">
                      <span>
                        Custom Amount
                      </span>

                      <input
                        type="number"
                        min={
                          minimumCustomAmount
                        }
                        max={total}
                        step="1"
                        value={
                          customAmount
                        }
                        onChange={(
                          event
                        ) =>
                          setCustomAmount(
                            event.target
                              .value
                          )
                        }
                        placeholder={`Minimum ${formatNaira(
                          minimumCustomAmount
                        )}`}
                        disabled={
                          submitting
                        }
                      />
                    </label>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "6px"
                      }}
                    >
                      Enter an amount greater
                      than 50% of the order
                      total.
                    </small>
                  </div>
                )}

              </div>

            </div>
          </section>

          <section className="job-form-section job-summary-section">

            <div className="job-summary">

              <div className="job-summary-heading">

                <div>
                  <span>
                    ORDER TOTAL
                  </span>

                  <small>
                    Final amount based on
                    selected inventory
                  </small>
                </div>

                <strong>
                  {formatNaira(
                    total
                  )}
                </strong>

              </div>

              <div className="job-summary-row">
                <span>
                  Production items
                </span>

                <strong>
                  {formatNaira(
                    printTotal
                  )}
                </strong>
              </div>

              {designTotal > 0 && (
                <div className="job-summary-row">
                  <span>
                    IGC Design Service
                  </span>

                  <strong>
                    {formatNaira(
                      designTotal
                    )}
                  </strong>
                </div>
              )}

              <div className="job-summary-row">
                <span>
                  Amount paid
                </span>

                <strong>
                  {formatNaira(
                    amountPaid
                  )}
                </strong>
              </div>

              <div className="job-summary-row">
                <span>
                  Balance
                </span>

                <strong>
                  {formatNaira(
                    balance
                  )}
                </strong>
              </div>

              <div className="job-summary-total">
                <span>
                  Payment Status
                </span>

                <strong>
                  {amountPaid >= total
                    ? "PAID"
                    : amountPaid > 0
                    ? "PARTIAL"
                    : "UNPAID"}
                </strong>
              </div>

            </div>
          </section>

        </form>

        <div className="job-form-footer">

          {onCancel && (
            <button
              type="button"
              className="job-secondary-button"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            className="job-primary-button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              loading
            }
          >
            {submitting
              ? "Creating Job..."
              : "Create Job"}
          </button>

        </div>

      </div>
    </div>
  );
}