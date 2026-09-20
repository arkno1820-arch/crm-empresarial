output "crm_edge_lan_ip" {
  value = "Accede al CRM desde tu LAN en: http://${split("/", var.crm_edge_lan_ip)[0]}"
}

output "crm_core_internal_ip" {
  value = "crm-core vive en la red interna: 10.10.10.10 (no alcanzable desde la LAN)"
}
