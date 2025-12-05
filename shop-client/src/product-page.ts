const API_BASE = 'http://localhost:3000';

type ProductCategory = 'men' | 'women' | 'accessories';
type AuthorGender = 'male' | 'female';

type ProductPropertyDto = {
  id: number;
  productId: number;
  propertyName: string;
  propertyValue: string;
  propertyPrice: string; // DECIMAL
};

type ProductImageDto = {
  id: number;
  productId: number;
  image: string;
  title: string;
};

type ProductReviewDto = {
  id: number;
  productId: number;
  authorName: string;
  authorFirstName?: string | null;
  authorLastName?: string | null;
  authorGender?: AuthorGender | null;
  rating: number;
  text: string;
};

type ProductDto = {
  id: number;
  name: string;
  alias: string; // "p1"
  shortDescription: string;
  description: string;
  price: string; // DECIMAL
  image: string;
  category: ProductCategory;
  properties?: ProductPropertyDto[];
  images?: ProductImageDto[];
};

type CurrentUser = {
  id: number;
  email: string;
  role?: string;
  roles?: string[];
};

// === те же ключи, что и в header/auth-скрипте ===
const ACCESS_KEY = 'sc_accessToken';
const USER_KEY = 'sc_user';

type AuthResponse = {
  user: CurrentUser;
  accessToken: string;
};

async function refreshToken(): Promise<AuthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // важна кука с refreshToken
    });

    if (!res.ok) {
      console.warn('[refreshToken] refresh вернул', res.status, res.statusText);
      return null;
    }

    const data = (await res.json()) as AuthResponse;

    // сохраняем новый accessToken и пользователя
    try {
      window.localStorage.setItem(ACCESS_KEY, data.accessToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch {
      // игнорируем ошибки localStorage
    }

    console.log('[refreshToken] новый accessToken получен');
    return data;
  } catch (e) {
    console.error('[refreshToken] ошибка запроса', e);
    return null;
  }
}

function getAccessToken(): string | null {
  try {
    const raw = window.localStorage.getItem(ACCESS_KEY);
    // фильтруем мусор
    if (!raw || raw === 'undefined' || raw === 'null') {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

function getStoredUser(): CurrentUser | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  // 1) сначала пробуем взять из localStorage (синхронно и дёшево)
  const stored = getStoredUser();
  if (stored) {
    return stored;
  }

  // 2) если в localStorage нет — пробуем по accessToken сходить на /auth/profile
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const user = (await res.json()) as CurrentUser;

    // на будущее сохраним, чтобы другие страницы тоже могли достать
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // игнорируем ошибки localStorage
    }

    return user;
  } catch {
    return null;
  }
}

async function fetchProducts(): Promise<ProductDto[]> {
  const res = await fetch(`${API_BASE}/products`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(
      `Не удалось загрузить товары: ${res.status} ${res.statusText}`,
    );
  }

  return res.json() as Promise<ProductDto[]>;
}

async function fetchReviews(productId: number): Promise<ProductReviewDto[]> {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(
      `Не удалось загрузить отзывы: ${res.status} ${res.statusText}`,
    );
  }

  return res.json() as Promise<ProductReviewDto[]>;
}

type CreateReviewPayload = {
  authorName: string;
  rating: number;
  text: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorGender?: AuthorGender;
};

