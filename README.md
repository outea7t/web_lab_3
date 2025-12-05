# web_lab_3 – “City Class” Shoe Store 
Author: Maslov Pavel IDB-23-16

Training project for the **“Web Technologies Basics”** course.  
It implements a small online shoe store **“Сити Класс”** with:

- public pages (home, catalog, product details, about, contacts);
- user registration and login;
- product catalog loaded from a **NestJS + PostgreSQL** backend;
- product reviews (only for logged-in users);
- simple **admin panel** (only for users with `admin` role) to manage products.

All UI text in the app is in **Russian**, but this README is in English.

## Environment configuration

To create DB use this command from the project root:

Admin user credentials:

- Login: ```pavel_maslov@mail.ru```
- Password: ```Paaassw0rd```

```bash
PGPASSWORD=your_password pg_dump \
  -h localhost \
  -p 5432 \
  -U postgres \
  --clean --if-exists --no-owner --create \
  shop_db > db/shop_db_dump.sql
```

Copy `.env.example` to `.env` in `/shop-api/.env` and fill in your values:

```env
# DB
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=shop_db

# App (backend)
PORT=3000
WEB_ORIGIN=http://localhost:5173

# JWT
JWT_ACCESS_SECRET=access_secret_super
JWT_ACCESS_EXPIRES_IN=900          # 15 minutes in seconds

JWT_REFRESH_SECRET=refresh_secret_super
JWT_REFRESH_EXPIRES_IN=604800      # 7 days in seconds
```

To run shop-api use (from project root)
```
cd shop-api
npm run dev
```

To run shop-client use (from project root)
```
cd shop-client
npm run dev 
```
---

## Tech stack

