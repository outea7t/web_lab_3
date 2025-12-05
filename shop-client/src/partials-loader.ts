type PartialId = 'header' | 'navbar' | 'sidebar' | 'footer';

const partialsMap: Record<PartialId, string> = {
  header: '/partials/header.html',
  navbar: '/partials/navbar.html',
  sidebar: '/partials/sidebar.html',
  footer: '/partials/footer.html',
};

const API_BASE = 'http://localhost:3000'; // или import.meta.env.VITE_API_BASE

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

async function loadPartial(id: PartialId): Promise<void> {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const response = await fetch(partialsMap[id]);
    if (!response.ok) {
      console.error(`Не удалось загрузить partial "${id}":`, response.status, response.statusText);
      return;
    }

    const html = await response.text();
    element.innerHTML = html;
  } catch (error) {
    console.error(`Ошибка при загрузке partial "${id}":`, error);
  }
}

function updateSidebarAdminLink(user: UserPayload | null): void {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const existingLink = sidebar.querySelector<HTMLAnchorElement>('#sidebar-admin-link');

  if (user && user.role === 'admin') {
    // уже есть — ничего не делаем
    if (existingLink) return;

    const link = document.createElement('a');
    link.id = 'sidebar-admin-link';
    link.className = 'nav-link';
    link.href = 'admin.html';
    link.textContent = 'Админ панель';

    const br = document.createElement('br');

    sidebar.appendChild(link);
    sidebar.appendChild(br);
  } else {
    // не админ или не залогинен — убираем, если была
    if (existingLink) {
      const br = existingLink.nextSibling;
      existingLink.remove();
      if (br && br.nodeName === 'BR') {
        br.parentNode?.removeChild(br);
      }
    }
  }
}


// ====== AUTH UI ======

function saveSession(data: AuthResponse) {
  localStorage.setItem(ACCESS_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredUser(): UserPayload | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserPayload;
  } catch {
    return null;
  }
}

async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // важно для refresh cookie
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let message = 'Ошибка входа';
    try {
      const err = await res.json();
      if (typeof err.message === 'string') message = err.message;
      if (Array.isArray(err.message)) message = err.message.join('\n');
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json() as Promise<AuthResponse>;
}

async function apiRefresh(): Promise<AuthResponse | null> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    return null;
  }

  return res.json() as Promise<AuthResponse>;
}

async function apiLogout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

function renderLoggedOut(container: HTMLElement) {
  container.innerHTML = `
    <table class="login">
      <tr>
        <td>логин: <input type="text" class="input-text" name="email"></td>
      </tr>
      <tr>
        <td>пароль: <input type="password" class="input-text" name="password"></td>
      </tr>
      <tr>
        <td>
          <div class="input-button-container">
            <button type="button" class="btn-login" id="header-login-btn">войти</button>
            <a href="register.html" class="btn-register">регистрация</a>
          </div>
        </td>
      </tr>
    </table>
  `;

  const loginBtn = container.querySelector<HTMLButtonElement>('#header-login-btn');
  const emailInput = container.querySelector<HTMLInputElement>('input[name="email"]');
  const passInput = container.querySelector<HTMLInputElement>('input[name="password"]');

  if (!loginBtn || !emailInput || !passInput) return;

  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    if (!email || !password) {
      alert('Введите логин и пароль');
      return;
    }

    try {
      const data = await apiLogin(email, password);
      saveSession(data);
      renderLoggedIn(container, data.user);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  });

  // пользователь разлогинен — скрываем ссылку админа
  updateSidebarAdminLink(null);
}


function renderLoggedIn(container: HTMLElement, user: UserPayload) {
  container.innerHTML = `
    <div class="header-user">
      <div class="header-user-info">
        Вы вошли как <b>${user.email}</b>
      </div>
      <button type="button" class="btn-login" id="header-logout-btn">Выйти</button>
    </div>
  `;

  const logoutBtn = container.querySelector<HTMLButtonElement>('#header-logout-btn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error(e);
    }
    clearSession();
    renderLoggedOut(container);
  });

  // если админ — покажем ссылку, иначе уберём
  updateSidebarAdminLink(user);
}


async function initHeaderAuth() {
  const container = document.getElementById('header-auth');
  if (!container) return;

  // 1) пробуем взять юзера из localStorage
  let user = getStoredUser();

  // 2) если нет — пробуем refresh по куке
  if (!user) {
    try {
      const data = await apiRefresh();
      if (data) {
        saveSession(data);
        user = data.user;
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (user) {
    renderLoggedIn(container, user);
  } else {
    renderLoggedOut(container);
  }

  // ещё раз синхронизируем сайдбар
  updateSidebarAdminLink(user ?? null);
}

// ====== INIT ======

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    await loadPartial('header');
    await Promise.all([
      loadPartial('navbar'),
      loadPartial('sidebar'),
      loadPartial('footer'),
    ]);

    await initHeaderAuth();
  })().catch((e) => console.error(e));
});
