-- Tạo database english_learning khi khởi tạo PostgreSQL lần đầu
SELECT 'CREATE DATABASE english_learning'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'english_learning')\gexec
