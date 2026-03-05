// ── services/soapClient.js ───────────────────────────────
const axios = require('axios');
const { parseStringPromise } = require('xml2js');

const SOAP_VALIDADOR_URL  = process.env.SOAP_VALIDADOR_URL  || 'http://localhost:8001';
const SOAP_RESULTADOS_URL = process.env.SOAP_RESULTADOS_URL || 'http://localhost:8002';

// ── Helper: envía un SOAP request ─────────────────────────
async function soapRequest(baseUrl, tns, method, bodyXML) {
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap11env:Envelope
  xmlns:soap11env="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:tns="${tns}">
  <soap11env:Body>
    ${bodyXML}
  </soap11env:Body>
</soap11env:Envelope>`;

  const response = await axios.post(baseUrl, envelope, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    timeout: 8000,
  });

  return response.data;
}

// ── Helper: parsea el XML de respuesta SOAP ───────────────
async function parseSOAP(xml) {
  const result = await parseStringPromise(xml, {
    explicitArray:  false,
    ignoreAttrs:    true,
    tagNameProcessors: [
      // quita el prefijo de namespace  ej: "tns:nombre" → "nombre"
      (name) => name.replace(/^[^:]+:/, ''),
    ],
  });

  // Navega hasta el Body
  const envelope = result['Envelope'] || result['soap11env:Envelope'] || Object.values(result)[0];
  const body     = envelope['Body'] || Object.values(envelope)[0];

  // El primer hijo del Body es la respuesta
  const responseKey = Object.keys(body)[0];
  return body[responseKey];
}

// ── SOAP #1: Validar votante ──────────────────────────────
async function validarVotante(cedula, eleccionId) {
  const tns = 'spyne.voto.validador';
  const xml = await soapRequest(
    SOAP_VALIDADOR_URL,
    tns,
    'validar_votante',
    `<tns:validar_votante>
      <tns:cedula>${cedula}</tns:cedula>
      <tns:eleccion_id>${eleccionId}</tns:eleccion_id>
    </tns:validar_votante>`
  );
  const parsed = await parseSOAP(xml);
  const result = parsed.validar_votanteResult || parsed;
  // Normaliza booleano que viene como string desde XML
  return {
    habilitado: String(parsed.habilitado).toLowerCase() === 'true',
    mensaje:    parsed.mensaje   || '',
    nombre:     parsed.nombre    || '',
    cedula:     parsed.cedula    || cedula,
  };
}

// ── SOAP #1: Marcar voto emitido ──────────────────────────
async function marcarVotoEmitido(cedula) {
  const tns = 'spyne.voto.validador';
  const xml = await soapRequest(
    SOAP_VALIDADOR_URL,
    tns,
    'marcar_voto_emitido',
    `<tns:marcar_voto_emitido>
      <tns:cedula>${cedula}</tns:cedula>
    </tns:marcar_voto_emitido>`
  );

  const parsed = await parseSOAP(xml);
  const result = parsed.marcar_voto_emitidoResult || parsed;
  return { mensaje: result || '' };
}

// ── SOAP #2: Info de la elección ──────────────────────────
async function getInfoEleccion(eleccionId) {
  const tns = 'spyne.voto.resultados';
  const xml = await soapRequest(
    SOAP_RESULTADOS_URL,
    tns,
    'get_info_eleccion',
    `<tns:get_info_eleccion>
      <tns:eleccion_id>${eleccionId}</tns:eleccion_id>
    </tns:get_info_eleccion>`
  );

  return parseSOAP(xml);
}

// ── SOAP #2: Resultados por candidato ────────────────────
async function obtenerResultadosOficiales(eleccionId) {
  const tns = 'spyne.voto.resultados';
  const xml = await soapRequest(
    SOAP_RESULTADOS_URL,
    tns,
    'get_resultados_por_candidato',
    `<tns:get_resultados_por_candidato>
      <tns:eleccion_id>${eleccionId}</tns:eleccion_id>
    </tns:get_resultados_por_candidato>`
  );

  const parsed = await parseSOAP(xml);

  const result = parsed.get_resultados_por_candidatoResult || parsed;
  const items  = result?.ResultadoCandidato || result?.item || result || [];
  const arr    = Array.isArray(items) ? items : [items];

  return arr.map(item => ({
    candidato_id: parseInt(item.candidato_id) || 0,
    nombre:       item.nombre    || '',
    partido:      item.partido   || '',
    numero:       parseInt(item.numero) || 0,
    total_votos:  parseInt(item.total_votos) || 0,
    porcentaje:   parseFloat(item.porcentaje) || 0,
  }));
}

// ── SOAP #2: Ganador ──────────────────────────────────────
async function getGanador(eleccionId) {
  const tns = 'spyne.voto.resultados';
  const xml = await soapRequest(
    SOAP_RESULTADOS_URL,
    tns,
    'get_ganador',
    `<tns:get_ganador>
      <tns:eleccion_id>${eleccionId}</tns:eleccion_id>
    </tns:get_ganador>`
  );

  return parseSOAP(xml);
}

module.exports = {
  validarVotante,
  marcarVotoEmitido,
  obtenerResultadosOficiales,
  getInfoEleccion,
  getGanador,
};