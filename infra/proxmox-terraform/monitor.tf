# ── Monitoreo FUERA de las VMs: contenedor LXC "crm-mon" ────────────────────────
# Uptime Kuma es el "ojo" del sistema: no puede caer junto con lo que vigila. Corre en
# un contenedor LXC del propio nodo Proxmox (no en ninguna de las 4 VMs), asi que
# sobrevive a la caida de cualquiera de ellas -o de todas-. Un LXC comparte el kernel
# del host: consume ~300 MB en vez de una VM completa (la memoria del host esta casi
# toda asignada) y no ensucia el hipervisor con software de aplicacion.
# Vive en vmbr1 (10.10.10.20) para ver los dos nucleos, los dos bordes y el propio host.

resource "proxmox_virtual_environment_download_file" "ubuntu_lxc" {
  content_type = "vztmpl"
  datastore_id = "local"
  node_name    = var.proxmox_node
  url          = "http://download.proxmox.com/images/system/ubuntu-22.04-standard_22.04-1_amd64.tar.zst"
  file_name    = "ubuntu-22.04-standard_22.04-1_amd64.tar.zst"
}

resource "proxmox_virtual_environment_container" "crm_mon" {
  node_name     = var.proxmox_node
  vm_id         = 104
  description   = "Monitoreo (Uptime Kuma) fuera de las VMs - CRM Empresarial"
  unprivileged  = true
  start_on_boot = true

  # Arranca primero: el monitoreo debe estar arriba antes que lo que vigila.
  startup {
    order      = 1
    up_delay   = 5
    down_delay = 5
  }

  initialization {
    hostname = "crm-mon"
    dns {
      servers = ["8.8.8.8", "1.1.1.1"]
    }
    ip_config {
      ipv4 {
        address = "10.10.10.20/24"
        gateway = "10.10.10.1"
      }
    }
    user_account {
      keys = [var.ssh_public_key]
    }
  }

  network_interface {
    name   = "eth0"
    bridge = "vmbr1"
  }

  operating_system {
    template_file_id = proxmox_virtual_environment_download_file.ubuntu_lxc.id
    type             = "ubuntu"
  }

  cpu {
    cores = 1
  }
  memory {
    dedicated = 768
    swap      = 0
  }
  disk {
    datastore_id = "local-lvm"
    size         = 8
  }

  depends_on = [proxmox_virtual_environment_network_linux_bridge.internal]
}
