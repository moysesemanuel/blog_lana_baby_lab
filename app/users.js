import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createUserRecord, hashPassword, verifyPassword } from "./auth.js";
import { dbQuery, isDatabaseEnabled } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, "..", "content");
const usersFile = path.join(contentDir, "users.json");

const getAdminEmail = () => (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const getAdminName = () => (process.env.ADMIN_NAME || "Administrador").trim();
const getAdminPassword = () => process.env.ADMIN_PASSWORD || "";

const ensureUsersStore = () => {
  if (!existsSync(contentDir)) {
    mkdirSync(contentDir, { recursive: true });
  }

  if (!existsSync(usersFile)) {
    writeFileSync(usersFile, "[]\n", "utf8");
  }
};

const readUsersFromFile = () => {
  ensureUsersStore();

  try {
    const parsed = JSON.parse(readFileSync(usersFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeUsersToFile = (users) => {
  ensureUsersStore();
  writeFileSync(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
};

const normalizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email.toLowerCase(),
  passwordHash: user.passwordHash,
  role: user.role,
  createdAt: user.createdAt
});

const formatGeneratedName = (email = "") => {
  const localPart = email.split("@")[0] || "Colaborador";

  const words = localPart
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "Colaborador";
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const isAdminEmail = (email) =>
  Boolean(email) && email.toLowerCase() === getAdminEmail();

export const getUsers = async () => {
  if (isDatabaseEnabled()) {
    const result = await dbQuery(
      `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        ORDER BY created_at ASC
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at
    }));
  }

  return readUsersFromFile();
};

export const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase();

  if (isDatabaseEnabled()) {
    const result = await dbQuery(
      `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          name: row.name,
          email: row.email,
          passwordHash: row.password_hash,
          role: row.role,
          createdAt: row.created_at
        }
      : null;
  }

  return readUsersFromFile().find((user) => user.email === normalizedEmail) || null;
};

export const findUserById = async (id) => {
  if (isDatabaseEnabled()) {
    const result = await dbQuery(
      `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          name: row.name,
          email: row.email,
          passwordHash: row.password_hash,
          role: row.role,
          createdAt: row.created_at
        }
      : null;
  }

  return readUsersFromFile().find((user) => user.id === id) || null;
};

export const createUser = async ({ name, email, password }) => {
  const resolvedName = String(name ?? "").trim() || formatGeneratedName(email);
  const role = isAdminEmail(email) ? "admin" : "contributor";
  const user = normalizeUser(
    createUserRecord({ name: resolvedName, email, password, role })
  );

  if (isDatabaseEnabled()) {
    await dbQuery(
      `
        INSERT INTO users (id, name, email, password_hash, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [user.id, user.name, user.email, user.passwordHash, user.role, user.createdAt]
    );
  } else {
    const users = readUsersFromFile();
    writeUsersToFile([...users, user]);
  }

  return user;
};

export const updateUserPassword = async (id, password) => {
  const passwordHash = hashPassword(password);

  if (isDatabaseEnabled()) {
    await dbQuery(
      `
        UPDATE users
        SET password_hash = $2
        WHERE id = $1
      `,
      [id, passwordHash]
    );

    return findUserById(id);
  }

  const users = readUsersFromFile();
  const nextUsers = users.map((user) =>
    user.id === id ? { ...user, passwordHash } : user
  );
  writeUsersToFile(nextUsers);
  return nextUsers.find((user) => user.id === id) || null;
};

export const syncAdminUserFromEnv = async () => {
  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await findUserByEmail(adminEmail);

  if (!existingAdmin) {
    await createUser({
      name: getAdminName(),
      email: adminEmail,
      password: adminPassword
    });
    return;
  }

  const nextName = getAdminName();
  const needsPasswordUpdate = !verifyPassword(adminPassword, existingAdmin.passwordHash);
  const needsNameUpdate = existingAdmin.name !== nextName;

  if (isDatabaseEnabled()) {
    if (needsNameUpdate) {
      await dbQuery(`UPDATE users SET name = $2 WHERE id = $1`, [existingAdmin.id, nextName]);
    }

    if (needsPasswordUpdate) {
      await updateUserPassword(existingAdmin.id, adminPassword);
    }

    return;
  }

  if (!needsNameUpdate && !needsPasswordUpdate) {
    return;
  }

  const users = readUsersFromFile();
  const nextUsers = users.map((user) =>
    user.id === existingAdmin.id
      ? {
          ...user,
          name: nextName,
          passwordHash: needsPasswordUpdate ? hashPassword(adminPassword) : user.passwordHash
        }
      : user
  );
  writeUsersToFile(nextUsers);
};

export const initUsersStore = async () => {
  if (isDatabaseEnabled()) {
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  } else {
    ensureUsersStore();
  }

  await syncAdminUserFromEnv();
};
