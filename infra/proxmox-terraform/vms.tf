# ── Par de borde (crm-edge / crm-edge-b) ─────────────────────────────────
# Nginx nativo (se instala a mano tras el primer arranque, ver README paso 5)
# + Keepalived/VRRP entre ambos (rol Ansible "keepalived") para que la IP
# virtual (var.crm_edge_vip) salte automaticamente al nodo sano. Es la mitad
# barata y sin estado de la redundancia: si uno cae, el otro sigue sirviendo
# sin intervencion manual.

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

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    size         = 8 # la plantilla trae 2GB, insuficiente incluso para Nginx + logs
  }

  network_device {
    bridge = "vmbr0" # hacia la LAN
  }
  network_device {
    bridge = "vmbr1" # hacia crm-core
  }

  initialization {
    dns {
      servers = ["8.8.8.8", "1.1.1.1"]
    }
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

resource "proxmox_virtual_environment_vm" "crm_edge_b" {
  name      = "crm-edge-b"
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

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    size         = 8
  }

  network_device {
    bridge = "vmbr0"
  }
  network_device {
    bridge = "vmbr1"
  }

  initialization {
    dns {
      servers = ["8.8.8.8", "1.1.1.1"]
    }
    ip_config {
      ipv4 {
        address = var.crm_edge_b_lan_ip
        gateway = var.lan_gateway
      }
    }
    ip_config {
      ipv4 {
        address = "10.10.10.3/24"
      }
    }
    user_account {
      username = "cesar"
      keys     = [var.ssh_public_key]
    }
  }

  depends_on = [proxmox_virtual_environment_network_linux_bridge.internal]
}

# ── Par de nucleo (crm-core / crm-core-b) ────────────────────────────────
# crm-core corre el docker-compose.yml completo del CRM. crm-core-b es una
# replica (pg_dump periodico, rol Ansible "pg_replica") con promocion MANUAL
# documentada - automatizar la promocion seguro de un primario de base de
# datos no se justifica a esta escala. Ambas VMs solo tienen pata en vmbr1:
# inalcanzables directo desde la LAN, es la evidencia de segmentacion real
# para el informe.

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
    dedicated = 6144
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    size         = 25 # imagenes Docker (postgres + 6 microservicios) + datos de Postgres
  }

  network_device {
    bridge = "vmbr1"
  }

  initialization {
    dns {
      servers = ["8.8.8.8", "1.1.1.1"]
    }
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

resource "proxmox_virtual_environment_vm" "crm_core_b" {
  name      = "crm-core-b"
  node_name = var.proxmox_node

  clone {
    vm_id = var.template_vm_id
    full  = true
  }

  cpu {
    cores = 4
  }
  memory {
    dedicated = 6144
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    size         = 25
  }

  network_device {
    bridge = "vmbr1"
  }

  initialization {
    dns {
      servers = ["8.8.8.8", "1.1.1.1"]
    }
    ip_config {
      ipv4 {
        address = "10.10.10.11/24"
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