- **Backend**
  - [NestJS](https://nestjs.com/)
  - PostgreSQL
  - `sequelize-typescript` (models for `products`, `product_properties`, `product_images`, `product_reviews`)
  - JWT authentication (access + refresh tokens)
- **Frontend**
  - Plain HTML + CSS (table-based layout as required by the lab)
  - TypeScript modules (`/src/*.ts`)
  - Partials loaded via fetch (header, navbar, sidebar, footer)
  - Authentication UI in the header (login form / “you are logged in”)
  - Catalog and product pages talking to the backend via JSON API

---

## Project structure

> Folder / file names may be slightly different in your clone, but the idea is the same.

### Root level

- `index.html` – main page (“Главная”)
- `catalog.html` – catalog with products and categories (men/women/accessories)
- `product.html` – product details page (characteristics + reviews)
- `about.html` – “About us” page
- `contacts.html` – contacts page with a styled feedback form
- `register.html` – registration page
- `admin.html` – admin panel (available only for users with `admin` role)

- `style.css` – global styles:
  - base typography and layout (`.container`, `.header`, `.nav`, `.layout`, `.footer`);
  - catalog card styles (`.product-card`, `.product-price`, `.product-thumb`, etc.);
  - product page styles (`.product-page`, `.brief-description`, `.detailed-description`);
  - forms (`.contacts-input`, `.contacts-button`, registration form styles);
  - review cards (`.review-card`, `.review-meta`, etc., if present).

- `.env.example` – example of environment variables for the backend (DB connection, JWT secrets).
- `db/shop_db_dump.sql` – **PostgreSQL dump** of the database for quick setup.

### Partials

- `partials/header.html` – table with logo, site title and a container `#header-auth` for auth UI.
- `partials/navbar.html` – top navigation (“Главная”, “Каталог”, “О нас”, “Контакты`, etc.).
- `partials/sidebar.html` – left sidebar content.
- `partials/footer.html` – footer.

These partials are dynamically loaded into:

- `<div id="header"></div>`
- `<div id="navbar"></div>`
- `<div id="sidebar"></div>`
- `<div id="footer"></div>`

on every page.

### Frontend TypeScript (`/src`)

- `src/partials-loader.ts`
  - Loads HTML partials into `#header`, `#navbar`, `#sidebar`, `#footer`.
  - Implements **auth header UI**:
    - If user is not logged in: shows login form (`email + password`) and link to `register.html`.
    - If user is logged in: shows “Вы вошли как <email>” + “Выйти” button.
  - Talks to backend:
    - `POST /auth/login` → returns `{ user, accessToken }`, saves:
      - access token in `localStorage` (`sc_accessToken`);
      - user payload in `localStorage` (`sc_user`).
    - `POST /auth/refresh` → uses refresh cookie to get a new access token if needed.
    - `POST /auth/logout` → invalidates refresh cookie and clears localStorage.
  - After partials are loaded, it calls `initHeaderAuth()` to render correct auth state.
  - **Sidebar “Admin Panel” link**:
    - After auth is initialized, if current user has `role: 'admin'`, a link  
      `Админ панель` → `admin.html` is appended to the sidebar navigation.

- `src/catalog-page.ts`
  - Fetches product list from backend:
    - `GET /products`
  - Splits products by category:
    - `men`
    - `women`
    - `accessories`
  - Renders 3-column card grid into tables:
    - `#catalog-men`
    - `#catalog-women`
    - `#catalog-accessories`
  - Each card shows:
    - main image (from `product.images[0]` or `product.image`);
    - name, short description, formatted price;
    - “Подробнее” link to `product.html?id=<product.alias>`.
  <img width="1067" height="1370" alt="image" src="https://github.com/user-attachments/assets/717563c3-07c9-4390-92f0-ade2ded4283c" />


- `src/product-page.ts`
  - Reads `id` (`alias`, like `"p1"`) from query string: `product.html?id=p1`.
  - Loads:
    - product list via `GET /products` and finds the one with matching `alias`;
    - reviews via `GET /products/:productId/reviews`.
  - Renders product info:
    - title, image, short/long description;
    - price, formatted `ru-RU`;
    - characteristics from `product.properties` (`product_properties` table).
  - Renders reviews:
    - shows a list of reviews (author name + stars + text);
    - if there are no reviews: “Пока нет отзывов. Вы можете быть первым.”
    <img width="1024" height="763" alt="image" src="https://github.com/user-attachments/assets/3133326c-6d82-4b89-be89-04039583172b" />
  - **Review form**:
    - Available only if a current user is detected (from `localStorage` or `/auth/profile`).
    - Creates review via:
      - `POST /products/:productId/reviews` (requires **valid access token**).
    - If user is not logged in:
      - “Только зарегистрированные пользователи могут оставлять отзывы”.
  - **Admin features**:
    - If current user has `role: 'admin'`:
      - Each review shows a “Удалить” button.
      - On click: `DELETE /products/:productId/reviews/:reviewId` (protected by `JwtAuthGuard` + `RolesGuard('admin')` on backend).
    <img width="782" height="104" alt="image" src="https://github.com/user-attachments/assets/2c70cfc1-db93-4503-ac7b-b7982f0b8775" />


- `src/admin-page.ts` (if present)
  - Simple admin panel page.
  - Checks current user role from `localStorage`:
    - If not admin: displays “Доступ запрещён” and does not show controls.
  - If admin:
    - Loads product list via `GET /products`.
    - Allows:
      - creating new products with a form (calls `POST /products` – admin only);
      - deleting products via `DELETE /products/:id` (if you added that endpoint on backend).
<img width="990" height="1381" alt="image" src="https://github.com/user-attachments/assets/56434a2e-06a5-4b2d-bb5e-d39bc4ca03b2" />

### Backend (NestJS, under `src/`)

- `src/products/product.model.ts`
  - Sequelize model for `products` table with fields:
    - `manufacturerId`, `name`, `alias`, `shortDescription`, `description`,
      `price` (DECIMAL as string), `image`, `category`, `available`,
      `metaKeywords`, `metaDescription`, `metaTitle`.
  - Relations:
    - `@HasMany(() => ProductProperty)` → `properties`
    - `@HasMany(() => ProductImage)` → `images`
    - `@HasMany(() => ProductReview)` → `reviews`

- `src/products/product-property.model.ts`
  - Model for `product_properties` (name/value/price for characteristics).

- `src/products/product-image.model.ts`
  - Model for `product_images` (additional images for a product).

- `src/products/product-review.model.ts`
  - Model for `product_reviews` with fields:
    - `productId`, `authorName`, optional `authorFirstName` / `authorLastName` / `authorGender`,
      `rating` (1–5), `text`.

- `src/products/products.controller.ts`
  - `GET /products` – list all products (with relations).
  - `POST /products` – create a new product; protected by:
    - `@UseGuards(JwtAuthGuard, RolesGuard)`
    - `@Roles('admin')`

- `src/products/product-reviews.controller.ts`
  - `GET /products/:productId/reviews` – list reviews for a product.
  - `POST /products/:productId/reviews`
    - Add new review;
    - Protected by `JwtAuthGuard` – any logged-in user can post.
  - `DELETE /products/:productId/reviews/:reviewId`
    - Delete a review;
    - Protected by `JwtAuthGuard` + `RolesGuard`;
    - Only admin (`role === 'admin'`) is allowed.

- `src/products/products.service.ts`
  - `findAll()` – returns all products with `include: { all: true }`.
  - `create(dto)` – creates a new product from DTO.

- `src/auth/*`
  - Controllers, services and guards for auth:
    - `POST /auth/login` – log in, returns `{ user, accessToken }`, sets refresh token cookie.
    - `POST /auth/refresh` – uses refresh cookie to issue new access token.
    - `POST /auth/logout` – logs user out (drops refresh).
    - `GET /auth/profile` – returns current user from access token.
  - `JwtAuthGuard` – checks `Authorization: Bearer <token>`.
  - `RolesGuard` – checks `payload.role` against `@Roles('admin')`.

---


