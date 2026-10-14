import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    addDoc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyA-l6E23L2X7knfjX2fVIKal6jEhq_drMk",

    authDomain:
        "registro-vehicular-683c2.firebaseapp.com",

    projectId:
        "registro-vehicular-683c2",

    storageBucket:
        "registro-vehicular-683c2.firebasestorage.app",

    messagingSenderId:
        "442261830928",

    appId:
        "1:442261830928:web:b348fdc740b988642c7995"
};

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

/* =========================================================
   ELEMENTOS
========================================================= */

const loading =
document.getElementById("loading");

const errorBox =
document.getElementById("errorBox");

const errorTexto =
document.getElementById("errorTexto");

const modalRegistro =
document.getElementById("modalRegistro");

const nombreVisitante =
document.getElementById("nombreVisitante");

const telefonoVisitante =
document.getElementById("telefonoVisitante");

const btnRegistrarVisitante =
document.getElementById("btnRegistrarVisitante");

const mensajeModal =
document.getElementById("mensajeModal");

const tarjeta =
document.getElementById("tarjeta");

const nombreHTML =
document.getElementById("nombre");

const cargoHTML =
document.getElementById("cargo");

const videoSection =
document.getElementById("videoSection");

const videoContainer =
document.getElementById("videoContainer");

const btnGuardarContacto =
document.getElementById("btnGuardarContacto");

const btnWeb =
document.getElementById("btnWeb");

const btnWhatsApp =
document.getElementById("btnWhatsApp");

/* =========================================================
   VARIABLES GLOBALES
========================================================= */

let dniGlobal =
"";

let empresaGlobal =
"";

let dataTarjetaGlobal =
null;

/* =========================================================
   FECHA Y HORA PERÚ
========================================================= */

function obtenerFecha(){

    return new Date()
    .toLocaleDateString(
        "es-PE",
        {
            timeZone:
                "America/Lima",

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
        }
    );
}

function obtenerHora(){

    return new Date()
    .toLocaleTimeString(
        "es-PE",
        {
            timeZone:
                "America/Lima",

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit"
        }
    );
}

/* =========================================================
   OBTENER DNI DESDE URL
   Acepta:
   tarjeta/index.html?dni=12345678
   tarjeta/?dni=12345678
   tarjeta/12345678
========================================================= */

function obtenerDniDesdeUrl(){

    const params =
    new URLSearchParams(
        window.location.search
    );

    if(
        params.has("dni")
    ){

        return params
        .get("dni")
        .replace(/\D/g,"")
        .trim();
    }

    const path =
    decodeURIComponent(
        window.location.pathname
    );

    const partes =
    path
    .split("/")
    .filter(Boolean);

    let dni =
    partes[partes.length - 1] || "";

    if(
        dni === "index.html" ||
        dni.toLowerCase() === "tarjeta de presentacion" ||
        dni.toLowerCase() === "tarjeta-de-presentacion"
    ){

        dni =
        "";
    }

    return dni
    .replace(/\D/g,"")
    .trim();
}

/* =========================================================
   MOSTRAR ERROR
========================================================= */

function mostrarError(texto){

    loading.classList.add("oculto");

    modalRegistro.classList.add("oculto");

    tarjeta.classList.add("oculto");

    btnWhatsApp.classList.add("oculto");

    errorBox.classList.remove("oculto");

    errorTexto.textContent =
    texto;
}

/* =========================================================
   NORMALIZAR TELÉFONO
========================================================= */

function normalizarTelefono(telefono){

    return String(
        telefono || ""
    )
    .replace(/\D/g,"")
    .trim();
}

function telefonoConCodigoPeru(telefono){

    const limpio =
    normalizarTelefono(
        telefono
    );

    if(
        !limpio
    ){

        return "";
    }

    if(
        limpio.startsWith("51") &&
        limpio.length >= 11
    ){

        return limpio;
    }

    return `51${limpio}`;
}

/* =========================================================
   CONVERTIR LINK YOUTUBE A EMBED
========================================================= */

function convertirYoutubeEmbed(url){

    if(
        !url
    ){

        return "";
    }

    try{

        const link =
        new URL(url);

        let videoId =
        "";

        if(
            link.hostname.includes("youtube.com")
        ){

            videoId =
            link.searchParams.get("v");
        }

        if(
            link.hostname.includes("youtu.be")
        ){

            videoId =
            link.pathname
            .replace("/", "");
        }

        if(
            !videoId
        ){

            return url;
        }

        return `
            https://www.youtube.com/embed/${videoId}
        `.trim();

    }
    catch(error){

        return url;
    }
}

/* =========================================================
   MOSTRAR VIDEO
========================================================= */

