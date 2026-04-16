function mostrarPestana(id) {
    // Ocultar todas
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.main-nav button').forEach(btn => btn.classList.remove('active'));
    
    // Mostrar la seleccionada
    document.getElementById(`p_${id}`).classList.add('active');
    document.getElementById(`btn-${id}`).classList.add('active');
}

// Asegurar que inicie en calculadora al cargar
window.addEventListener('load', () => {
    dibujarMatriz();
    mostrarPestana('calculadora');
});

// --- Lógica de Navegación ---
function mostrarPestana(id) {
    // 1. Ocultar todo el contenido de las pestañas
    const contenidos = document.querySelectorAll('.tab-content');
    contenidos.forEach(c => c.classList.remove('active'));

    // 2. Quitar la clase 'active' de todos los botones
    const botones = document.querySelectorAll('.main-nav button');
    botones.forEach(b => b.classList.remove('active'));

    // 3. Mostrar la pestaña seleccionada
    document.getElementById(`p_${id}`).classList.add('active');

    // 4. Activar el botón correspondiente
    document.getElementById(`btn-${id}`).classList.add('active');
}

// Opcional: Para que la calculadora esté activa al cargar
window.onload = function() {
    dibujarMatriz(); // Esta función ya la tienes, para dibujar la matriz inicial
    mostrarPestana('calculadora'); 
};
let n = 3; // Dimensión inicial por defecto (3x3)

// Se ejecuta al cargar la página para dibujar la matriz inicial
window.onload = function() {
    dibujarMatriz();
};

function cambiarTamano(cambio) {
    if (n + cambio >= 2 && n + cambio <= 8) { // Límite de 2 a 8 variables
        n += cambio;
        document.getElementById('dimension-label').innerText = `${n} x ${n}`;
        dibujarMatriz();
        document.getElementById('results-container').style.display = 'none';
        document.getElementById('alerts').innerHTML = '';
    }
}

function dibujarMatriz() {
    const container = document.getElementById('matrix-container');
    container.innerHTML = '';
    
    // Configurar columnas: n columnas para variables, 1 para el '=', 1 para el resultado
    container.style.gridTemplateColumns = `repeat(${n}, 1fr) auto 1fr`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            container.innerHTML += `<input type="number" id="a${i}${j}" placeholder="x${j+1}" step="any">`;
        }
        container.innerHTML += `<span>=</span>`;
        container.innerHTML += `<input type="number" id="b${i}" placeholder="d${i+1}" step="any">`;
    }
}

function limpiarTodo() {
    dibujarMatriz(); // Recrea la matriz limpiando los valores
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('alerts').innerHTML = '';
    // Restablecer valores por defecto de configuración
    document.getElementById('tol').value = '0.000001';
    document.getElementById('maxIter').value = '100';
}

function esDominanteDiagonal(A) {
    for (let i = 0; i < n; i++) {
        let sumaOtros = 0;
        for (let j = 0; j < n; j++) {
            if (j !== i) sumaOtros += Math.abs(A[i][j]);
        }
        if (Math.abs(A[i][i]) <= sumaOtros) return false;
    }
    return true;
}

function resolverGaussSeidel() {
    let alertsDiv = document.getElementById('alerts');
    alertsDiv.innerHTML = ""; 

    let A = [];
    let b = [];
    let estaVacio = true;

    // Leer valores de la matriz
    for (let i = 0; i < n; i++) {
        let fila = [];
        for (let j = 0; j < n; j++) {
            let valor = document.getElementById(`a${i}${j}`).value;
            if (valor !== "") estaVacio = false;
            fila.push(parseFloat(valor) || 0); // Si está vacío, asume 0 para cálculos parciales
        }
        A.push(fila);
        
        let valorB = document.getElementById(`b${i}`).value;
        if (valorB !== "") estaVacio = false;
        b.push(parseFloat(valorB) || 0);
    }

    // Validación 1: Verificar si el usuario no puso NADA
    if (estaVacio) {
        alertsDiv.innerHTML = "❌ Error: No has ingresado ningún valor. Llena la matriz para comenzar.";
        return;
    }

    // Validación 2: Verificar ceros en la diagonal
    for (let i = 0; i < n; i++) {
        if (A[i][i] === 0) {
            alertsDiv.innerHTML = `❌ Error: El elemento en la diagonal principal (x${i+1} de la ecuación ${i+1}) no puede ser 0. Reordena tus ecuaciones.`;
            return;
        }
    }

    if (!esDominanteDiagonal(A)) {
        alertsDiv.innerHTML = "⚠️ Advertencia: La matriz NO es diagonalmente dominante. El método podría no converger.";
    }

    let tol = parseFloat(document.getElementById('tol').value) || 0.000001;
    let maxIter = parseInt(document.getElementById('maxIter').value) || 100;
    
    let x = new Array(n).fill(0); // Vector inicial de ceros
    let tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = ''; 
    
    // Generar encabezados de la tabla dinámicamente
    let theadRow = `<tr><th>Iteración</th>`;
    for(let i = 0; i < n; i++) theadRow += `<th>x${i+1}</th>`;
    theadRow += `<th>Error</th></tr>`;
    document.querySelector('#results-table thead').innerHTML = theadRow;

    // Iteraciones
    for (let k = 0; k < maxIter; k++) {
        let x_viejo = [...x];
        let errorMaximo = 0;

        for (let i = 0; i < n; i++) {
            let suma = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) suma += A[i][j] * x[j];
            }
            x[i] = (b[i] - suma) / A[i][i];
        }

        for (let i = 0; i < n; i++) {
            let errorActual = Math.abs(x[i] - x_viejo[i]);
            if (errorActual > errorMaximo) errorMaximo = errorActual;
        }

        // Agregar fila (Empezando la impresión en la iteración 0 como pediste)
        let row = `<tr><td>${k}</td>`;
        for(let i = 0; i < n; i++) row += `<td>${x[i].toFixed(6)}</td>`;
        row += `<td>${errorMaximo.toFixed(6)}</td></tr>`;
        tbody.insertAdjacentHTML('beforeend', row);

        if (errorMaximo < tol) break;
    }

    // Mostrar resultados
    document.getElementById('results-container').style.display = 'block';
    
    let resultHTML = `<strong>Solución Aproximada:</strong><br>`;
    for(let i = 0; i < n; i++) resultHTML += `x${i+1} = ${x[i].toFixed(6)}<br>`;
    document.getElementById('final-solution').innerHTML = resultHTML;
}