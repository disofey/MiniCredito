let clientes = JSON.parse(localStorage.getItem("clientes")) || [
  { fecha: "2026-09-01", nombre: "Juan Pérez", saldo: 1500 },
  { fecha: "2026-09-02", nombre: "Ana López", saldo: 800 }
];

function renderClientes() {
  const tbody = document.querySelector("#clientes tbody");
  tbody.innerHTML = "";
  clientes.forEach((c, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${c.fecha || ""}</td>
      <td>${c.nombre}</td>
      <td>$${c.saldo}</td>
      <td>
        <button onclick="registrarPago('${c.nombre}', ${index})">💰 Pagar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}


function mostrarFormulario() {
  document.getElementById("formulario").style.display = "block";
}

function guardarMovimiento(nombre, fecha, monto, tipo) {
  let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
  movimientos.push({ nombre, fecha, monto, tipo });
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

function guardarCliente() {
  const fecha = document.getElementById("fechaCliente").value;
  const nombre = document.getElementById("nombreCliente").value;
  const monto = parseFloat(document.getElementById("montoCliente").value);
  if (nombre && !isNaN(monto)) {
    clientes.push({ fecha, nombre, saldo: monto });
    localStorage.setItem("clientes", JSON.stringify(clientes));
    guardarMovimiento(nombre, fecha, monto, "fiado"); // 🔑 registro en historial
    renderClientes();
    cancelarFormulario();
  } else {
    alert("Completa los campos correctamente.");
  }
}

function registrarPago(nombre, monto) {
  let cliente = clientes.find(c => c.nombre === nombre);
  if (cliente) {
    cliente.saldo -= monto;
    guardarMovimiento(nombre, new Date().toISOString().split("T")[0], monto, "pago"); // 🔑 registro en historial
    if (cliente.saldo <= 0) {
      clientes = clientes.filter(c => c.nombre !== nombre); // lo sacamos de la lista activa
    }
    localStorage.setItem("clientes", JSON.stringify(clientes));
    renderClientes();
  }
}


function cancelarFormulario() {
  document.getElementById("formulario").style.display = "none";
  document.getElementById("nombreCliente").value = "";
  document.getElementById("montoCliente").value = "";
}

function verReporte() {
  alert("Total clientes: " + clientes.length);
}

document.addEventListener("DOMContentLoaded", renderClientes);

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker registrado', reg))
    .catch(err => console.error('Error al registrar SW', err));
}

function renderHistorial() {
  let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
  const tbody = document.querySelector("#historial tbody");
  tbody.innerHTML = "";
  movimientos.forEach(m => {
    const fila = document.createElement("tr");
    fila.innerHTML = `<td>${m.fecha}</td><td>${m.nombre}</td><td>${m.tipo}</td><td>$${m.monto}</td>`;
    tbody.appendChild(fila);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  renderClientes();
  renderHistorial();
});


function registrarPago(nombre, index) {
  const monto = prompt("Ingrese monto del pago:");
  const pago = parseFloat(monto);
  if (!isNaN(pago) && pago > 0) {
    clientes[index].saldo -= pago;
    guardarMovimiento(nombre, new Date().toISOString().split("T")[0], pago, "pago");

    if (clientes[index].saldo <= 0) {
      clientes.splice(index, 1); // lo sacamos de la lista activa
    }

    localStorage.setItem("clientes", JSON.stringify(clientes));
    renderClientes();
    renderHistorial();
  } else {
    alert("Monto inválido.");
  }
}