function mostrarVideo(video){

    if(
        !video
    ){

        videoSection.classList.add("oculto");

        return;
    }

    const videoEmbed =
    convertirYoutubeEmbed(
        video
    );

    if(
        videoEmbed.includes("youtube.com/embed")
    ){

        videoContainer.innerHTML = `

            <iframe
                src="${videoEmbed}"
                title="Video de presentación"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>

        `;
    }
    else{

        videoContainer.innerHTML = `

            <video
                controls
                playsinline>

                <source
                    src="${videoEmbed}"
                    type="video/mp4">

                Tu navegador no soporta video.

            </video>

        `;
    }

    videoSection.classList.remove("oculto");
}

/* =========================================================
   ABRIR TELÉFONO
========================================================= */

function abrirTelefono(telefono){

    const limpio =
    normalizarTelefono(
        telefono
    );

    if(
        !limpio
    ){

        alert(
            "No hay número telefónico registrado."
        );

        return;
    }

    window.location.href =
    `tel:${limpio}`;
}

/* =========================================================
   ABRIR SITIO WEB
========================================================= */

function abrirWeb(web){

    if(
        !web
    ){

        alert(
            "No hay sitio web registrado."
        );

        return;
    }

    let url =
    web.trim();

    if(
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ){

        url =
        `https://${url}`;
    }

    window.open(
        url,
        "_blank"
    );
}

/* =========================================================
   ABRIR WHATSAPP
========================================================= */

function abrirWhatsApp(telefono){

    const numero =
    telefonoConCodigoPeru(
        telefono
    );

    if(
        !numero
    ){

        alert(
            "No hay WhatsApp registrado."
        );

        return;
    }

    const mensaje =
    encodeURIComponent(
        "Hola, me gustaría que me ayude."
    );

    window.open(
        `https://wa.me/${numero}?text=${mensaje}`,
        "_blank"
    );
}

/* =========================================================
   MOSTRAR MODAL DE REGISTRO
========================================================= */

function mostrarModalRegistro(){

    loading.classList.add("oculto");

    errorBox.classList.add("oculto");

    tarjeta.classList.add("oculto");

    btnWhatsApp.classList.add("oculto");

    modalRegistro.classList.remove("oculto");

    setTimeout(()=>{

        nombreVisitante.focus();

    },200);
}

/* =========================================================
   PINTAR TARJETA
========================================================= */

function pintarTarjeta(){

    const data =
    dataTarjetaGlobal;

    nombreHTML.textContent =
    data.nombre || "Sin nombre";

    cargoHTML.textContent =
    data.cargo || "Sin cargo";

    mostrarVideo(
        data.video
    );

    btnGuardarContacto.onclick =
    ()=>{

        abrirTelefono(
            data.telefono
        );
    };

    btnWeb.onclick =
    ()=>{

        abrirWeb(
            data.web
        );
    };

    btnWhatsApp.onclick =
    ()=>{

        abrirWhatsApp(
            data.telefono
        );
    };

    loading.classList.add("oculto");

    errorBox.classList.add("oculto");

    modalRegistro.classList.add("oculto");

    tarjeta.classList.remove("oculto");

    btnWhatsApp.classList.remove("oculto");
}

/* =========================================================
   GUARDAR VISITANTE
   Guarda en:
   datos_registrados / empresa / registros / dni / visitas / id
========================================================= */

btnRegistrarVisitante.addEventListener(
    "click",
    guardarVisitante
);

