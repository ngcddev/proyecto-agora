from spyne import Application, rpc, ServiceBase, Unicode, Integer, Array, ComplexModel
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication

class ResultadoCandidato(ComplexModel):
    candidato_id   = Integer
    nombre         = Unicode
    partido        = Unicode
    numero         = Integer
    total_votos    = Integer
    porcentaje     = Unicode

class RespuestaResultados(ComplexModel):
    eleccion_id    = Integer
    titulo         = Unicode
    total_votos    = Integer
    estado         = Unicode
    resultados     = Array(ResultadoCandidato)

class ResultadosOficialesService(ServiceBase):
    """
    SOAP #2 — Expone resultados oficiales de una elección para auditoría
    Puede ser consumido por sistemas externos de verificación electoral
    """

    @rpc(Integer, _returns=RespuestaResultados)
    def obtener_resultados(ctx, eleccion_id):
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

            # Info de la elección
            cursor.execute(
                "SELECT id, titulo, estado FROM elecciones WHERE id = %s", 
                (eleccion_id,)
            )
            eleccion = cursor.fetchone()

            if not eleccion:
                conn.close()
                return RespuestaResultados(
                    eleccion_id=eleccion_id,
                    titulo='No encontrada',
                    total_votos=0,
                    estado='error',
                    resultados=[]
                )

            # Votos por candidato
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

            total_votos = sum(f['total_votos'] for f in filas)

            resultados = []
            for f in filas:
                porcentaje = (f['total_votos'] / total_votos * 100) if total_votos > 0 else 0
                resultados.append(ResultadoCandidato(
                    candidato_id=f['id'],
                    nombre=f['nombre'],
                    partido=f['partido'],
                    numero=f['numero_candidato'],
                    total_votos=f['total_votos'],
                    porcentaje=f"{porcentaje:.2f}%"
                ))

            conn.close()
            return RespuestaResultados(
                eleccion_id=eleccion['id'],
                titulo=eleccion['titulo'],
                total_votos=total_votos,
                estado=eleccion['estado'],
                resultados=resultados
            )

        except Exception as e:
            return RespuestaResultados(
                eleccion_id=eleccion_id,
                titulo='Error',
                total_votos=0,
                estado=f'error: {str(e)}',
                resultados=[]
            )


resultados_app = Application(
    [ResultadosOficialesService],
    tns='http://voto.electronico.soap/resultados',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)

wsgi_resultados = WsgiApplication(resultados_app)