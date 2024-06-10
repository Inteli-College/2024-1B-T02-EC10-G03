variable "public_subnet_cidrs" {
    type        = list(string)
    description = "Public Subnet CIDR values"
    default     = ["192.168.0.0/20"]
}

variable "private_subnet_cidrs" {
    type        = list(string)
    description = "Private Subnet CIDR values"
    default     = ["192.168.1.0/20"]
}

variable "default_availability_zone" {
    type        = string
    description = "Default availability zone"
    default     = "us-east-1a"
}

variable "account_id" {
    type        = string
    description = "AWS Account ID"
    default     = "467923476463"
}