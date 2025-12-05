// src/admin-page.ts
const API_BASE = 'http://localhost:3000';

type ProductCategory = 'men' | 'women' | 'accessories';

type AdminProductDto = {
  id: number;
  name: string;
  alias: string;
  shortDescription: string;
  description: string;
  price: string;
  image: string;
  category: ProductCategory | null;
};

type UserPayload = {
  id: number;
  email: string;
  role: 'admin' | 'user';
};

type AuthResponse = {
  user: UserPayload;
  accessToken: string;
};

const ACCESS_KEY = 'sc_accessToken';
const USER_KEY = 'sc_user';

function getAccessToken(): string | null {
  const raw = window.localStorage.getItem(ACCESS_KEY);
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  return raw;
}

function getStoredUser(): UserPayload | null {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserPayload;
  } catch {
    return null;
  }
}

async function apiRefreshAdmin(): Promise<AuthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = (await res.json()) as AuthResponse;
    window.localStorage.setItem(ACCESS_KEY, data.accessToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  } catch {
    return null;
  }
}

async function ensureAdmin(): Promise<UserPayload | null> {
  let user = getStoredUser();

  if (!user) {
    const refreshed = await apiRefreshAdmin();
    user = refreshed?.user ?? null;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return user;
}

async function authorizedRequest(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const make = async (): Promise<Response> => {
    const token = getAccessToken();
    const headers = new Headers(init.headers ?? {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(input, {
      ...init,
      headers,
      credentials: 'include',
    });
  };

  let res = await make();
  if (res.status === 401) {
    await apiRefreshAdmin();
    res = await make();
  }
  return res;
}

async function loadProducts(): Promise<AdminProductDto[]> {
  const res = await fetch(`${API_BASE}/products`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Не удалось загрузить товары: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<AdminProductDto[]>;
}

type CreateProductPayload = {
  manufacturerId: number;
  name: string;
  alias: string;
  shortDescription: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
};

async function createProduct(payload: CreateProductPayload): Promise<AdminProductDto> {
  const body = {
    ...payload,
    // meta поля берём из названия/краткого описания
    metaTitle: payload.name,
    metaDescription: payload.shortDescription,
    metaKeywords: payload.name,
  };

  const res = await authorizedRequest(`${API_BASE}/products`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[admin] createProduct error', res.status, res.statusText, text);
    throw new Error(`Не удалось создать товар: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<AdminProductDto>;
}

async function deleteProduct(id: number): Promise<void> {
  const res = await authorizedRequest(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[admin] deleteProduct error', res.status, res.statusText, text);
    throw new Error(`Не удалось удалить товар: ${res.status} ${res.statusText}`);
  }
}

function renderProductsTable(
  container: HTMLElement,
  products: AdminProductDto[],
  onDelete: (id: number) => void,
): void {
  container.innerHTML = '';

  if (!products.length) {
    container.textContent = 'Товаров пока нет.';
    return;
  }

  const table = document.createElement('table');
  table.className = 'demo-table';
  table.style.width = '100%';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <td>ID</td>
      <td>Название</td>
      <td>Категория</td>
      <td>Цена</td>
      <td></td>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  for (const p of products) {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.textContent = String(p.id);

    const tdName = document.createElement('td');
    tdName.textContent = p.name;

    const tdCat = document.createElement('td');
    tdCat.textContent = p.category ?? '';

    const tdPrice = document.createElement('td');
    const priceNum = Number(p.price);
    tdPrice.textContent = Number.isFinite(priceNum)
      ? priceNum.toLocaleString('ru-RU') + ' ₽'
      : p.price;

    const tdActions = document.createElement('td');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'contacts-button';
    btn.textContent = 'Удалить';
    btn.addEventListener('click', () => onDelete(p.id));

    tdActions.appendChild(btn);

    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdCat);
    tr.appendChild(tdPrice);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);
}

function renderProductForm(
  container: HTMLElement,
  onCreate: (payload: CreateProductPayload) => Promise<void>,
): void {
  container.innerHTML = `
    <form id="admin-product-form-inner">
      <div class="form-row">
        <label>Производитель (ID)</label>
        <input name="manufacturerId" type="number" class="contacts-input" value="1" required>
      </div>

      <div class="form-row">
        <label>Название</label>
        <input name="name" type="text" class="contacts-input" required>
      </div>

      <div class="form-row">
        <label>Alias (например "p10")</label>
        <input name="alias" type="text" class="contacts-input" required>
      </div>

      <div class="form-row">
        <label>Краткое описание</label>
        <input name="shortDescription" type="text" class="contacts-input" required>
      </div>

      <div class="form-row">
        <label>Полное описание</label>
        <textarea name="description" class="contacts-input" rows="4" required></textarea>
      </div>

      <div class="form-row">
        <label>Цена</label>
        <input name="price" type="number" step="0.01" class="contacts-input" required>
      </div>

      <div class="form-row">
        <label>Главная картинка (путь)</label>
        <input name="image" type="text" class="contacts-input" placeholder="products/product-1.png" required>
      </div>

      <div class="form-row">
        <label>Категория</label>
        <select name="category" class="contacts-input" required>
          <option value="men">men</option>
          <option value="women">women</option>
          <option value="accessories">accessories</option>
        </select>
      </div>

      <button type="submit" class="contacts-button">Создать товар</button>
    </form>
  `;

  const form = container.querySelector<HTMLFormElement>('#admin-product-form-inner');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fd = new FormData(form);

    const manufacturerId = Number(fd.get('manufacturerId') ?? 0);
    const name = String(fd.get('name') ?? '').trim();
    const alias = String(fd.get('alias') ?? '').trim();
    const shortDescription = String(fd.get('shortDescription') ?? '').trim();
    const description = String(fd.get('description') ?? '').trim();
    const price = Number(fd.get('price') ?? 0);
    const image = String(fd.get('image') ?? '').trim();
    const category = String(fd.get('category') ?? '') as ProductCategory;

    if (!name || !alias || !shortDescription || !description || !image || !category) {
      alert('Заполните все поля формы');
      return;
    }

    try {
      await onCreate({
        manufacturerId,
        name,
        alias,
        shortDescription,
        description,
        price,
        image,
        category,
      });
      form.reset();
    } catch (e) {
      console.error(e);
      alert('Не удалось создать товар');
    }
  });
}

async function initAdminPage(): Promise<void> {
  const warningEl = document.getElementById('admin-warning');
  const productsContainer = document.getElementById('admin-products');
  const formContainer = document.getElementById('admin-product-form');

  if (!productsContainer || !formContainer) return;

  const user = await ensureAdmin();

  if (!user) {
    if (warningEl) {
      warningEl.textContent =
        'Доступ к этой странице есть только у администратора. Пожалуйста, войдите под учётной записью администратора.';
    }
    return;
  }

  if (warningEl) {
    warningEl.textContent = `Вы вошли как администратор: ${user.email}`;
  }

  let products = await loadProducts();

  const handleDelete = async (id: number) => {
    const ok = confirm('Удалить этот товар?');
    if (!ok) return;

    try {
      await deleteProduct(id);
      products = products.filter((p) => p.id !== id);
      renderProductsTable(productsContainer, products, handleDelete);
    } catch (e) {
      console.error(e);
      alert('Не удалось удалить товар');
    }
  };

  renderProductsTable(productsContainer, products, handleDelete);

  renderProductForm(formContainer, async (payload) => {
    try {
      const created = await createProduct(payload);
      products = [...products, created];
      renderProductsTable(productsContainer, products, handleDelete);
    } catch (e) {
      console.error(e);
      alert('Не удалось создать товар');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  void initAdminPage();
});
