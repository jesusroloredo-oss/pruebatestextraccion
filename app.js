let datosTest = [];
let respuestasUsuario = {};

document.addEventListener("DOMContentLoaded", () => {
    fetch('preguntas.json')
        .then(response => response.json())
        .then(data => {
            datosTest = data;
            renderizarPreguntas();
            iniciarTemporizador(50 * 60);
        })
        .catch(error => console.error("Error cargando el test:", error));
});

function renderizarPreguntas() {
    const contenedor = document.getElementById('contenedor-preguntas');
    datosTest.forEach((item) => {
        const bloque = document.createElement('div');
        bloque.className = 'pregunta-bloque';
        bloque.id = `pregunta-${item.id}`;
        
        bloque.innerHTML = `
            <h3>${item.id}. ${item.pregunta}</h3>
            <div class="opciones">
                <label><input type="radio" name="p${item.id}" value="a" onchange="registrarRespuesta(${item.id}, 'a')"> a) ${item.opciones.a}</label>
                <label><input type="radio" name="p${item.id}" value="b" onchange="registrarRespuesta(${item.id}, 'b')"> b) ${item.opciones.b}</label>
                <label><input type="radio" name="p${item.id}" value="c" onchange="registrarRespuesta(${item.id}, 'c')"> c) ${item.opciones.c}</label>
            </div>
            <div class="retroalimentacion oculto" id="retro-${item.id}">
                <strong>Justificación:</strong> ${item.retroalimentacion}
            </div>
        `;
        contenedor.appendChild(bloque);
    });
}

function registrarRespuesta(idPregunta, respuesta) {
    respuestasUsuario[idPregunta] = respuesta;
}

function iniciarTemporizador(duracion) {
    let tiempo = duracion;
    const display = document.getElementById('temporizador');
    const intervalo = setInterval(() => {
        let minutos = parseInt(tiempo / 60, 10);
        let segundos = parseInt(tiempo % 60, 10);
        minutos = minutos < 10 ? "0" + minutos : minutos;
        segundos = segundos < 10 ? "0" + segundos : segundos;
        display.textContent = minutos + ":" + segundos;
        if (--tiempo < 0) {
            clearInterval(intervalo);
            finalizarTest();
        }
    }, 1000);
}

function finalizarTest() {
    let aciertos = 0, errores = 0, omitidas = 0;

    datosTest.forEach(item => {
        const respuestaDada = respuestasUsuario[item.id];
        const bloqueOpciones = document.querySelectorAll(`input[name="p${item.id}"]`);
        
        document.getElementById(`retro-${item.id}`).classList.remove('oculto');

        bloqueOpciones.forEach(radio => {
            radio.disabled = true;
            const label = radio.parentElement;
            if (radio.value === item.respuesta_correcta) {
                label.classList.add('correcta');
            } else if (radio.checked && radio.value !== item.respuesta_correcta) {
                label.classList.add('incorrecta');
            }
        });

        if (respuestaDada === item.respuesta_correcta) aciertos++;
        else if (respuestaDada) errores++;
        else omitidas++;
    });

    const notaFinal = aciertos - (errores / 2);
    const notaSobre10 = (notaFinal * 10) / datosTest.length;

    document.getElementById('puntuacion').innerHTML = `
        Aciertos: ${aciertos} <br>
        Errores: ${errores} <br>
        En blanco: ${omitidas} <br>
        <strong>Nota Final: ${notaSobre10.toFixed(2)} / 10</strong>
    `;
    
    document.getElementById('resultados').classList.remove('oculto');
    document.getElementById('btn-finalizar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
