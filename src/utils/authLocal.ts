import { hashPassword } from "./hashPassword";

// KEY NAMES USED IN LOCAL STORAGE
const USERS_KEY = "adminUsers";
const SESSION_KEY = "adminSession";

// ------------------------------------------------------------------------------------
// GET ALL USERS
// ------------------------------------------------------------------------------------
export function getAllUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// ------------------------------------------------------------------------------------
// SAVE USER TO LOCAL STORAGE
// (Multiple Users Allowed)
// ------------------------------------------------------------------------------------
export async function saveUser(name: string, email: string, password: string) {
  const users = getAllUsers();

  // Check if user already exists
  const exists = users.some((u: any) => u.email === email);
  if (exists) throw new Error("Email already exists");

  const hashedPass = await hashPassword(password);

  users.push({
    name,
    email,
    password: hashedPass,
  });

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ------------------------------------------------------------------------------------
// VALIDATE LOGIN
// ------------------------------------------------------------------------------------
export async function validateLogin(email: string, password: string) {
  const users = getAllUsers();
  const hashedPass = await hashPassword(password);

  const user = users.find(
    (u: any) => u.email === email && u.password === hashedPass
  );

  return user || null;
}

// ------------------------------------------------------------------------------------
// SAVE LOGIN SESSION
// ------------------------------------------------------------------------------------
export function createSession(user: any) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// ------------------------------------------------------------------------------------
// GET CURRENT SESSION
// ------------------------------------------------------------------------------------
export function getSession() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// ------------------------------------------------------------------------------------
// CLEAR SESSION
// ------------------------------------------------------------------------------------
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
