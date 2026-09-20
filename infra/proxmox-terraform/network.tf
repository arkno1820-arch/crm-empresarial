resource "proxmox_virtual_environment_network_linux_bridge" "internal" {
  node_name = var.proxmox_node
  name      = "vmbr1"
  address   = "10.10.10.1/24"
  comment   = "Red interna aislada - crm-core vive aqui, sin salida a la LAN"
  # Sin "ports" -> no queda asociada a ninguna placa fisica: es 100% virtual,
  # existe solo dentro de Proxmox. Esta es la evidencia de "red virtual"
  # para el informe de practica.
}
