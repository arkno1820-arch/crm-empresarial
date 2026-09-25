output "crm_edge_vip" {
  value = "VIP interna (Keepalived): ${var.crm_edge_vip}. Desde la LAN/hotspot el CRM se publica en https://<IP de Proxmox> (DNAT 80/443 -> VIP)"
}

output "crm_edge_nodos" {
  value = "crm-edge: 10.10.10.2 · crm-edge-b: 10.10.10.3 (solo red interna vmbr1)"
}

output "crm_core_internal_ip" {
  value = "crm-core (activo): 10.10.10.10 · crm-core-b (replica): 10.10.10.11 — ninguna alcanzable desde la LAN"
}

output "crm_monitoreo" {
  value = "Uptime Kuma en el contenedor LXC crm-mon (10.10.10.20), fuera de las VMs. Acceso: http://<IP de Proxmox>:3001 (DNAT en crm-nat)."
}

output "crm_nas" {
  value = "NAS de respaldos: contenedor LXC crm-nas (10.10.10.30), disco raiz en el almacenamiento nas-respaldos (disco externo). Recibe por SSH los volcados cifrados de la base de datos."
}
