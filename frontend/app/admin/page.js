"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Tags,
  Package,
  ShoppingBag,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Star,
  RefreshCw,
  Save,
  X,
  Upload,
} from "lucide-react";
import api from "../../services/api";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const emptyProduct = {
  name: "",
  slug: "",
  category: "",
  description: "",
  images: [],
  mrp: "",
  price: "",
  stock: "0",
  sku: "",
  isAvailable: true,
  isRecentlyAdded: false,
  isPinned: false,
};

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  image: "",
};

async function imageToDataUrl(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 12 MB.");
  }

  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Invalid image file."));
    element.src = source;
  });

  const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0, canvas.width, canvas.height);

  const result = canvas.toDataURL("image/jpeg", 0.76);

  if (result.length > 1_800_000) {
    throw new Error("Image is still too large. Choose a smaller image.");
  }

  return result;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [productForm, setProductForm] = useState(null);
  const [categoryForm, setCategoryForm] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("All");

  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const loadAll = useCallback(async () => {
    setBusy(true);

    try {
      const [dashboard, productResult, categoryResult, orderResult, hero] =
        await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/products"),
          api.get("/admin/categories"),
          api.get("/admin/orders"),
          api.get("/admin/settings"),
        ]);

      setStats(dashboard.data.stats || {});
      setProducts(productResult.data.products || []);
      setCategories(categoryResult.data.categories || []);
      setOrders(orderResult.data.orders || []);
      setSettings(hero.data.settings || {});
    } catch (error) {
      if (error.response?.status === 401 ||
          error.response?.status === 403) {
        localStorage.removeItem("token");
        setAuthenticated(false);
      }

      notify(error.response?.data?.message || "Could not load data.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      // Validate the stored token against an admin-only endpoint.
      api.get("/admin/dashboard")
        .then(() => setAuthenticated(true))
        .catch(() => {
          localStorage.removeItem("token");
          setAuthenticated(false);
        });
    }
  }, []);

  useEffect(() => {
    if (authenticated) loadAll();
  }, [authenticated, loadAll]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginBusy(true);

    try {
      const result = await api.post("/admin/login", {
        accessKey,
        username,
        password,
      });

      localStorage.setItem("token", result.data.token);
      setAuthenticated(true);
      setPassword("");
      setAccessKey("");
      notify("Welcome to your store dashboard!");
    } catch (error) {
      notify(error.response?.data?.message || "Login failed.");
    } finally {
      setLoginBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthenticated(false);
    setTab("dashboard");
  }

  async function uploadImage(file, callback) {
    try {
      const image = await imageToDataUrl(file);
      callback(image);
    } catch (error) {
      notify(error.message || "Image upload failed.");
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setBusy(true);

    try {
      const result = await api.put("/admin/settings", settings);
      setSettings(result.data.settings);
      notify("Homepage saved successfully.");
    } catch (error) {
      notify(error.response?.data?.message || "Could not save homepage.");
    } finally {
      setBusy(false);
    }
  }

  function editProduct(product) {
    setProductForm({
      ...emptyProduct,
      ...product,
      category: product.category?._id || product.category || "",
      images: Array.isArray(product.images) ? product.images : [],
      mrp: String(product.mrp ?? ""),
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
    });
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (!productForm.category) {
      notify("Please choose a category.");
      return;
    }

    const payload = {
      ...productForm,
      slug: (productForm.slug || productForm.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      mrp: Number(productForm.mrp),
      price: Number(productForm.price),
      stock: Number(productForm.stock || 0),
      images: productForm.images.filter(Boolean),
    };

    if (!payload.name.trim() || !payload.slug) {
      notify("Enter a product name.");
      return;
    }

    if (!Number.isFinite(payload.price) ||
        !Number.isFinite(payload.mrp) ||
        payload.price < 0 ||
        payload.mrp < payload.price) {
      notify("Check the selling price and MRP.");
      return;
    }

    setBusy(true);

    try {
      if (productForm._id) {
        await api.patch(`/products/${productForm._id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      setProductForm(null);
      await loadAll();
      notify("Product saved successfully.");
    } catch (error) {
      notify(error.response?.data?.message || "Could not save product.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePinned(product) {
    try {
      await api.patch(`/products/${product._id}`, {
        isPinned: !product.isPinned,
      });
      await loadAll();
      notify(product.isPinned ? "Product unpinned." : "Product pinned.");
    } catch (error) {
      notify(error.response?.data?.message || "Could not update product.");
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(
      `Remove "${product.name}" from the active store?`
    )) return;

    try {
      await api.delete(`/products/${product._id}`);
      await loadAll();
      notify("Product removed from the active store.");
    } catch (error) {
      notify(error.response?.data?.message || "Could not remove product.");
    }
  }

  async function saveCategory(event) {
    event.preventDefault();

    const payload = {
      ...categoryForm,
      slug: (categoryForm.slug || categoryForm.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    };

    if (!payload.name.trim() || !payload.slug) {
      notify("Enter a category name.");
      return;
    }

    setBusy(true);

    try {
      if (categoryForm._id) {
        await api.put(`/categories/${categoryForm._id}`, payload);
      } else {
        await api.post("/categories", payload);
      }

      setCategoryForm(null);
      await loadAll();
      notify("Category saved.");
    } catch (error) {
      notify(error.response?.data?.message || "Could not save category.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCategory(category) {
    if (!window.confirm(
      `Hide category "${category.name}" from the storefront?`
    )) return;

    try {
      await api.delete(`/categories/${category._id}`);
      await loadAll();
      notify("Category hidden.");
    } catch (error) {
      notify(error.response?.data?.message || "Could not hide category.");
    }
  }

  async function updateOrder(order, status) {
    try {
      await api.patch(`/admin/orders/${order._id}`, { status });
      await loadAll();
      notify(`Order updated to ${status}.`);
    } catch (error) {
      notify(error.response?.data?.message || "Could not update order.");
    }
  }

  const nav = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "homepage", label: "Homepage", icon: ImageIcon },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#70765F]";

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#70765F] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5F654F] disabled:opacity-50";

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F2] px-5 py-10">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9"
        >
          <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#70765F] text-xl font-semibold text-white">
            M
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#70765F]">
            Magotra Bartan Store
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Store admin
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Sign in to manage your products, collections and orders.
          </p>

          <label className="mt-7 block text-sm font-medium">
            Access key
            <input
              className={`${inputClass} mt-2`}
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              type="password"
              autoComplete="off"
              required
              placeholder="Enter access key"
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            Username
            <input
              className={`${inputClass} mt-2`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              className={`${inputClass} mt-2`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter password"
            />
          </label>

          <button
            className={`${buttonClass} mt-6 w-full py-3.5`}
            disabled={loginBusy}
          >
            {loginBusy ? "Signing in..." : "Open dashboard"}
          </button>

          {notice && (
            <p role="status" className="mt-4 text-sm text-red-600">
              {notice}
            </p>
          )}

          <p className="mt-6 text-center text-xs text-stone-400">
            Store management · Private admin access
          </p>
        </form>
      </main>
    );
  }

  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.sku || ""}`
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  );

  const visibleOrders = orders.filter((order) =>
    orderFilter === "All" ? true : order.status === orderFilter
  );

  function orderCustomer(order) {
    const p = order.payload || {};
    const customer = p.customer || p.shippingAddress || p.address || {};
    return typeof customer === "string"
      ? customer
      : customer.name || p.customerName || p.name || "Customer";
  }

  function orderTotal(order) {
    const p = order.payload || {};
    return p.total ?? p.cartTotal ?? p.grandTotal ?? 0;
  }

  function orderItems(order) {
    const p = order.payload || {};
    return p.items || p.cartItems || p.products || [];
  }

  return (
    <main className="min-h-screen bg-[#F7F7F2] text-stone-900">
      {notice && (
        <div
          role="status"
          className="fixed right-4 top-4 z-50 max-w-sm rounded-xl bg-stone-900 px-4 py-3 text-sm text-white shadow-xl"
        >
          {notice}
        </div>
      )}

      <div className="mx-auto max-w-7xl md:flex">
        <aside className="border-b border-stone-200 bg-white p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-5">
          <div className="flex items-center justify-between md:block">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#70765F]">
                Magotra Bartan Store
              </p>
              <h2 className="mt-1 text-lg font-semibold">Admin panel</h2>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 md:hidden"
            >
              <LogOut size={16} /> Exit
            </button>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 md:flex-col">
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setProductForm(null);
                  setCategoryForm(null);
                }}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                  tab === id
                    ? "bg-[#70765F] text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon size={18} />
                {label}
                {id === "orders" && stats.pendingOrders > 0 && (
                  <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={loadAll}
            className="mt-5 hidden w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50 md:flex"
          >
            <RefreshCw size={15} /> Refresh data
          </button>

          <button
            onClick={logout}
            className="mt-2 hidden w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-500 hover:bg-stone-100 md:flex"
          >
            <LogOut size={16} /> Sign out
          </button>
        </aside>

        <section className="min-w-0 flex-1 p-4 sm:p-7 lg:p-9">
          <header className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                Store management
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {nav.find((item) => item.id === tab)?.label}
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                {tab === "dashboard" && "Everything your store needs, in one place."}
                {tab === "homepage" && "Change the main image and welcome message."}
                {tab === "categories" && "Organise products into collections."}
                {tab === "products" && "Add products, update prices and pin favourites."}
                {tab === "orders" && "Review orders and update their status."}
              </p>
            </div>
            <button
              onClick={loadAll}
              title="Refresh"
              className="rounded-xl border border-stone-200 bg-white p-3 hover:bg-stone-50"
            >
              <RefreshCw size={17} className={busy ? "animate-spin" : ""} />
            </button>
          </header>

          {tab === "dashboard" && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ["Active products", stats.activeProducts ?? 0],
                  ["Categories", stats.categories ?? 0],
                  ["Pending orders", stats.pendingOrders ?? 0],
                  ["All orders", stats.totalOrders ?? 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                    <p className="text-sm text-stone-500">{label}</p>
                    <p className="mt-3 text-3xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
                <h2 className="text-lg font-semibold">Quick actions</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Add a product", "products", "Create a new product listing."],
                    ["Edit homepage", "homepage", "Update the main store image."],
                    ["Manage categories", "categories", "Create or update collections."],
                    ["Review orders", "orders", "Accept pending customer orders."],
                  ].map(([title, target, description]) => (
                    <button
                      key={target}
                      onClick={() => setTab(target)}
                      className="rounded-xl border border-stone-200 p-4 text-left hover:border-[#70765F] hover:bg-[#FAFAF6]"
                    >
                      <p className="font-medium">{title} →</p>
                      <p className="mt-1 text-sm text-stone-500">{description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "homepage" && (
            <form onSubmit={saveSettings} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
              <div>
                <h2 className="font-semibold">Homepage welcome section</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Changes appear on the main storefront after saving.
                </p>
              </div>

              <label className="block text-sm font-medium">
                Main heading
                <textarea
                  className={`${inputClass} mt-2`}
                  rows={2}
                  maxLength={180}
                  value={settings.heroTitle || ""}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                />
              </label>

              <label className="block text-sm font-medium">
                Description
                <textarea
                  className={`${inputClass} mt-2`}
                  rows={4}
                  maxLength={1000}
                  value={settings.heroDescription || ""}
                  onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                />
              </label>

              <div>
                <label className="block text-sm font-medium">Hero image</label>
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 p-5 text-sm text-stone-600 hover:bg-stone-50">
                  <Upload size={18} /> Choose image from your device
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, (image) => setSettings({ ...settings, heroImage: image }));
                      e.target.value = "";
                    }}
                  />
                </label>

                {settings.heroImage && (
                  <div className="mt-3">
                    <img src={settings.heroImage} alt="Homepage preview" className="max-h-72 w-full rounded-xl border border-stone-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, heroImage: "" })}
                      className="mt-2 text-sm text-red-600"
                    >
                      Remove image
                    </button>
                  </div>
                )}

                <label className="mt-4 block text-sm font-medium">
                  Or paste an image URL
                  <input
                    className={`${inputClass} mt-2`}
                    value={settings.heroImage?.startsWith("data:") ? "" : settings.heroImage || ""}
                    placeholder="https://example.com/banner.jpg"
                    onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  First button text
                  <input className={`${inputClass} mt-2`} value={settings.primaryButton || ""} onChange={(e) => setSettings({ ...settings, primaryButton: e.target.value })} />
                </label>
                <label className="block text-sm font-medium">
                  Second button text
                  <input className={`${inputClass} mt-2`} value={settings.secondaryButton || ""} onChange={(e) => setSettings({ ...settings, secondaryButton: e.target.value })} />
                </label>
              </div>

              <button className={buttonClass} disabled={busy}>
                <Save size={16} /> Save homepage
              </button>
            </form>
          )}

          {tab === "categories" && (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-stone-500">{categories.filter((c) => c.isActive).length} active categories</p>
                <button className={buttonClass} onClick={() => setCategoryForm({ ...emptyCategory })}>
                  <Plus size={17} /> Add category
                </button>
              </div>

              {categoryForm && (
                <form onSubmit={saveCategory} className="mb-5 space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{categoryForm._id ? "Edit category" : "New category"}</h2>
                    <button type="button" onClick={() => setCategoryForm(null)}><X size={18} /></button>
                  </div>
                  <label className="block text-sm font-medium">
                    Category name
                    <input className={`${inputClass} mt-2`} required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: categoryForm._id ? categoryForm.slug : e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} />
                  </label>
                  <label className="block text-sm font-medium">
                    Image URL (optional)
                    <input className={`${inputClass} mt-2`} value={categoryForm.image || ""} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} placeholder="https://example.com/category.jpg" />
                  </label>
                  <label className="block text-sm font-medium">
                    Description
                    <textarea className={`${inputClass} mt-2`} rows={2} value={categoryForm.description || ""} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                  </label>
                  <button className={buttonClass} disabled={busy}><Save size={16} /> Save category</button>
                </form>
              )}

              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                    {category.image ? (
                      <img src={category.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100"><Tags size={20} /></div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{category.name}</p>
                      <p className="text-xs text-stone-500">{category.slug}</p>
                      {!category.isActive && <p className="text-xs text-amber-700">Hidden</p>}
                    </div>
                    <button title="Edit" onClick={() => setCategoryForm({ ...emptyCategory, ...category })} className="rounded-lg p-2 hover:bg-stone-100"><Pencil size={17} /></button>
                    {category.isActive && (
                      <button title="Hide category" onClick={() => deleteCategory(category)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "products" && (
            <>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <input className={`${inputClass} min-w-0 flex-1`} placeholder="Search product name or SKU..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                <button className={buttonClass} onClick={() => setProductForm({ ...emptyProduct })}>
                  <Plus size={17} /> Add product
                </button>
              </div>

              {productForm && (
                <form onSubmit={saveProduct} className="mb-6 space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{productForm._id ? "Edit product" : "Add a product"}</h2>
                    <button type="button" onClick={() => setProductForm(null)}><X size={19} /></button>
                  </div>

                  <label className="block text-sm font-medium">
                    Product name
                    <input className={`${inputClass} mt-2`} required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value, slug: productForm._id ? productForm.slug : e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} />
                  </label>

                  <label className="block text-sm font-medium">
                    Category
                    <select className={`${inputClass} mt-2`} required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                      <option value="">Choose a category</option>
                      {categories.filter((c) => c.isActive).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-sm font-medium">
                      Selling price (₹)
                      <input className={`${inputClass} mt-2`} type="number" min="0" step="0.01" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                    </label>
                    <label className="block text-sm font-medium">
                      MRP (₹)
                      <input className={`${inputClass} mt-2`} type="number" min="0" step="0.01" required value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })} />
                    </label>
                    <label className="block text-sm font-medium">
                      Stock quantity
                      <input className={`${inputClass} mt-2`} type="number" min="0" step="1" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                    </label>
                    <label className="block text-sm font-medium">
                      SKU (optional)
                      <input className={`${inputClass} mt-2`} value={productForm.sku || ""} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
                    </label>
                  </div>

                  <label className="block text-sm font-medium">
                    Description
                    <textarea className={`${inputClass} mt-2`} rows={3} value={productForm.description || ""} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  </label>

                  <div>
                    <label className="block text-sm font-medium">Product image</label>
                    <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 p-4 text-sm hover:bg-stone-50">
                      <Upload size={17} /> Choose image from your device
                      <input className="hidden" type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, (image) => setProductForm((old) => ({ ...old, images: [image, ...(old.images || []).filter((x) => !x.startsWith("data:"))] })));
                        e.target.value = "";
                      }} />
                    </label>
                    <label className="mt-3 block text-sm font-medium">
                      Or paste an image URL
                      <input className={`${inputClass} mt-2`} placeholder="https://example.com/product.jpg" value={(productForm.images || []).find((x) => !x.startsWith("data:")) || ""} onChange={(e) => setProductForm({ ...productForm, images: [e.target.value, ...(productForm.images || []).filter((x) => x.startsWith("data:"))] })} />
                    </label>
                    {(productForm.images || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {productForm.images.map((src, i) => (
                          <div key={`${i}-${src.slice(0, 20)}`} className="relative">
                            <img src={src} alt="Product preview" className="h-24 w-24 rounded-xl border border-stone-200 object-cover" />
                            <button type="button" onClick={() => setProductForm({ ...productForm, images: productForm.images.filter((_, index) => index !== i) })} className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow"><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-5">
                    {[
                      ["isAvailable", "Available for sale"],
                      ["isPinned", "Pin to homepage"],
                      ["isRecentlyAdded", "Show as recently added"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={Boolean(productForm[key])} onChange={(e) => setProductForm({ ...productForm, [key]: e.target.checked })} />
                        {label}
                      </label>
                    ))}
                  </div>

                  <button className={buttonClass} disabled={busy}><Save size={16} /> Save product</button>
                </form>
              )}

              <div className="space-y-3">
                {visibleProducts.map((product) => (
                  <div key={product._id} className={`flex gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:items-center sm:p-4 ${!product.isAvailable ? "opacity-60" : ""}`}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-stone-100"><Package size={24} /></div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-medium">{product.name}</p>
                      <p className="mt-1 text-xs text-stone-500">{product.category?.name || "No category"} · Stock: {product.stock ?? 0}</p>
                      <p className="mt-1 font-semibold">{money(product.price)}</p>
                      {!product.isAvailable && <span className="text-xs text-red-600">Hidden / deleted</span>}
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row">
                      <button title={product.isPinned ? "Unpin product" : "Pin product"} onClick={() => togglePinned(product)} className={`rounded-lg p-2 ${product.isPinned ? "text-amber-600" : "text-stone-500"} hover:bg-stone-100`}><Star size={18} fill={product.isPinned ? "currentColor" : "none"} /></button>
                      <button title="Edit product" onClick={() => editProduct(product)} className="rounded-lg p-2 hover:bg-stone-100"><Pencil size={18} /></button>
                      {product.isAvailable && <button title="Remove product" onClick={() => deleteProduct(product)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={18} /></button>}
                    </div>
                  </div>
                ))}
                {visibleProducts.length === 0 && <p className="rounded-xl bg-white p-8 text-center text-sm text-stone-500">No products found.</p>}
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              <div className="mb-5 flex flex-wrap gap-2">
                {["All", "Pending", "Accepted", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                  <button key={status} onClick={() => setOrderFilter(status)} className={`rounded-full px-4 py-2 text-sm ${orderFilter === status ? "bg-[#70765F] text-white" : "border border-stone-200 bg-white text-stone-600"}`}>
                    {status}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {visibleOrders.map((order) => {
                  const payload = order.payload || {};
                  const items = orderItems(order);
                  const address = payload.shippingAddress || payload.address || payload.customer || {};
                  const addressText = typeof address === "string"
                    ? address
                    : [address.address, address.city, address.state, address.pincode, address.postalCode].filter(Boolean).join(", ");
                  const nextStatuses = {
                    Pending: ["Accepted", "Cancelled"],
                    Accepted: ["Processing", "Cancelled"],
                    Processing: ["Shipped", "Cancelled"],
                    Shipped: ["Delivered"],
                    Delivered: [],
                    Cancelled: ["Pending"],
                  };

                  return (
                    <article key={order._id} className="rounded-2xl border border-stone-200 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{order.orderId}</p>
                          <p className="mt-1 text-sm text-stone-500">{orderCustomer(order)}</p>
                          <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{money(orderTotal(order))}</p>
                          <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${order.status === "Pending" ? "bg-amber-100 text-amber-800" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-800"}`}>{order.status}</span>
                        </div>
                      </div>

                      {addressText && <p className="mt-3 text-sm text-stone-500">Delivery: {addressText}</p>}

                      <div className="mt-4 border-t border-stone-100 pt-3">
                        <p className="text-sm font-medium">Items</p>
                        {Array.isArray(items) && items.length > 0 ? (
                          <ul className="mt-2 space-y-1 text-sm text-stone-600">
                            {items.map((item, i) => (
                              <li key={item._id || item.id || i}>
                                {item.name || item.product?.name || item.title || "Product"} × {item.quantity || item.qty || 1}
                              </li>
                            ))}
                          </ul>
                        ) : <p className="mt-1 text-sm text-stone-500">Item details were not included in this order.</p>}
                      </div>

                      {nextStatuses[order.status]?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {nextStatuses[order.status].map((status) => (
                            <button key={status} onClick={() => updateOrder(order, status)} className={status === "Cancelled" ? "rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50" : buttonClass}>
                              {status === "Accepted" ? "Accept order" : status}
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
                {visibleOrders.length === 0 && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
                    <ShoppingBag className="mx-auto text-stone-300" size={32} />
                    <p className="mt-3 font-medium">No orders here yet</p>
                    <p className="mt-1 text-sm text-stone-500">Orders placed after checkout is connected will appear here.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
