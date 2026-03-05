from spyne import Application, rpc, ServiceBase, Unicode, Boolean, ComplexModel
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication

# Modelo de respuesta estructurada
class RespuestaValidacion(ComplexModel):
    habilitado   = Boolean
    mensaje      = Unicode
    nombre       = Unicode
    cedula       = Unicode

class ValidadorVotanteService(ServiceBase):
    """
    SOAP #1 — Valida si un votante está habilitado para votar
    Express consume este servicio antes de procesar un voto
    """

    @rpc(Unicode, Unicode, _returns=RespuestaValidacion)
    def validar_votante(ctx, cedula, eleccion_id):
        """
        Recibe una cédula y el id de elección.
        Consulta la BD (aquí simulado) y responde si puede votar.
        En producción conecta directo a MySQL con mysql-connector-python.
        """
        import mysql.connector
        import os

        try:
            conn = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'voto_electronico')
            )
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT nombre, habilitado, ya_voto FROM votantes WHERE cedula = %s",
                (cedula,)
            )
            votante = cursor.fetchone()
            conn.close()

            if not votante:
                return RespuestaValidacion(
                    habilitado=False,
                    mensaje='Cédula no registrada en el padrón electoral',
                    nombre='',
                    cedula=cedula
                )

            if not votante['habilitado']:
                return RespuestaValidacion(
                    habilitado=False,
                    mensaje='Votante inhabilitado',
                    nombre=votante['nombre'],
                    cedula=cedula
                )

            if votante['ya_voto']:
                return RespuestaValidacion(
                    habilitado=False,
                    mensaje='Este votante ya ejerció su voto',
                    nombre=votante['nombre'],
                    cedula=cedula
                )

            return RespuestaValidacion(
                habilitado=True,
                mensaje='Votante habilitado para votar',
                nombre=votante['nombre'],
                cedula=cedula
            )

        except Exception as e:
            return RespuestaValidacion(
                habilitado=False,
                mensaje=f'Error de validación: {str(e)}',
                nombre='',
                cedula=cedula
            )


# Construcción de la app WSGI/SOAP
validador_app = Application(
    [ValidadorVotanteService],
    tns='http://voto.electronico.soap/validador',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)

wsgi_validador = WsgiApplication(validador_app)