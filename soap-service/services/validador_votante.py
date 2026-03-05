import pymysql
import os
from spyne import Application, rpc, ServiceBase, Unicode, Boolean, ComplexModel
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication
from wsgiref.simple_server import make_server
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host':        os.getenv('DB_HOST', 'localhost'),
    'user':        os.getenv('DB_USER', 'root'),
    'password':    os.getenv('DB_PASSWORD', ''),
    'db':          os.getenv('DB_NAME', 'voto_electronico'),
    'cursorclass': pymysql.cursors.DictCursor
}

# --- MODELO DE DATOS ---
class RespuestaValidacion(ComplexModel):
    habilitado = Boolean
    mensaje    = Unicode
    nombre     = Unicode
    cedula     = Unicode

class ValidadorVotanteService(ServiceBase):

    # ---------------------------------------------------------
    # Validar si un votante puede votar
    # Recibe: cedula (str), eleccion_id (str)
    # Retorna: RespuestaValidacion
    # ---------------------------------------------------------
    @rpc(Unicode, Unicode, _returns=RespuestaValidacion)
    def validar_votante(ctx, cedula, eleccion_id):
        conn = pymysql.connect(**DB_CONFIG)
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT nombre, habilitado, ya_voto FROM votantes WHERE cedula = %s",
                    (cedula,)
                )
                votante = cursor.fetchone()

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
        finally:
            conn.close()

    # ---------------------------------------------------------
    # Inhabilitar un votante después de que vota
    # Recibe: cedula (str)
    # Retorna: mensaje confirmación (str)
    # ---------------------------------------------------------
    @rpc(Unicode, _returns=Unicode)
    def marcar_voto_emitido(ctx, cedula):
        conn = pymysql.connect(**DB_CONFIG)
        try:
            with conn.cursor() as cursor:
                sql = "UPDATE votantes SET ya_voto = 1 WHERE cedula = %s"
                cursor.execute(sql, (cedula,))

                if cursor.rowcount > 0:
                    conn.commit()
                    return f'Votante con cédula {cedula} marcado como ya votó.'
                else:
                    return f'No se encontró votante con cédula {cedula}.'
        except Exception as e:
            return f'Error al marcar voto: {str(e)}'
        finally:
            conn.close()


application = Application(
    [ValidadorVotanteService],
    tns='spyne.voto.validador',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)

if __name__ == '__main__':
    wsgi_app = WsgiApplication(application)
    server = make_server('0.0.0.0', 8001, wsgi_app)
    print("--- Servicio SOAP: Validador de Votante LISTO ---")
    print("Escuchando en http://127.0.0.1:8001")
    print("WSDL en        http://127.0.0.1:8001/?wsdl")
    server.serve_forever()