// src/catalog-page.ts

const API_BASE = 'http://localhost:3000';

type ProductCategory = 'men' | 'women' | 'accessories';

type ProductImageDto = {
  id: number;
  productId: number;
  image: string;  // "products/product-1.png"
  title: string;
};

type ProductDto = {
  id: number;
  name: string;
  alias: string;            // "p1", "p2", ...
  shortDescription: string;
  description: string;
  price: string;            // DECIMAL приходит строкой
  image: string;            // "products/product-1.png"
  category: ProductCategory;
  images?: ProductImageDto[];
};

async function fetchProducts(): Promise<ProductDto[]> {
  const url = `${API_BASE}/products`;
  console.log('[catalog] fetchProducts: старт, URL =', url);

  let res: Response;
  try {
    res = await fetch(url, {
      credentials: 'include',
    });
  } catch (err) {
    console.error('[catalog] fetchProducts: сетевой error при fetch()', err);
    throw err;
  }

  console.log(
    '[catalog] fetchProducts: ответ получен, status =',
    res.status,
    res.statusText,
  );

  if (!res.ok) {
    // поподробнее залогируем тело
    let bodyText: string | null = null;
    try {
      bodyText = await res.text();
    } catch (e) {
      console.error(
        '[catalog] fetchProducts: не удалось прочитать тело ответа',
        e,
      );
    }
    console.error(
      '[catalog] fetchProducts: res.ok === false, тело ответа =',
      bodyText,
    );
    throw new Error(
      `Не удалось загрузить товары: ${res.status} ${res.statusText}`,
    );
  }

  // если ok, пробуем распарсить JSON и тоже логируем
  let text: string;
  try {
    text = await res.text();
    console.log('[catalog] fetchProducts: raw JSON text =', text);
  } catch (err) {
    console.error('[catalog] fetchProducts: ошибка при чтении res.text()', err);
    throw err;
  }

  try {
    const json = JSON.parse(text) as ProductDto[];
    console.log(
      `[catalog] fetchProducts: успешно распарсили JSON, кол-во товаров = ${json.length}`,
      json,
    );
    return json;
  } catch (err) {
    console.error(
      '[catalog] fetchProducts: ошибка парсинга JSON. text =',
      text,
      'error =',
      err,
    );
    throw new Error('Ответ /products не является валидным JSON');
  }
}

// Бьём массив товаров на строки по 3 штуки
function chunkIntoRows<T>(items: T[], size = 3): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function buildProductCellHtml(product: ProductDto): string {
  console.log('[catalog] buildProductCellHtml: product =', product);

  const priceNumber = Number(product.price);
  const formattedPrice = Number.isFinite(priceNumber)
    ? priceNumber.toLocaleString('ru-RU')
    : product.price;

  const mainImagePath =
    product.images && product.images.length > 0
      ? product.images[0].image
      : product.image;

  const imgSrc = `${API_BASE}/${mainImagePath}`;
  const productUrl = `product.html?id=${product.alias}`;

  return `
    <td class="product-cell" valign="top" width="33%">
      <table class="product-card" width="100%" cellspacing="0" cellpadding="6">
        <tr>
          <td align="center">
            <a href="${productUrl}" title="Подробнее о товаре">
              <img src="${imgSrc}" alt="${product.name}" class="product-thumb" width="220">
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <div class="product-card-body">
              <h3 class="product-title">${product.name}</h3>
              <p class="product-desc">${product.shortDescription}</p>

              <div class="product-bottom">
                <p class="product-price"><b>Цена:</b> ${formattedPrice} ₽</p>
                <p class="product-links">
                  <a href="${productUrl}">Подробнее</a>
                </p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  `;
}

function renderCategoryTable(
  table: HTMLTableElement,
  products: ProductDto[],
): void {
  console.log(
    `[catalog] renderCategoryTable: рендерим ${products.length} товаров в таблицу #${table.id}`,
  );

  if (!products.length) {
    table.innerHTML =
      '<tr><td>Товары временно отсутствуют</td></tr>';
    return;
  }

  const rows = chunkIntoRows(products, 3);

  table.innerHTML = rows
    .map(
      (row) => `
        <tr>
          ${row.map((p) => buildProductCellHtml(p)).join('')}
        </tr>
      `,
    )
    .join('');
}

async function initCatalogPage(): Promise<void> {
  console.log('[catalog] initCatalogPage: старт');

  const menTable = document.getElementById(
    'catalog-men',
  ) as HTMLTableElement | null;
  const womenTable = document.getElementById(
    'catalog-women',
  ) as HTMLTableElement | null;
  const accessoriesTable = document.getElementById(
    'catalog-accessories',
  ) as HTMLTableElement | null;

  console.log('[catalog] initCatalogPage: найденные таблицы', {
    menTableExists: !!menTable,
    womenTableExists: !!womenTable,
    accessoriesTableExists: !!accessoriesTable,
  });

  if (!menTable || !womenTable || !accessoriesTable) {
    console.log(
      '[catalog] initCatalogPage: это не страница каталога (одна из таблиц не найдена), выходим',
    );
    return;
  }

  try {
    const products = await fetchProducts();
    console.log('[catalog] initCatalogPage: все товары =', products);

    const men = products.filter((p) => p.category === 'men');
    const women = products.filter((p) => p.category === 'women');
    const accessories = products.filter(
      (p) => p.category === 'accessories',
    );

    console.log('[catalog] разбивка по категориям:', {
      men: men.length,
      women: women.length,
      accessories: accessories.length,
    });

    renderCategoryTable(menTable, men);
    renderCategoryTable(womenTable, women);
    renderCategoryTable(accessoriesTable, accessories);

    console.log('[catalog] initCatalogPage: рендер завершён успешно');
  } catch (e) {
    console.error('[catalog] initCatalogPage: ошибка в try-блоке', e);
    const errorHtml =
      '<tr><td>Ошибка загрузки товаров. Попробуйте обновить страницу.</td></tr>';

    menTable.innerHTML = errorHtml;
    womenTable.innerHTML = errorHtml;
    accessoriesTable.innerHTML = errorHtml;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[catalog] DOMContentLoaded: вызываем initCatalogPage()');
  void initCatalogPage();
});
