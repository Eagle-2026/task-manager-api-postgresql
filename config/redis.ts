interface RedisConnectionConfig {
  host: string;
  port: number;
}

const redisConnection: RedisConnectionConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",

  port: Number(
    process.env.REDIS_PORT || 6379
  ),
};

export = redisConnection;