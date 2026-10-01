import pool from "../config/db";

export const createSession = async (
  userId: number,
  refreshTokenHash: string,
  expiresAt: Date,
) => {
  const result = await pool.query(
    `
      INSERT INTO sessions (
        user_id,
        refresh_token_hash,
        expires_at,
        revoked
      )
      VALUES ($1, $2, $3, false)
      RETURNING *
    `,
    [userId, refreshTokenHash, expiresAt],
  );

  return result.rows[0];
};


export const findActiveByRefreshTokenHash =
  async (
    refreshTokenHash: string,
  ) => {
    const result =
      await pool.query(
        `
          SELECT *
          FROM sessions
          WHERE refresh_token_hash = $1
            AND revoked = false
        `,
        [refreshTokenHash],
      );

    return result.rows[0];
  };


  export const rotateSession =
  async (
    sessionId: number,
    newRefreshTokenHash: string,
    newExpiresAt: Date,
  ) => {
    const result =
      await pool.query(
        `
          UPDATE sessions
          SET
            refresh_token_hash = $1,
            expires_at = $2
          WHERE id = $3
          RETURNING *
        `,
        [
          newRefreshTokenHash,
          newExpiresAt,
          sessionId,
        ],
      );

    return result.rows[0];
  };


  export const revokeByRefreshTokenHash =
    async (
      refreshTokenHash: string,
    ) => {
      const result =
        await pool.query(
          `
            UPDATE sessions
            SET revoked = true
            WHERE refresh_token_hash = $1
            RETURNING *
          `,
          [refreshTokenHash],
        );

      return result.rows[0];
    };