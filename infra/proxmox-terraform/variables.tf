variable "proxmox_endpoint" {
  description = "URL de la API de Proxmox, ej. https://192.168.1.147:8006/"
  type        = string
}

variable "proxmox_api_token" {
  description = "Token de API en formato usuario@reino!nombretoken=secreto"
  type        = string
  sensitive   = true
}

variable "proxmox_node" {
  description = "Nombre del nodo Proxmox (lo ves en la consola, normalmente 'pve')"
  type        = string
  default     = "pve"
}

variable "template_vm_id" {
  description = "ID de la plantilla cloud-init creada en el paso manual (ver README, paso 2)"
  type        = number
  default     = 9000
}

variable "ssh_public_key" {
  description = "Tu llave publica SSH, para entrar a las VMs sin contrasena"
  type        = string
}

variable "lan_gateway" {
  description = "IP del router de tu LAN"
  type        = string
  default     = "192.168.1.1"
}

variable "crm_edge_lan_ip" {
  description = "IP fija que tendra crm-edge dentro de tu LAN"
  type        = string
  default     = "192.168.1.60/24"
}

variable "crm_edge_b_lan_ip" {
  description = "IP fija que tendra crm-edge-b (borde en espera) dentro de tu LAN"
  type        = string
  default     = "192.168.1.61/24"
}

variable "crm_edge_vip" {
  description = "IP virtual que Keepalived mueve entre crm-edge y crm-edge-b (no la asigna Terraform, la gestiona Keepalived en el sistema operativo)"
  type        = string
  default     = "192.168.1.62"
}
