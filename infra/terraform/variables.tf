variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "sgp1"
}

variable "droplet_name" {
  description = "Name of the application droplet"
  type        = string
  default     = "edu-app-prod"
}

variable "droplet_size" {
  description = "Droplet size slug"
  type        = string
  default     = "s-2vcpu-4gb"
}

variable "droplet_image" {
  description = "Droplet OS image slug"
  type        = string
  default     = "ubuntu-22-04-x64"
}

variable "tags" {
  description = "Tags applied to droplet"
  type        = list(string)
  default     = ["edu-app", "production"]
}

variable "postgres_cluster_name" {
  description = "Managed PostgreSQL cluster name"
  type        = string
  default     = "edu-app-db"
}

variable "postgres_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "16"
}

variable "postgres_size" {
  description = "Managed PostgreSQL cluster size"
  type        = string
  default     = "db-s-1vcpu-1gb"
}

variable "postgres_node_count" {
  description = "Number of PostgreSQL nodes"
  type        = number
  default     = 1
}

variable "postgres_app_user" {
  description = "Application database user"
  type        = string
  default     = "nihongo"
}

variable "redis_cluster_name" {
  description = "Managed Redis cluster name"
  type        = string
  default     = "edu-app-redis"
}

variable "redis_version" {
  description = "Redis engine version"
  type        = string
  default     = "7"
}

variable "redis_size" {
  description = "Managed Redis cluster size"
  type        = string
  default     = "db-s-1vcpu-1gb"
}

variable "redis_node_count" {
  description = "Number of Redis nodes"
  type        = number
  default     = 1
}

variable "ssh_allowed_cidrs" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
