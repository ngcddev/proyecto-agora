from flask import Flask, request, Response
from services.validador_votante import wsgi_validador
from services.resultados_oficiales import wsgi_resultados
import os

# pip install python-dotenv
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

def wsgi_to_flask(wsgi_app, path):
    """Adaptador para montar apps WSGI (Spyne) dentro de Flask"""
    def view():
        environ = request.environ.copy()
        environ['PATH_INFO'] = '/'
        
        response_started = {}
        body_parts = []

        def start_response(status, headers, exc_info=None):
            response_started['status'] = status
            response_started['headers'] = headers

        result = wsgi_app(environ, start_response)
        for data in result:
            body_parts.append(data)

        return Response(
            b''.join(body_parts),
            status=response_started.get('status', '200 OK'),
            headers=dict(response_started.get('headers', []))
        )
    
    view.__name__ = f'soap_{path}'
    return view

# Monta los dos servicios SOAP en rutas distintas
app.add_url_rule(
    '/soap/validador',
    view_func=wsgi_to_flask(wsgi_validador, 'validador'),
    methods=['GET', 'POST']
)

app.add_url_rule(
    '/soap/resultados',
    view_func=wsgi_to_flask(wsgi_resultados, 'resultados'),
    methods=['GET', 'POST']
)

@app.get('/health')
def health():
    return {'status': 'OK', 'servicios': ['validador_votante', 'resultados_oficiales']}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    print(f"🐍 SOAP Microservicio corriendo en http://localhost:{port}")
    print(f"   WSDL Validador  → http://localhost:{port}/soap/validador?wsdl")
    print(f"   WSDL Resultados → http://localhost:{port}/soap/resultados?wsdl")
    app.run(host='0.0.0.0', port=port, debug=True)