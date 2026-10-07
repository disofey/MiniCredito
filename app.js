async function cargarTokens() {
  const response = await fetch("tokens.json");
  const tokens = await response.json();
  return tokens;
}

async function iniciarApp() {
  const tokensValidos = await cargarTokens();
  const tokenGuardado = localStorage.getItem("tokenUsuario");

  if (tokenGuardado && Object.values(tokensValidos).includes(tokenGuardado)) {
    inicializarSistemaFiados(); 
  } else {
    const tokenIngresado = prompt("Ingrese su token de acceso:");
    if (Object.values(tokensValidos).includes(tokenIngresado)) {
      localStorage.setItem("tokenUsuario", tokenIngresado);
      alert("Token válido, acceso concedido ✅");
      inicializarSistemaFiados();
    } else {
      alert("Acceso denegado ❌");
    }
  }
}

function inicializarSistemaFiados() {
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
  }

  function cancelarFormulario() {
    document.getElementById("formulario").style.display = "none";
    document.getElementById("nombreCliente").value = "";
    document.getElementById("montoCliente").value = "";
  }

  function verReporte() {
    alert("Total clientes: " + clientes.length);
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

  function registrarPago(nombre, index) {
    const monto = prompt("Ingrese monto del pago:");
    const pago = parseFloat(monto);
    if (!isNaN(pago) && pago > 0) {
      clientes[index].saldo -= pago;
      guardarMovimiento(nombre, new Date().toISOString().split("T")[0], pago, "pago");
      if (clientes[index].saldo <= 0) {
        clientes.splice(index, 1);
      }
      localStorage.setItem("clientes", JSON.stringify(clientes));
      renderClientes();
      renderHistorial();
    } else {
      alert("Monto inválido.");
    }
  }

  function formatoFecha(fecha) {
    let d = new Date(fecha);
    let dia = String(d.getDate()).padStart(2, '0');
    let mes = String(d.getMonth() + 1).padStart(2, '0');
    let anio = String(d.getFullYear()).slice(-2);
    return `${dia}/${mes}/${anio}`;
  }

  // 🔽 Enganchar botones acá
  document.getElementById("btnAgregar").addEventListener("click", mostrarFormulario);
  document.getElementById("btnGuardar").addEventListener("click", guardarCliente);
  document.getElementById("btnCancelar").addEventListener("click", cancelarFormulario);
  document.getElementById("btnReporte").addEventListener("click", verReporte);

  // Render inicial
  renderClientes();
  renderHistorial();

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.error('Error al registrar SW', err));
  }
}

iniciarApp();
