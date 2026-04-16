let n = 3; // Dimensión inicial

// Lógica de Navegación
function mostrarPestana(id) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.main-nav button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`p_${id}`).classList.add('active');
    document.getElementById(`btn-${id}`).classList.add('active');
}

window.addEventListener('load', () => {
    dibujarMatriz();
    mostrarPestana('calculadora');
});

// Lógica de la Calculadora
function cambiarTamano(cambio) {
    if (n + cambio >= 2 && n + cambio <= 8) { 
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
    dibujarMatriz(); 
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('alerts').innerHTML = '';
    // Restablecer al 8% de error como en tu ejercicio
    document.getElementById('tol').value = '8';
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

    for (let i = 0; i < n; i++) {
        let fila = [];
        for (let j = 0; j < n; j++) {
            let valor = document.getElementById(`a${i}${j}`).value;
            if (valor !== "") estaVacio = false;
            fila.push(parseFloat(valor) || 0); 
        }
        A.push(fila);
        
        let valorB = document.getElementById(`b${i}`).value;
        if (valorB !== "") estaVacio = false;
        b.push(parseFloat(valorB) || 0);
    }

    if (estaVacio) {
        alertsDiv.innerHTML = "¡Hey! No has ingresado ningún valor. Llena la matriz para comenzar.";
        return;
    }

    for (let i = 0; i < n; i++) {
        if (A[i][i] === 0) {
            alertsDiv.innerHTML = `Error: El elemento en la diagonal principal (x${i+1} de la ecuación ${i+1}) no puede ser 0.`;
            return;
        }
    }

    if (!esDominanteDiagonal(A)) {
        alertsDiv.innerHTML = "Advertencia: La matriz NO es diagonalmente dominante. El método podría no converger.";
    }

    // Ahora la tolerancia se lee como Porcentaje (ej. 8 significa 8%)
    let tol = parseFloat(document.getElementById('tol').value) || 0.000001;
    let maxIter = parseInt(document.getElementById('maxIter').value) || 100;
    
    let x = new Array(n).fill(0); 
    let tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = ''; 
    
    // 1. ENCABEZADOS CON SIMBOLO DE PORCENTAJE
    let theadRow = `<tr><th>Iteración</th>`;
    for(let i = 0; i < n; i++) theadRow += `<th>x${i+1}</th>`;
    for(let i = 0; i < n; i++) {
        // En tu cuaderno dice %x1, %x2... lo replicamos igual
        theadRow += `<th>% x${i+1}</th>`; 
    }
    theadRow += `<th>% Error Máx</th></tr>`;
    document.querySelector('#results-table thead').innerHTML = theadRow;

    // 2. IMPRIMIR ITERACIÓN CERO (Valores iniciales)
    let row0 = `<tr><td>0</td>`;
    for(let i = 0; i < n; i++) row0 += `<td>0.0000</td>`;
    for(let i = 0; i < n; i++) row0 += `<td>---</td>`;
    row0 += `<td>---</td></tr>`;
    tbody.insertAdjacentHTML('beforeend', row0);

    // 3. CICLO DE ITERACIONES (Empezando en 1)
    for (let k = 1; k <= maxIter; k++) {
        let x_viejo = [...x];
        let errorMaximo = 0;
        let erroresIndividuales = new Array(n).fill(0); 
        let errorMinimo = 1000000; // Para revisar si ALGUN error bajó de la tolerancia

        // Cálculo de nuevas variables
        for (let i = 0; i < n; i++) {
            let suma = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) suma += A[i][j] * x[j];
            }
            x[i] = (b[i] - suma) / A[i][i];
        }

        // Cálculo de errores PORCENTUALES RELATIVOS
        for (let i = 0; i < n; i++) {
            let errorActual = 0;
            
            if (k === 1) {
                // Iteración 1 siempre es 100% de error según tu cuaderno
                errorActual = 100; 
            } else if (x[i] !== 0) {
                // Fórmula de error relativo porcentual: |(nuevo - viejo) / nuevo| * 100
                errorActual = Math.abs((x[i] - x_viejo[i]) / x[i]) * 100;
            }

            erroresIndividuales[i] = errorActual;
            
            if (errorActual > errorMaximo) errorMaximo = errorActual;
            if (errorActual < errorMinimo) errorMinimo = errorActual;
        }

        // Imprimir fila en la tabla
        let row = `<tr><td>${k}</td>`;
        for(let i = 0; i < n; i++) row += `<td>${x[i].toFixed(4)}</td>`;
        
        for(let i = 0; i < n; i++) {
            row += `<td>${erroresIndividuales[i].toFixed(2)}%</td>`;
        }
        
        row += `<td>${errorMaximo.toFixed(2)}%</td></tr>`;
        tbody.insertAdjacentHTML('beforeend', row);

        // CONDICIÓN DE PARADA:
        // En tu cuaderno dice "hasta que alguna de las incognitas obtenga el 8% de error"
        // Evaluamos si el error más pequeño (alguna) ya es menor a la tolerancia
        if (errorMinimo < tol) {
            break; 
        }
    }

    // 4. MOSTRAR RESULTADO FINAL
    document.getElementById('results-container').style.display = 'block';
    
    let resultHTML = `<strong>Solución Aproximada:</strong><br>`;
    for(let i = 0; i < n; i++) resultHTML += `x${i+1} = ${x[i].toFixed(4)}<br>`;
    document.getElementById('final-solution').innerHTML = resultHTML;

    // 5. GENERAR LA COMPROBACIÓN
    let comprobacionHTML = `<h4>Comprobación (Sustituyendo resultados):</h4><ul>`;
    for(let i = 0; i < n; i++) {
        let valorCalculado = 0;
        let formulaString = "";
        
        for(let j = 0; j < n; j++) {
            valorCalculado += A[i][j] * x[j]; 
            formulaString += `(${A[i][j]})(${x[j].toFixed(4)})`;
            if (j < n - 1) formulaString += " + ";
        }
        
        comprobacionHTML += `<li>Ecuación ${i+1}: ${formulaString} = <strong>${valorCalculado.toFixed(4)}</strong> <em>(Esperado: ${b[i]})</em></li>`;
    }
    comprobacionHTML += `</ul>`;
    
    document.getElementById('comprobacion-container').innerHTML = comprobacionHTML;
}
