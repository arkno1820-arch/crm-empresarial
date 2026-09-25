output "crm_edge_vip" {
  value = "VIP interna (Keepalived): ${var.crm_edge_vip}. Desde la LAN/hotspot el CRM se publica en https://<IP de Proxmox> (DNAT 80/443 -> VIP)"
}

output "crm_edge_nodos" {
  value = "crm-edge: 10.10.10.2 · crm-edge-b: 10.10.10.3 (solo red interna vmbr1)"
}

output "crm_core_internal_ip" {
  value = "crm-core (activo): 10.10.10.10 · crm-core-b (replica): 10.10.10.11 — ninguna alcanzable desde la LAN"
}
