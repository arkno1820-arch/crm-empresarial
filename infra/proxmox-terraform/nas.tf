# ── NAS de respaldos: contenedor LXC "crm-nas" sobre el disco externo ───────────────
# Unidad de respaldo simulada: un contenedor con su disco raiz en el almacenamiento
# "nas-respaldos" (archivo .vmdk de 200 GB alojado en el disco externo K: del PC, visto en
# Proxmox como /dev/sdb, ext4). Recibe por SSH los volcados cifrados de la base de datos
# que los nucleos envian cada noche (ver rol Ansible "respaldo").
#
# Por que SFTP/SSH y no NFS: un NFS de kernel no corre en un LXC sin privilegios, y un LXC
# privilegiado ampliaria la superficie de ataque del host. Con SSH basta el sshd que ya
# trae la plantilla, y el receptor puede limitarse a "solo escribir" (ver rol respaldo).
# Vive en vmbr1 (10.10.10.30), sin salida a Internet, igual que los nucleos.
# El contenedor NO se incluye en el vzdump: su disco ya vive en el mismo almacenamiento
# de respaldos (guardar un respaldo dentro del respaldo no aporta nada).

resource "proxmox_virtual_environment_container" "crm_nas" {
  node_name     = var.proxmox_node
  vm_id         = 105
  description   = "NAS de respaldos (disco externo) - CRM Empresarial"
  unprivileged  = true
  start_on_boot = true

  # Arranca despues del monitoreo y antes que las VMs: los respaldos nocturnos lo necesitan.
  startup {
    order      = 2
    up_delay   = 5
    down_delay = 5
  }

  initialization {
    hostname = "crm-nas"
    dns {
      servers = ["8.8.8.8", "1.1.1.1"]
    }
    ip_config {
      ipv4 {
        address = "10.10.10.30/24"
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
    dedicated = 256
    swap      = 0
  }
  disk {
    datastore_id = "nas-respaldos"
    size         = 100
  }

  depends_on = [proxmox_virtual_environment_network_linux_bridge.internal]
}
