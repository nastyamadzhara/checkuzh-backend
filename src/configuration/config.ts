export default () => ({
    host_db: process.env.DB_HOST || 'localhost',
    port_db: parseInt(process.env.DB_PORT || '5432', 10),
    username_db: process.env.POSTGRES_USER || 'postgres',
    password_db: process.env.POSTGRES_PASSWORD || 'postgres',
    name_db: process.env.POSTGRES_DB || 'checkuzh_db',
    jwt_secret: process.env.JWT_SECRET || 'secret',
    jwt_expires_in: process.env.JWT_EXPIRES_IN || '1d',
    node_env: process.env.NODE_ENV || 'development',
});
