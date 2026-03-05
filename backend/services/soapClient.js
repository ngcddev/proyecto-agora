const axios = require('axios');

const SOAP_URL = process.env.SOAP_SERVICE_URL || 'http://localhost:8000';

// Construye el envelope SOAP y llama al microservicio Python
async function llamarSOAP(endpoint, action, bodyXML) {
  const envelope = `
    <?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope
      xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:tns="${action.namespace}">
      <soap:Body>
        ${bodyXML}
      </soap:Body>
    </soap:Envelope>
  `;

  const response = await axios.post(`${SOAP_URL}${endpoint}`, envelope, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': action.name,
    },
  });

  return response.data;
}

// Parsea la respuesta XML a objeto JS
function parsearRespuestaSOAP(xml, campo) {
  const { parseStringPromise } = require('xml2js');
  return parseStringPromise(xml, { explicitArray: false, ignoreAttrs: true })
    .then(result => {
      const body = result['soap:Envelope']['soap:Body'];
      return body;
    });
}

async function validarVotante(cedula, eleccionId) {
  const bodyXML = `
    <tns:validar_votante xmlns:tns="http://voto.electronico.soap/validador">
      <tns:cedula>${cedula}</tns:cedula>
      <tns:eleccion_id>${eleccionId}</tns:eleccion_id>
    </tns:validar_votante>
  `;

  const xml = await llamarSOAP('/soap/validador', {
    namespace: 'http://voto.electronico.soap/validador',
    name: 'validar_votante',
  }, bodyXML);

  return parsearRespuestaSOAP(xml);
}

async function obtenerResultadosOficiales(eleccionId) {
  const bodyXML = `
    <tns:obtener_resultados xmlns:tns="http://voto.electronico.soap/resultados">
      <tns:eleccion_id>${eleccionId}</tns:eleccion_id>
    </tns:obtener_resultados>
  `;

  const xml = await llamarSOAP('/soap/resultados', {
    namespace: 'http://voto.electronico.soap/resultados',
    name: 'obtener_resultados',
  }, bodyXML);

  return parsearRespuestaSOAP(xml);
}

module.exports = { validarVotante, obtenerResultadosOficiales };