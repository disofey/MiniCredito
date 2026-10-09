async function cargarTokens() {
  const response = await fetch("tokens.json");
  const tokens = await response.json();
  return tokens;
}

async function iniciarApp() {
  // Mensaje institucional con botón que abre WhatsApp
  const abrirWspp = confirm("Solicita tu código para habilitar el sistema (DISOFEY).\n\n¿Quieres abrir WhatsApp para solicitarlo ahora?");
  if (abrirWspp) {
    window.location.href = "whatsapp://send?text=Hola%20Emilio%20quiero%20mi%20código"; // abre WhatsApp Web en PC
  }

  // window.open("whatsapp://send?phone=5493854989374&text=Hola%20quiero%20mi%20código", "_blank"

  const tokensValidos = await cargarTokens();
  const tokenGuardado = localStorage.getItem("tokenUsuario");

  if (tokenGuardado && Object.values(tokensValidos).includes(tokenGuardado)) {
    inicializarSistemaFiados(); 
    return;
  } else {
    const tokenIngresado = prompt("Ingrese su token de acceso:");
    if (Object.values(tokensValidos).includes(tokenIngresado)) {
      localStorage.setItem("tokenUsuario", tokenIngresado);
      alert("Token válido, acceso concedido ✅");
      inicializarSistemaFiados();
    } else {
      alert("Acceso denegado ❌");
      return; // 🚫 corta la ejecución, no inicializa nada
    }
  }
}

function inicializarSistemaFiados() {
  renderClientes();
  renderHistorial();

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.error('Error al registrar SW', err));
  }
}

// 🔽 Funciones globales que usa el HTML, ahora con chequeo de token
function tieneTokenValido() {
  const token = localStorage.getItem("tokenUsuario");
  return token !== null;
}

window.mostrarFormulario = function() {
  if (!tieneTokenValido()) return;
  document.getElementById("formulario").style.display = "block";
};

window.cancelarFormulario = function() {
  if (!tieneTokenValido()) return;
  document.getElementById("formulario").style.display = "none";
  document.getElementById("nombreCliente").value = "";
  document.getElementById("montoCliente").value = "";
};

window.verReporte = function() {
  if (!tieneTokenValido()) return;
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  alert("Total clientes: " + clientes.length);
};

window.guardarCliente = function() {
  if (!tieneTokenValido()) return;
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const fechaRaw = document.getElementById("fechaCliente").value;
  const nombre = document.getElementById("nombreCliente").value;
  const monto = parseFloat(document.getElementById("montoCliente").value);

  if (nombre && !isNaN(monto)) {
    const fecha = formatoFecha(fechaRaw);
    clientes.push({ fecha, nombre, saldo: monto });
    localStorage.setItem("clientes", JSON.stringify(clientes));
    guardarMovimiento(nombre, fecha, monto, "fiado");
    cancelarFormulario();
    renderClientes();
    renderHistorial();
  } else {
    alert("Completa los campos correctamente.");
  }
};

window.renderClientes = function() {
  if (!tieneTokenValido()) return;
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const tbody = document.querySelector("#clientes tbody");
  tbody.innerHTML = "";
  clientes.forEach((c, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.fecha}</td>
      <td>${c.nombre}</td>
      <td>${c.saldo}</td>
      <td><button onclick="registrarPago('${c.nombre}', ${index})">💰 Pagar</button></td>
    `;
    tbody.appendChild(tr);
  });
};

window.guardarMovimiento = function(nombre, fecha, monto, tipo) {
  if (!tieneTokenValido()) return;
  let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
  movimientos.push({ nombre, fecha, monto, tipo });
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
};

window.renderHistorial = function() {
  if (!tieneTokenValido()) return;
  let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
  const tbody = document.querySelector("#historial tbody");
  tbody.innerHTML = "";
  movimientos.forEach(m => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${m.fecha}</td><td>${m.nombre}</td><td>${m.tipo}</td><td>${m.monto}</td>`;
    tbody.appendChild(tr);
  });
};

window.registrarPago = function(nombre, index) {
  if (!tieneTokenValido()) return;
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const monto = prompt("Ingrese monto del pago:");
  const pago = parseFloat(monto);
  const fecha = formatoFecha(new Date()); 
  
  if (!isNaN(pago) && pago > 0) {
    clientes[index].saldo -= pago;
    guardarMovimiento(nombre, fecha, pago, "pago");
    if (clientes[index].saldo <= 0) {
      clientes.splice(index, 1);
    }
    localStorage.setItem("clientes", JSON.stringify(clientes));
    renderClientes();
    renderHistorial();
  } else {
    alert("Monto inválido.");
  }
};

window.formatoFecha = function(fecha) {
  let d = new Date(fecha);
  let dia = String(d.getDate()).padStart(2, '0');
  let mes = String(d.getMonth() + 1).padStart(2, '0');
  let anio = String(d.getFullYear()).slice(-2);
  return `${dia}/${mes}/${anio}`;
};

// 🔽 Llamada final
document.addEventListener("DOMContentLoaded", () => {
  iniciarApp();
});


//document.addEventListener("DOMContentLoaded", iniciarApp);
//renderClientes();
//renderHistorial();