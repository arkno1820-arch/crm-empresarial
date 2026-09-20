"""
Cifrado a nivel de columna para datos sensibles (salud y contacto de
emergencia). Transparente para el resto del codigo: SQLAlchemy cifra al
guardar y descifra al leer usando este tipo de columna en vez de Text/String.

La clave vive en la variable de entorno FIELD_ENCRYPTION_KEY (igual que
JWT_SECRET). Esto protege los datos si alguien accede solo a la base de
datos o a un respaldo de esta, pero no reemplaza el control de acceso de
la aplicacion ni protege contra alguien con acceso completo al servidor
y al archivo .env.

Compatibilidad con datos ya existentes sin cifrar: si al descifrar un
valor falla (porque quedo guardado en texto plano antes de activar el
cifrado), se devuelve tal cual en vez de fallar. Ese registro queda
cifrado automaticamente la proxima vez que se guarde.
"""
import os
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy.types import TypeDecorator, Text

_KEY = os.getenv("FIELD_ENCRYPTION_KEY")
_fernet = Fernet(_KEY.encode()) if _KEY else None

if not _fernet:
    import logging
    logging.getLogger("uvicorn").warning(
        "FIELD_ENCRYPTION_KEY no esta configurada: los campos sensibles de "
        "empleados (alergias, medicamentos, prevision medica, contacto de "
        "emergencia) se guardaran SIN CIFRAR. Define FIELD_ENCRYPTION_KEY "
        "en el .env para activar el cifrado."
    )


class EncryptedText(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None or value == "" or _fernet is None:
            return value
        return _fernet.encrypt(value.encode()).decode()

    def process_result_value(self, value, dialect):
        if value is None or value == "" or _fernet is None:
            return value
        try:
            return _fernet.decrypt(value.encode()).decode()
        except InvalidToken:
            # Dato guardado antes de activar el cifrado (o clave distinta).
            return value