async function guardarVisitante(){

    try{

        const nombre =
        nombreVisitante
        .value
        .trim();

        const telefono =
        normalizarTelefono(
            telefonoVisitante.value
        );

        if(
            !nombre ||
            !telefono
        ){

            throw new Error(
                "Ingrese su nombre y teléfono."
            );
        }

        if(
            telefono.length < 9
        ){

            throw new Error(
                "Ingrese un número de teléfono válido."
            );
        }

        if(
            !dniGlobal ||
            !empresaGlobal ||
            !dataTarjetaGlobal
        ){

            throw new Error(
                "No se pudo identificar la tarjeta escaneada."
            );
        }

        btnRegistrarVisitante.disabled =
        true;

        btnRegistrarVisitante.innerHTML =
        "Guardando...";

        mensajeModal.textContent =
        "";

        const fecha =
        obtenerFecha();

        const hora =
        obtenerHora();

        /* =====================================================
           1. CREAR / ACTUALIZAR EMPRESA

           Ruta:
           datos_registrados / empresa
        ===================================================== */

        await setDoc(
            doc(
                db,
                "datos_registrados",
                empresaGlobal
            ),
            {

                nombre_empresa:
                    empresaGlobal,

                fecha_actualizacion:
                    `${fecha} ${hora}`
            },
            {
                merge:
                    true
            }
        );

        /* =====================================================
           2. CREAR / ACTUALIZAR DOCUMENTO DEL DNI ESCANEADO

           Ruta:
           datos_registrados / empresa / registros / dni
        ===================================================== */

        await setDoc(
            doc(
                db,
                "datos_registrados",
                empresaGlobal,
                "registros",
                dniGlobal
            ),
            {

                empresa:
                    empresaGlobal,

                dniVisitado:
                    dniGlobal,

                nombreTarjeta:
                    dataTarjetaGlobal.nombre || "",

                cargoTarjeta:
                    dataTarjetaGlobal.cargo || "",

                telefonoTarjeta:
                    dataTarjetaGlobal.telefono || "",

                webTarjeta:
                    dataTarjetaGlobal.web || "",

                videoTarjeta:
                    dataTarjetaGlobal.video || "",

                fecha_actualizacion:
                    `${fecha} ${hora}`
            },
            {
                merge:
                    true
            }
        );

        /* =====================================================
           3. GUARDAR VISITA DEL CLIENTE

           Ruta:
           datos_registrados / empresa / registros / dni / visitas / id
        ===================================================== */

        await addDoc(
            collection(
                db,
                "datos_registrados",
                empresaGlobal,
                "registros",
                dniGlobal,
                "visitas"
            ),
            {

                empresa:
                    empresaGlobal,

                dniVisitado:
                    dniGlobal,

                nombreTarjeta:
                    dataTarjetaGlobal.nombre || "",

                cargoTarjeta:
                    dataTarjetaGlobal.cargo || "",

                telefonoTarjeta:
                    dataTarjetaGlobal.telefono || "",

                nombreVisitante:
                    nombre,

                telefonoVisitante:
                    telefono,

                fecha:
                    fecha,

                hora:
                    hora,

                fecha_peru:
                    `${fecha} ${hora}`
            }
        );

        pintarTarjeta();

    }
    catch(error){

        console.error(error);

        mensajeModal.textContent =
        error.message;

        btnRegistrarVisitante.disabled =
        false;

        btnRegistrarVisitante.innerHTML =
        "Continuar";
    }
}

/* =========================================================
   CARGAR TARJETA
========================================================= */

async function cargarTarjeta(){

    try{

        const dni =
        obtenerDniDesdeUrl();

        dniGlobal =
        dni;

        if(
            !dni
        ){

            mostrarError(
                "No se recibió ningún DNI en el enlace del QR."
            );

            return;
        }

        if(
            dni.length !== 8
        ){

            mostrarError(
                "El código QR no contiene un DNI válido."
            );

            return;
        }

        /* ============================
           BUSCAR EN ÍNDICE
        ============================ */

        const indiceRef =
        doc(
            db,
            "indice_tarjetas",
            dni
        );

        const indiceSnap =
        await getDoc(
            indiceRef
        );

        if(
            !indiceSnap.exists()
        ){

            mostrarError(
                "No existe una tarjeta registrada con este DNI."
            );

            return;
        }

        const indiceData =
        indiceSnap.data();

        const empresaNombre =
        indiceData.empresa;

        if(
            !empresaNombre
        ){

            mostrarError(
                "La tarjeta no tiene empresa asociada en el índice."
            );

            return;
        }

        empresaGlobal =
        empresaNombre;

        /* ============================
           BUSCAR DATOS COMPLETOS
        ============================ */

        const tarjetaRef =
        doc(
            db,
            "tarjetas_presentacion",
            empresaNombre,
            "tarjetas",
            dni
        );

        const tarjetaSnap =
        await getDoc(
            tarjetaRef
        );

        if(
            !tarjetaSnap.exists()
        ){

            mostrarError(
                "La tarjeta existe en el índice, pero no se encontraron sus datos completos."
            );

            return;
        }

        dataTarjetaGlobal =
        tarjetaSnap.data();

        mostrarModalRegistro();

    }
    catch(error){

        console.error(error);

        mostrarError(
            "Ocurrió un error al cargar la tarjeta."
        );
    }
}

/* =========================================================
   ENTER PARA GUARDAR
========================================================= */

nombreVisitante.addEventListener(
    "keydown",
    (e)=>{

        if(
            e.key === "Enter"
        ){

            telefonoVisitante.focus();
        }
    }
);

telefonoVisitante.addEventListener(
    "keydown",
    (e)=>{

        if(
            e.key === "Enter"
        ){

            guardarVisitante();
        }
    }
);

/* =========================================================
   INICIO
========================================================= */

cargarTarjeta();