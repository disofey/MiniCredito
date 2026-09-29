# MiniCredito

Sistema simple de gestión de fiados para pequeños comercios y minipymes.  
Permite registrar clientes, saldos, pagos y mantener un historial de movimientos.  
Funciona directamente en el navegador usando **LocalStorage**, sin necesidad de servidor.

## 🚀 Funcionalidades
- Alta de clientes con fecha, nombre y saldo.
- Registro de pagos con actualización automática del saldo.
- Eliminación automática del cliente de la lista de deudores cuando el saldo llega a cero.
- Historial completo de fiados y pagos.
- Persistencia de datos en LocalStorage (se mantiene aunque cierres el navegador).

## 📂 Archivos principales
- `index.html` → interfaz principal.
- `app.js` → lógica de clientes, pagos e historial.
- `style.css` → estilos básicos.

## 📱 Cómo probar en el celular
1. Abrí la URL de GitHub Pages:  

2. Se carga la app directamente en tu navegador móvil.
3. Cada dispositivo mantiene su propio LocalStorage, así que podés probar en paralelo en PC y celular.

## 🛠️ Instalación local (opcional)
Si querés correrlo en tu PC con un servidor simple:
```bash
npm install -g http-server
http-server

💡 Proyecto en desarrollo por Emilio Ybarra.{Disofey}
