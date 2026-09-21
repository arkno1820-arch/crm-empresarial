output "crm_edge_vip" {
  value = "Accede al CRM desde tu LAN en: http://${var.crm_edge_vip} (IP virtual, la gestiona Keepalived)"
}

output "crm_edge_nodos" {
  value = "crm-edge: ${split("/", var.crm_edge_lan_ip)[0]} · crm-edge-b: ${split("/", var.crm_edge_b_lan_ip)[0]}"
}

output "crm_core_internal_ip" {
  value = "crm-core (activo): 10.10.10.10 · crm-core-b (replica): 10.10.10.11 — ninguna alcanzable desde la LAN"
}
