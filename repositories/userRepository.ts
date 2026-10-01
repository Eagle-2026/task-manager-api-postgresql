import pool from "../config/db";
import type {
  UserId,
  IProfileImage,
} from "../types/user.types";
// ========================================
// FIND USER BY ID
// ========================================

export const findById = async (userId: UserId) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        role,
        profile_image_url,
        profile_image_public_id,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  return result.rows[0];
};

// ========================================
// FIND ALL USERS
// ========================================

export const findAll = async () => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        role,
        profile_image_url,
        profile_image_public_id,
        created_at,
        updated_at
      FROM users
      ORDER BY id ASC
    `,
  );

  return result.rows;
};

// ========================================
// CREATE USER
// ========================================

export const create = async (
  name: string,
  email: string,
  password: string,
  role: "user" | "admin" = "user",
) => {
  const result = await pool.query(
    `
      INSERT INTO users (
        name,
        email,
        password,
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        email,
        role,
        profile_image_url,
        profile_image_public_id,
        created_at,
        updated_at
    `,
    [name, email, password, role],
  );

  return result.rows[0];
};

// ========================================
// DELETE USER
// ========================================

export const deleteById  = async (
  userId: UserId,
) => {
  const result = await pool.query(
    `
      DELETE FROM users
      WHERE id = $1
      RETURNING
        id,
        name,
        email,
        role,
        profile_image_url,
        profile_image_public_id,
        created_at,
        updated_at
    `,
    [userId],
  );

  return result.rows[0];
};

// ========================================
// UPDATE USER
// ========================================

export const update = async (
  userId: UserId,
  name: string,
  email: string,
  role: "user" | "admin",
) => {
  const result = await pool.query(
    `
      UPDATE users
      SET
        name = $1,
        email = $2,
        role = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING
        id,
        name,
        email,
        role,
        profile_image_url,
        profile_image_public_id,
        created_at,
        updated_at
    `,
    [name, email, role, userId],
  );

  return result.rows[0];
};


// ========================================
// FIND USER BY EMAIL WITH PASSWORD
// ========================================

export const findByEmailWithPassword = async (
  email: string,
) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password,
        role,
        profile_image_url,
        profile_image_public_id,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
};

export const updateProfileImage = async (
  userId: UserId,
  profileImage: IProfileImage,
) => {
  const result = await pool.query(
    `
      UPDATE users
      SET
        profile_image_url = $1,
        profile_image_public_id = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING
        id,
        name,
        email,
        role,
        profile_image_url,
        profile_image_public_id,
        created_at,
        updated_at
    `,
    [
      profileImage.url ?? null,
      profileImage.publicId ?? null,
      userId,
    ],
  );

  return result.rows[0] ?? null;
};

type UpdateMeData = {
  name?: string;
  email?: string;
};

// ========================================
// UPDATE CURRENT USER
// ========================================

export const updateMe = async (
  userId: UserId,
  data: UpdateMeData,
) => {
  const result = await pool.query(
    `
      UPDATE users
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        updated_at = NOW()
      WHERE id = $3
      RETURNING
        id,
        name,
        email,
        role,
        profile_image_url,
        profile_image_public_id,
        created_at,
        updated_at
    `,
    [
      data.name ?? null,
      data.email ?? null,
      userId,
    ],
  );

  return result.rows[0] ?? null;
};