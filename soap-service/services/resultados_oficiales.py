import pymysql
import os
from spyne import Application, rpc, ServiceBase, Integer, Unicode, Float, Iterable, ComplexModel
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

# --- MODELOS DE DATOS ---
class ResultadoCandidato(ComplexModel):
    candidato_id = Integer
    nombre       = Unicode
    partido      = Unicode
    numero       = Integer
    total_votos  = Integer
    porcentaje   = Float

class InfoEleccion(ComplexModel):
    eleccion_id = Integer
    titulo      = Unicode
    estado      = Unicode
    total_votos = Integer

class ResultadosOficialesService(ServiceBase):

    # ---------------------------------------------------------
    # Obtener info general de una elección
    # Recibe: eleccion_id (int)
    # Retorna: InfoEleccion
    # ---------------------------------------------------------
    @rpc(Integer, _returns=InfoEleccion)
    def get_info_eleccion(ctx, eleccion_id):
        conn = pymysql.connect(**DB_CONFIG)
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, titulo, estado FROM elecciones WHERE id = %s",
                    (eleccion_id,)
                )
                eleccion = cursor.fetchone()

                if not eleccion:
                    return InfoEleccion(
                        eleccion_id=eleccion_id,
                        titulo='No encontrada',
                        estado='error',
                        total_votos=0
                    )

                cursor.execute(
                    "SELECT COUNT(*) as total FROM votos WHERE eleccion_id = %s",
                    (eleccion_id,)
                )
                conteo = cursor.fetchone()

                return InfoEleccion(
                    eleccion_id=eleccion['id'],
                    titulo=eleccion['titulo'],
                    estado=eleccion['estado'],
                    total_votos=conteo['total']
                )
        except Exception as e:
            return InfoEleccion(
                eleccion_id=eleccion_id,
                titulo=f'Error: {str(e)}',
                estado='error',
                total_votos=0
            )
        finally:
            conn.close()

    # ---------------------------------------------------------
    # Obtener resultados por candidato de una elección
    # Recibe: eleccion_id (int)
    # Retorna: lista de ResultadoCandidato
    # ---------------------------------------------------------
    @rpc(Integer, _returns=Iterable(ResultadoCandidato))
    def get_resultados_por_candidato(ctx, eleccion_id):
        conn = pymysql.connect(**DB_CONFIG)
        try:
            with conn.cursor() as cursor:
                # Total de votos para calcular porcentaje
                cursor.execute(
                    "SELECT COUNT(*) as total FROM votos WHERE eleccion_id = %s",
                    (eleccion_id,)
                )
                total_votos = cursor.fetchone()['total']

                cursor.execute("""
                    SELECT c.id, c.nombre, c.partido, c.numero_candidato,
                           COUNT(v.id) as total_votos
                    FROM candidatos c
                    LEFT JOIN votos v ON v.candidato_id = c.id
                    WHERE c.eleccion_id = %s AND c.activo = 1
                    GROUP BY c.id
                    ORDER BY total_votos DESC
                """, (eleccion_id,))

                filas = cursor.fetchall()

                for f in filas:
                    porcentaje = (f['total_votos'] / total_votos * 100) if total_votos > 0 else 0.0
                    yield ResultadoCandidato(
                        candidato_id=f['id'],
                        nombre=f['nombre'],
                        partido=f['partido'],
                        numero=f['numero_candidato'],
                        total_votos=f['total_votos'],
                        porcentaje=round(porcentaje, 2)
                    )
        except Exception as e:
            yield ResultadoCandidato(
                candidato_id=0,
                nombre=f'Error: {str(e)}',
                partido='',
                numero=0,
                total_votos=0,
                porcentaje=0.0
            )
        finally:
            conn.close()

    # ---------------------------------------------------------
    # Obtener el candidato ganador de una elección
    # Recibe: eleccion_id (int)
    # Retorna: ResultadoCandidato
    # ---------------------------------------------------------
    @rpc(Integer, _returns=ResultadoCandidato)
    def get_ganador(ctx, eleccion_id):
        conn = pymysql.connect(**DB_CONFIG)
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT c.id, c.nombre, c.partido, c.numero_candidato,
                           COUNT(v.id) as total_votos
                    FROM candidatos c
                    LEFT JOIN votos v ON v.candidato_id = c.id
                    WHERE c.eleccion_id = %s AND c.activo = 1
                    GROUP BY c.id
                    ORDER BY total_votos DESC
                    LIMIT 1
                """, (eleccion_id,))

                f = cursor.fetchone()
                if not f:
                    return ResultadoCandidato(
                        candidato_id=0, nombre='Sin candidatos',
                        partido='', numero=0, total_votos=0, porcentaje=0.0
                    )

                cursor.execute(
                    "SELECT COUNT(*) as total FROM votos WHERE eleccion_id = %s",
                    (eleccion_id,)
                )
                total_votos = cursor.fetchone()['total']
                porcentaje = (f['total_votos'] / total_votos * 100) if total_votos > 0 else 0.0

                return ResultadoCandidato(
                    candidato_id=f['id'],
                    nombre=f['nombre'],
                    partido=f['partido'],
                    numero=f['numero_candidato'],
                    total_votos=f['total_votos'],
                    porcentaje=round(porcentaje, 2)
                )
        except Exception as e:
            return ResultadoCandidato(
                candidato_id=0, nombre=f'Error: {str(e)}',
                partido='', numero=0, total_votos=0, porcentaje=0.0
            )
        finally:
            conn.close()


application = Application(
    [ResultadosOficialesService],
    tns='spyne.voto.resultados',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)

if __name__ == '__main__':
    wsgi_app = WsgiApplication(application)
    server = make_server('0.0.0.0', 8002, wsgi_app)
    print("--- Servicio SOAP: Resultados Oficiales LISTO ---")
    print("Escuchando en http://127.0.0.1:8002")
    print("WSDL en        http://127.0.0.1:8002/?wsdl")
    server.serve_forever()
