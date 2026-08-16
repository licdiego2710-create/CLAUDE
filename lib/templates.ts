export type TemplateType =
  | "providencia precautoria"
  | "embargo"
  | "remate"
  | "caducidad"
  | "desistimiento"
  | "revocación"
  | "oficio";

export type TemplateData = {
  antecedentes: string;
  fundamentos: string;
  resolutivos: string;
};

export const templateCatalog: Record<TemplateType, TemplateData> = {
  "providencia precautoria": {
    antecedentes:
      "Vista la solicitud de medida precautoria promovida por la parte actora, así como las constancias que obran en autos, se advierte la necesidad de preservar la materia del litigio.",
    fundamentos:
      "Con fundamento en la legislación mercantil aplicable, en los principios de tutela judicial efectiva y en las disposiciones relativas a medidas cautelares, este órgano jurisdiccional estima procedente dictar providencia precautoria.",
    resolutivos:
      "PRIMERO. Se decreta la providencia precautoria solicitada, en los términos y alcances precisados en este auto. SEGUNDO. Gírense los oficios correspondientes para su cumplimiento inmediato."
  },
  embargo: {
    antecedentes:
      "Atendiendo al estado procesal del expediente y a la solicitud de la parte interesada, se procede al análisis de la medida de embargo sobre bienes suficientes.",
    fundamentos:
      "Este juzgado es competente y actúa con sustento en los preceptos mercantiles que autorizan el embargo para garantizar el resultado del juicio y la eventual ejecución de sentencia.",
    resolutivos:
      "PRIMERO. Se ordena el embargo de bienes de la parte demandada hasta por la cantidad reclamada, más accesorios legales. SEGUNDO. Practíquese la diligencia con las formalidades de ley."
  },
  remate: {
    antecedentes:
      "Concluidas las etapas previas de ejecución y actualizados los avalúos respectivos, se encuentra el expediente en estado de acordar sobre la almoneda y remate.",
    fundamentos:
      "Con base en las reglas de ejecución mercantil y en las constancias de autos, resulta jurídicamente viable señalar fecha para la diligencia de remate.",
    resolutivos:
      "PRIMERO. Se señala fecha y hora para la audiencia de remate. SEGUNDO. Publíquense los edictos y notifíquese a las partes conforme a derecho."
  },
  caducidad: {
    antecedentes:
      "Del análisis de actuaciones se desprende inactividad procesal por el término legal previsto para la caducidad de la instancia.",
    fundamentos:
      "Al actualizarse los extremos de temporalidad y ausencia de impulso procesal, procede declarar la caducidad en términos de la normativa mercantil aplicable.",
    resolutivos:
      "PRIMERO. Se declara la caducidad de la instancia. SEGUNDO. Archívese el expediente como asunto total y definitivamente concluido, previas anotaciones de estilo."
  },
  desistimiento: {
    antecedentes:
      "Se tiene por presentada a la parte promovente manifestando su voluntad de desistirse de la acción y/o de la instancia.",
    fundamentos:
      "Verificada la legitimación y la capacidad procesal de quien comparece, así como la procedencia legal del acto de disposición, este juzgado estima viable proveer sobre el desistimiento.",
    resolutivos:
      "PRIMERO. Se tiene por desistida a la parte promovente en los términos de su escrito. SEGUNDO. Se ordena dar de baja el asunto y archivar previa firmeza legal."
  },
  "revocación": {
    antecedentes:
      "Se analiza el recurso de revocación interpuesto contra el proveído impugnado, así como los agravios expresados y constancias de autos.",
    fundamentos:
      "Con fundamento en la legislación mercantil que regula los medios de impugnación ordinarios, se determina la procedencia formal del recurso y su estudio de fondo.",
    resolutivos:
      "PRIMERO. Se admite y resuelve el recurso de revocación en los términos expuestos. SEGUNDO. Notifíquese a las partes y cúmplase."
  },
  oficio: {
    antecedentes:
      "Se estima necesario requerir información y/o colaboración institucional para la debida integración y cumplimiento de lo ordenado en autos.",
    fundamentos:
      "Este órgano jurisdiccional, en ejercicio de sus atribuciones de conducción procesal, puede librar oficio a autoridades y particulares en auxilio de la administración de justicia.",
    resolutivos:
      "PRIMERO. Líbrese oficio a la autoridad destinataria para que, dentro del plazo concedido, rinda el informe o practique la actuación solicitada. SEGUNDO. Agréguese respuesta a autos para los efectos legales conducentes."
  }
};
