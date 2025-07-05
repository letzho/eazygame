const DEFAULT_USERS = [
  {
    username: 'Alex',
    password: 'password1',
    data: {
      name: 'Alex',
      balance: 2458.3,
      cards: [
        { id: 1, number: '**** **** **** 4289', holder: 'Alex Johnson', expiry: '09/25', primary: true },
        { id: 2, number: '**** **** **** 7632', holder: 'Alex Johnson', expiry: '11/26', primary: false },
      ],
      transactions: [
        { id: 1, name: 'Received from John', time: 'Today, 10:45 AM', amount: 250, type: 'income' },
        { id: 2, name: 'Coffee Shop', time: 'Yesterday, 8:30 AM', amount: -4.5, type: 'expense' },
        { id: 3, name: 'Grocery Store', time: 'Yesterday, 6:15 PM', amount: -32.75, type: 'expense' },
      ],
    },
  },
  {
    username: 'Alex',
    password: 'password2',
    data: {
      name: 'Alex',
      balance: 1200.0,
      cards: [
        { id: 1, number: '**** **** **** 1234', holder: 'Alex Johnson', expiry: '10/24', primary: true },
      ],
      transactions: [
        { id: 1, name: 'Salary', time: 'Today, 9:00 AM', amount: 1200, type: 'income' },
      ],
    },
  },
  {
    username: 'Alex',
    password: 'password3',
    data: {
      name: 'Alex',
      balance: 500.0,
      cards: [
        { id: 1, number: '**** **** **** 5678', holder: 'Alex Johnson', expiry: '12/23', primary: true },
      ],
      transactions: [
        { id: 1, name: 'Bookstore', time: 'Yesterday, 2:00 PM', amount: -50, type: 'expense' },
      ],
    },
  },
];

const USERS_KEY = 'payease_users';
const SESSION_KEY = 'payease_session';

function loadUsers() {
  let users = JSON.parse(localStorage.getItem(USERS_KEY));
  if (!users) {
    users = DEFAULT_USERS;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  return users;
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

function setSession(index) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(index));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function signIn(username, password) {
  const res = await fetch('http://eazygamepay-backend-f9cb7b9223fe.herokuapp.com/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) return null;
  const data = await res.json();
  // Store user id in localStorage for demo (replace with JWT in production)
  localStorage.setItem('user_id', data.user.id);
  return data;
}

export async function signUp(username, password) {
  // Register user in backend
  const res = await fetch('https://eazygamepay-backend-f9cb7b9223fe.herokuapp.com/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) return null;
  // After registration, log in
  return await signIn(username, password);
}


export function signOut() {
  localStorage.removeItem('user_id');
}

export function getCurrentUser() {
  const userId = localStorage.getItem('user_id');
  return userId ? parseInt(userId) : null;
}

export function updateCurrentUserData(newData) {
  const users = loadUsers();
  const idx = getSession();
  if (idx !== null && users[idx]) {
    users[idx].data = newData;
    saveUsers(users);
  }
}

export function deleteCurrentUser() {
  const users = loadUsers();
  const idx = getSession();
  if (idx !== null && users[idx]) {
    users.splice(idx, 1);
    saveUsers(users);
    clearSession();
  }
} 