async function createReview(
  productId: number,
  payload: CreateReviewPayload,
): Promise<ProductReviewDto> {
  const doRequest = async (): Promise<Response> => {
    const token = getAccessToken();
    console.log('[createReview] accessToken из localStorage =', token);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  };

  // первая попытка
  let res = await doRequest();

  // если токен истёк / 401 — пробуем refresh и повторить один раз
  if (res.status === 401) {
    const body = await res.text().catch(() => '');
    console.warn('[createReview] 401, пробуем refresh. Ответ:', body);

    const refreshed = await refreshToken();
    if (refreshed) {
      // после refresh в localStorage уже новый accessToken
      res = await doRequest();
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(
      '[createReview] Ошибка ответа:',
      res.status,
      res.statusText,
      text,
    );
    throw new Error(
      `Не удалось сохранить отзыв: ${res.status} ${res.statusText}`,
    );
  }

  return (await res.json()) as ProductReviewDto;
}


async function deleteReview(
  productId: number,
  reviewId: number,
): Promise<void> {
  const token = getAccessToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(
    `${API_BASE}/products/${productId}/reviews/${reviewId}`,
    {
      method: 'DELETE',
      headers,
      credentials: 'include',
    },
  );

  if (!res.ok) {
    throw new Error(
      `Не удалось удалить отзыв: ${res.status} ${res.statusText}`,
    );
  }
}

function renderProduct(product: ProductDto): void {
  const titleEl = document.getElementById('product-title');
  const imgEl = document.getElementById(
    'product-image',
  ) as HTMLImageElement | null;
  const subtitleEl = document.getElementById('product-subtitle');
  const descEl = document.getElementById('product-desc');
  const priceEl = document.getElementById('product-price');
  const specsUl = document.getElementById('product-specs');

  if (titleEl) titleEl.textContent = product.name;
  document.title = `Сити Класс — ${product.name}`;

  if (imgEl) {
    const mainImagePath =
      product.images && product.images.length > 0
        ? product.images[0].image
        : product.image;

    imgEl.src = `${API_BASE}/${mainImagePath}`;
    imgEl.alt = product.name;
  }

  if (subtitleEl) {
    subtitleEl.textContent = product.shortDescription ?? '';
  }

  if (descEl) {
    descEl.textContent = product.description ?? '';
  }

  if (priceEl) {
    const priceNumber = Number(product.price);
    const formattedPrice = Number.isFinite(priceNumber)
      ? priceNumber.toLocaleString('ru-RU')
      : product.price;

    priceEl.innerHTML = `<b>Цена:</b> ${formattedPrice} ₽`;
  }

  if (specsUl) {
    const specs = product.properties ?? [];
    if (!specs.length) {
      specsUl.innerHTML = '<li>Характеристики уточняются</li>';
    } else {
      specsUl.innerHTML = '';
      for (const prop of specs) {
        const li = document.createElement('li');
        li.textContent = `${prop.propertyName}: ${prop.propertyValue}`;
        specsUl.appendChild(li);
      }
    }
  }
}

function renderReviews(
  container: HTMLElement,
  reviews: ProductReviewDto[],
  isAdmin: boolean,
  productId: number,
): void {
  container.innerHTML = '';

  if (!reviews.length) {
    const p = document.createElement('p');
    p.textContent = 'Пока нет отзывов. Вы можете быть первым.';
    container.appendChild(p);
    return;
  }

  for (const review of reviews) {
    const card = document.createElement('div');
    card.className = 'review-card';

    const meta = document.createElement('div');
    meta.className = 'review-meta';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'review-author';
    authorSpan.textContent = review.authorName;

    const ratingSpan = document.createElement('span');
    ratingSpan.className = 'review-rating';
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    ratingSpan.textContent = stars;

    meta.appendChild(authorSpan);
    meta.appendChild(ratingSpan);

    const textP = document.createElement('p');
    textP.className = 'review-text';
    textP.textContent = review.text;

    card.appendChild(meta);
    card.appendChild(textP);

    if (isAdmin) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-delete-review';
      btn.textContent = 'Удалить';

      btn.addEventListener('click', async () => {
        const ok = confirm('Удалить этот отзыв?');
        if (!ok) return;

        try {
          await deleteReview(productId, review.id);
          card.remove();
        } catch (err) {
          console.error(err);
          alert('Не удалось удалить отзыв');
        }
      });

      card.appendChild(btn);
    }

    container.appendChild(card);
  }
}

function renderReviewForm(
  wrapper: HTMLElement,
  productId: number,
  currentUser: CurrentUser | null,
  onCreated: (review: ProductReviewDto) => void,
): void {
  if (!currentUser) {
    wrapper.innerHTML =
      '<p>Только зарегистрированные пользователи могут оставлять отзывы. Пожалуйста, войдите в систему.</p>';
    return;
  }

  wrapper.innerHTML = `
    <h4>Оставить отзыв</h4>
    <form id="review-form">
      <div class="form-row">
        <label for="review-author">Ваше имя</label>
        <input id="review-author" name="authorName" class="contacts-input" required>
      </div>

      <div class="form-row">
        <label for="review-rating">Оценка (1–5)</label>
        <select id="review-rating" name="rating" class="contacts-input" required>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </div>

      <div class="form-row">
        <label for="review-text">Отзыв</label>
        <textarea id="review-text" name="text" class="contacts-input" rows="4" required></textarea>
      </div>

      <button type="submit" class="contacts-button">Отправить отзыв</button>
    </form>
  `;

  const form = wrapper.querySelector<HTMLFormElement>('#review-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const authorName = String(formData.get('authorName') ?? '').trim();
    const rating = Number(formData.get('rating') ?? 5);
    const text = String(formData.get('text') ?? '').trim();

    if (!authorName || !text) {
      alert('Пожалуйста, заполните имя и текст отзыва');
      return;
    }

    try {
      const review = await createReview(productId, {
        authorName,
        rating,
        text,
      });

      onCreated(review);
      form.reset();
    } catch (err) {
      console.error(err);
      alert('Не удалось отправить отзыв. Возможно, вы не авторизованы.');
    }
  });
}

async function initProductPage(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const alias = params.get('id'); // "p1", "p2", ...

  if (!alias) {
    const titleEl = document.getElementById('product-title');
    if (titleEl) titleEl.textContent = 'Товар не найден';
    return;
  }

  const [currentUser, products] = await Promise.all([
    fetchCurrentUser(),
    fetchProducts(),
  ]);

  const product = products.find((p) => p.alias === alias);

  if (!product) {
    const titleEl = document.getElementById('product-title');
    if (titleEl) titleEl.textContent = 'Товар не найден';
    return;
  }

  renderProduct(product);

  const reviewsContainer = document.getElementById('reviews-list');
  const formWrapper = document.getElementById('reviews-form-wrapper');

  if (!reviewsContainer || !formWrapper) {
    return;
  }

  const isAdmin =
    !!currentUser &&
    (currentUser.role === 'admin' ||
      (Array.isArray(currentUser.roles) &&
        currentUser.roles.includes('admin')));

  let reviews = await fetchReviews(product.id);
  renderReviews(reviewsContainer, reviews, isAdmin, product.id);

  renderReviewForm(formWrapper, product.id, currentUser, (newReview) => {
    reviews = [newReview, ...reviews];
    renderReviews(reviewsContainer, reviews, isAdmin, product.id);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  void initProductPage();
});
