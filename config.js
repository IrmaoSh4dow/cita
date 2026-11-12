/* Yincana — configuración
   Edita solo este archivo para preparar la aventura.

   Respuestas (`answer`):
   - Escríbelas tú. Aquí quedan vacías a propósito.
   - No distinguen mayúsculas de minúsculas.
   - Se ignoran los espacios al principio y al final.
   - Los espacios internos sí importan.
   - Una respuesta vacía nunca se acepta.
   - Puede ser una palabra o una frase corta.
   - No incluyas signos de puntuación, salvo que quieras exigirlos.

   Galería:
   - Las fotos van en la raíz del sitio, o en `photos/`.
   - La mayoría serán verticales, como un post de Instagram (4:5).
   - Ejemplo: src: "uno.jpg"
   - `caption` es la frase de esa fotografía. Si la dejas vacía, no se muestra.
   - `alt` describe la imagen para quien no pueda verla.
   - Puedes borrar o duplicar entradas de `items`.

   El progreso se guarda en este navegador con `storageKey`.
   Para empezar de nuevo, borra esa clave en los datos del sitio.
*/
window.CITA_CONFIG = {
  storageKey: "valentina-yincana",
  documentTitle: "Para Valentina",
  identity: "Para Valentina",

  intro: {
    title: "Una pequeña aventura",
    salutation: "Valentina,",
    paragraphs: [
      "Hay cuatro lugares que guardan algo nuestro. Quiero que los recorras conmigo.",
      "Yo te iré haciendo preguntas y si respondes bien tendrás la palabra. Escribe aquí cada respuesta y, si es la correcta, encontrarás el camino hacia el siguiente lugar.",
      "Tómate el tiempo que necesites. Te espero.",
    ],
    button: "Comenzar",
  },

  puzzle: {
    title: "Escribe la palabra",
    lead: "La palabra.",
    placeholder: "Escríbela aquí",
    button: "Revelar la pista",
    back: "Ver la pista anterior",
  },

  feedback: {
    incorrect: "No es esa palabra. Puedes intentarlo otra vez, sin prisa.",
  },

  reveal: {
    note: "Hay que ponerse en marcha.",
    button: "Ya tengo la siguiente palabra.",
    finalNote: "Cuando estés en ese lugar, podrás abrir lo que dejé para el final.",
    finalButton: "Ya estoy aquí",
  },

  stages: [
    {
      title: "Nuestro dulce hogar",
      answer: "PITUKA",
      confirmation: "Sí. Quédate con esta carta.",
      clue: "Hay un lugar que no necesita grandes lujos para sentirse especial. Es ese pequeño rincón donde el mundo parece quedarse afuera y donde, si estoy contigo, cualquier lugar se convierte en hogar. Busca el sitio que lleva nuestro nombre, porque allí comienza esta pequeña aventura.",
    },
    {
      title: "Nuestro primer beso",
      answer: "VICTOR",
      confirmation: "Era esa. Sigue leyendo, con calma.",
      clue: "Hay momentos que el tiempo no consigue borrar, aunque pasen los días y cambien las estaciones. Entre todos los lugares de esta ciudad, hay uno que guarda el recuerdo de dos personas que dejaron de mirarse como antes. Vuelve al lugar donde nuestros labios contaron lo que las palabras todavía no se atrevían a decir.",
    },
    {
      title: "Esa casa en el árbol",
      answer: "ALANA",
      confirmation: "Lo has encontrado. Hay otro rincón que quiero mostrarte.",
      clue: "Dicen que los mejores refugios no siempre tienen paredes, y que algunos de los lugares más especiales están lejos del ruido de la ciudad. Hay un rincón entre las ramas que parece sacado de nuestra propia historia. Busca nuestro pequeño escondite, ese lugar donde hasta el cielo parece estar más cerca.",
    },
    {
      title: "El observatorio",
      answer: "TE AMO",
      confirmation: "Sí. Esta es la última pista.",
      clue: "Hemos recorrido calles, encontrado refugios y guardado recuerdos. Pero ahora quiero que mires un poco más allá. Busca ese lugar desde donde la ciudad parece pequeña y las luces cuentan miles de historias. Allí, bajo el cielo que nos ha acompañado tantas veces, nos espera el último destino de esta aventura.",
    },
  ],

  gallery: {
    kicker: "",
    title: "Galería de nuestro recorrido",
    restart: "Volver a empezar",
    pendingImage: "Aquí quedará una fotografía",
    empty: "Todavía no hay fotografías.",
    items: [
      { src: "uno.png", alt: "", caption: "" },
      { src: "dos.png", alt: "", caption: "" },
      { src: "tres.png", alt: "", caption: "" },
      { src: "cuatro.png", alt: "", caption: "" },
      { src: "cinco.png", alt: "", caption: "" },
      { src: "seis.png", alt: "", caption: "" },
      { src: "siete.png", alt: "", caption: "" },
      { src: "ocho.png", alt: "", caption: "" },
    ],
  },
};
