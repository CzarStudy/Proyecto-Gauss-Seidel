function esDominanteDiagonal(A) {
    let n = A.length;
    for (let i = 0; i < n; i++) {
        let sumaOtros = 0;
        for (let j = 0; j < n; j++) {
            if (j !== i) sumaOtros += Math.abs(A[i][j]);
        }
        if (Math.abs(A[i][i]) <= sumaOtros) {
            return false;
        }
    }
    return true;
}

function resolverGaussSeidel() {
    // 1. Obtener los valores de los inputs
    let A = [
        [parseFloat(document.getElementById('a00').value || 0), parseFloat(document.getElementById('a01').value || 0), parseFloat(document.getElementById('a02').value || 0)],
        [parseFloat(document.getElementById('a10').value || 0), parseFloat(document.getElementById('a11').value || 0), parseFloat(document.getElementById('a12').value || 0)],
        [parseFloat(document.getElementById('a20').value || 0), parseFloat(document.getElementById('a21').value || 0), parseFloat(document.getElementById('a22').value || 0)]
    ];
    let b = [
        parseFloat(document.getElementById('b0').value || 0),
        parseFloat(document.getElementById('b1').value || 0),
        parseFloat(document.getElementById('b2').value || 0)
    ];

    let tol = parseFloat(document.getElementById('tol').value);
    let maxIter = parseInt(document.getElementById('maxIter').value);
    let alertsDiv = document.getElementById('alerts');
    alertsDiv.innerHTML = ""; // Limpiar alertas

    // Verificar la diagonal
    if (!esDominanteDiagonal(A)) {
        alertsDiv.innerHTML = "⚠️ Advertencia: La matriz NO es diagonalmente dominante. El método podría no converger.";
    }

    // 2. Valores iniciales en cero
    let n = A.length;
    let x = [0, 0, 0];
    
    let tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = ''; // Limpiar tabla anterior
    
    let convergio = false;

    // 3. Iteraciones
    for (let k = 0; k < maxIter; k++) {
        let x_viejo = [...x];
        let errorMaximo = 0;

        for (let i = 0; i < n; i++) {
            let suma = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    suma += A[i][j] * x[j];
                }
            }
            // Despeje respecto a la diagonal principal
            x[i] = (b[i] - suma) / A[i][i];
        }

        // Calcular error
        for (let i = 0; i < n; i++) {
            let errorActual = Math.abs(x[i] - x_viejo[i]);
            if (errorActual > errorMaximo) {
                errorMaximo = errorActual;
            }
        }

        // Agregar fila a la tabla
        let row = `<tr>
            <td>${k + 1}</td>
            <td>${x[0].toFixed(6)}</td>
            <td>${x[1].toFixed(6)}</td>
            <td>${x[2].toFixed(6)}</td>
            <td>${errorMaximo.toFixed(6)}</td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);

        // 4. Comprobación del criterio de parada
        if (errorMaximo < tol) {
            convergio = true;
            break;
        }
    }

    // Mostrar resultados
    document.getElementById('results-container').style.display = 'block';
    document.getElementById('final-solution').innerHTML = `
        <strong>Solución Aproximada:</strong><br>
        x = ${x[0].toFixed(6)}<br>
        y = ${x[1].toFixed(6)}<br>
        z = ${x[2].toFixed(6)}
    `;
}