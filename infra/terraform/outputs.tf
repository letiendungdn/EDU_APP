output "droplet_id" {
  description = "ID of the application droplet"
  value       = digitalocean_droplet.app.id
}

output "droplet_ipv4" {
  description = "Public IPv4 address of the application droplet"
  value       = digitalocean_droplet.app.ipv4_address
}

output "droplet_urn" {
  description = "URN of the application droplet"
  value       = digitalocean_droplet.app.urn
}

output "postgres_cluster_id" {
  description = "ID of the managed PostgreSQL cluster"
  value       = digitalocean_database_cluster.postgres.id
}

output "postgres_host" {
  description = "Hostname of the managed PostgreSQL cluster"
  value       = digitalocean_database_cluster.postgres.host
}

output "postgres_port" {
  description = "Port of the managed PostgreSQL cluster"
  value       = digitalocean_database_cluster.postgres.port
}

output "postgres_uri" {
  description = "Connection URI for the default PostgreSQL user (sensitive)"
  value       = digitalocean_database_cluster.postgres.uri
  sensitive   = true
}

output "postgres_private_uri" {
  description = "Private connection URI for PostgreSQL (sensitive)"
  value       = digitalocean_database_cluster.postgres.private_uri
  sensitive   = true
}

output "postgres_app_user" {
  description = "Application PostgreSQL username"
  value       = digitalocean_database_user.app.name
}

output "postgres_app_password" {
  description = "Application PostgreSQL password (sensitive)"
  value       = digitalocean_database_user.app.password
  sensitive   = true
}

output "redis_cluster_id" {
  description = "ID of the managed Redis cluster"
  value       = digitalocean_database_cluster.redis.id
}

output "redis_host" {
  description = "Hostname of the managed Redis cluster"
  value       = digitalocean_database_cluster.redis.host
}

output "redis_port" {
  description = "Port of the managed Redis cluster"
  value       = digitalocean_database_cluster.redis.port
}

output "redis_uri" {
  description = "Connection URI for Redis (sensitive)"
  value       = digitalocean_database_cluster.redis.uri
  sensitive   = true
}

output "redis_private_uri" {
  description = "Private connection URI for Redis (sensitive)"
  value       = digitalocean_database_cluster.redis.private_uri
  sensitive   = true
}
