# crm-edge: borde expuesto a la LAN. Nginx nativo (se instala a mano tras
# el primer arranque, ver README paso 5) + una pata en la red interna.
resource "proxmox_virtual_environment_vm" "crm_edge" {
  name      = "crm-edge"
  node_name = var.proxmox_node

  clone {
    vm_id = var.template_vm_id
    full  = true
  }

  cpu {
    cores = 2
  }
  memory {
    dedicated = 2048
  }

  network_device {
    bridge = "vmbr0" # hacia la LAN
  }
  network_device {
    bridge = "vmbr1" # hacia crm-core
  }

  initialization {
    ip_config {
      ipv4 {
        address = var.crm_edge_lan_ip
        gateway = var.lan_gateway
      }
    }
    ip_config {
      ipv4 {
        address = "10.10.10.2/24"
      }
    }
    user_account {
      username = "cesar"
      keys     = [var.ssh_public_key]
    }
  }

  depends_on = [proxmox_virtual_environment_network_linux_bridge.internal]
}

# crm-core: nucleo del CRM (docker compose completo). Solo tiene pata en la
# red interna - inalcanzable directo desde la LAN, es la evidencia de
# segmentacion real para el informe.
resource "proxmox_virtual_environment_vm" "crm_core" {
  name      = "crm-core"
  node_name = var.proxmox_node

  clone {
    vm_id = var.template_vm_id
    full  = true
  }

  cpu {
    cores = 4
  }
  memory {
    dedicated = 8192
  }

  network_device {
    bridge = "vmbr1"
  }

  initialization {
    ip_config {
      ipv4 {
        address = "10.10.10.10/24"
        gateway = "10.10.10.1"
      }
    }
    user_account {
      username = "cesar"
      keys     = [var.ssh_public_key]
    }
  }

  depends_on = [proxmox_virtual_environment_network_linux_bridge.internal]
}
