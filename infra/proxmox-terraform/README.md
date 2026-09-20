# IaC — CRM Empresarial sobre Proxmox (Terraform)

Automatiza la creación de la red interna (`vmbr1`) y las 2 VMs
(`crm-edge`, `crm-core`) que ya diseñamos en `guia-proxmox-vms.md`, en vez
de crearlas a mano por la consola web. Esto es lo que cierra con fuerza
el punto "Automatización e Integración de Redes" del perfil de egreso —
y reutiliza directamente lo que ya aprendiste con Terraform en el examen
de Arquitectura Cloud (mismo lenguaje, proveedor distinto).

**Reemplaza los pasos 1, 3 y 4 de `guia-proxmox-vms.md`** (crear `vmbr1`
y crear las 2 VMs a mano). Los pasos 5 en adelante (instalar Nginx/Docker
dentro de cada VM, levantar el CRM, probar, respaldar) siguen igual.

---

## 0. Instalar Terraform (si no lo tienes ya del examen de Cloud)

Ya deberías tenerlo de `ARQUITECTURA CLOUD\sem 9\terraform_1.16.0_windows_amd64\`.
Si no, descárgalo de developer.hashicorp.com/terraform/install.

## 1. Crear un token de API en Proxmox

1. En la consola web: **Datacenter → Permissions → API Tokens → Add**.
2. User: `root@pam`. Token ID: `terraform`. **Desmarca** "Privilege Separation"
   (para simplificar; en un entorno real se ajustan permisos finos).
3. Copia el **Token ID completo** (`root@pam!terraform`) y el **Secret**
   que se muestra una sola vez — pégalos en tu `terraform.tfvars` (paso 4).

## 2. Crear la plantilla cloud-init (una sola vez, a mano)

Terraform clona VMs desde una plantilla en vez de instalar el SO desde
cero cada vez — así se automatiza de verdad. Esta plantilla se crea una
única vez, en la Shell de Proxmox (nodo `pve`):

```bash
cd /var/lib/vz/template/iso
wget https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img

qm create 9000 --name ubuntu-cloudinit-template --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0
qm importdisk 9000 jammy-server-cloudimg-amd64.img local-lvm
qm set 9000 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-9000-disk-0
qm set 9000 --ide2 local-lvm:cloudinit
qm set 9000 --boot c --bootdisk scsi0
qm set 9000 --serial0 socket --vga serial0
qm template 9000
```

Si tu almacenamiento no se llama `local-lvm`, revisa el nombre real con
`pvesm status` y ajusta el comando.

## 3. Generar una llave SSH (si no tienes una)

En tu PC (PowerShell):
```powershell
ssh-keygen -t ed25519 -C "cesar-crm-proxmox"
```
Copia el contenido de `id_ed25519.pub` — va en `terraform.tfvars`.

## 4. Configurar tus variables

```bash
cp terraform.tfvars.example terraform.tfvars
```
Edita `terraform.tfvars` con el token del paso 1 y la llave del paso 3.
**Nunca subas este archivo a GitHub** (tiene tu token de acceso root).

## 5. Desplegar

```powershell
cd C:\Users\HP\Desktop\iac-proxmox-crm
terraform init
terraform plan
terraform apply
```

Escribe `yes`. Al terminar, `terraform output` te confirma las IPs.

## 6. Continuar con el CRM

Desde aquí, sigue exactamente los pasos 5 a 9 de `guia-proxmox-vms.md`
(instalar Nginx en `crm-edge`, Docker en `crm-core`, levantar el
`docker-compose.yml`, probar, respaldar) — esa parte no cambia.

## 7. Eliminar (si necesitas rehacerlo desde cero)

```powershell
terraform destroy
```

---

## Si algo falla

El proveedor de Terraform para Proxmox (`bpg/proxmox`) cambia nombres de
atributos entre versiones más seguido que el de AWS. Si `terraform plan`
o `apply` te tira un error de sintaxis del proveedor (no de tus datos),
pégamelo tal cual y lo ajustamos juntos — es normal iterar esto una o
dos veces antes de que quede limpio, no es que algo esté mal planteado.

## Evidencia para el informe

- `terraform plan` mostrando los recursos a crear.
- `terraform apply` completo (`Apply complete! Resources: N added`).
- El archivo `.tf` mismo como evidencia de la definición de infraestructura como código.
- Captura de las 2 VMs y la red `vmbr1` ya existiendo en la consola de Proxmox, creadas por Terraform (no manualmente).
