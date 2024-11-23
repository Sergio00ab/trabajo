// Guardar vehículo
document.getElementById("vehicle-form")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const vehicleType = document.getElementById("vehicle-type").value;
    const licensePlate = document.getElementById("license-plate").value;
    const ownerName = document.getElementById("owner-name").value;
    const ownerPhone = document.getElementById("owner-phone").value;
    const observations = document.getElementById("observations").value;
    const discount = parseInt(document.getElementById("discount").value) || 0;
    const process = document.getElementById("process").value;
    const arrivalTime = new Date().toLocaleString();

    console.log("Datos del formulario:", { vehicleType, licensePlate, ownerName, ownerPhone, observations, discount, process });

    let total = 0;
    if (process !== "personalizado") {
        total = calculateTotal(process, vehicleType, discount);
    } else {
        total = calculateCustomProcessTotal();
    }

    const vehicle = {
        id: Date.now(),
        vehicleType,
        licensePlate,
        ownerName,
        ownerPhone,
        observations,
        discount,
        process,
        arrivalTime,
        deliveryTime: null,
        total
    };

    let history = JSON.parse(localStorage.getItem("historial")) || [];
    history.push(vehicle);
    localStorage.setItem("historial", JSON.stringify(history));

    console.log("Historial actualizado:", history);

    alert("Vehículo registrado correctamente.");
    document.getElementById("vehicle-form").reset();
    toggleCustomProcess();
});



//// Lógica para mostrar u ocultar los servicios adicionales cuando se selecciona "Proceso Personalizado"
function toggleCustomProcess() {
    const process = document.getElementById("process").value;
    const customServicesSection = document.getElementById("custom-services");

    if (process === "personalizado") {
        customServicesSection.style.display = "block";
    } else {
        customServicesSection.style.display = "none";
    }
}

// Calcular el total para el proceso personalizado
function calculateCustomProcessTotal() {
    const selectedServices = document.querySelectorAll(".custom-service:checked");
    let totalCustomServices = 0;

    selectedServices.forEach(service => {
        totalCustomServices += parseInt(service.getAttribute("data-price"));
    });

    // Mostrar el total de los servicios personalizados seleccionados
    document.getElementById("total-custom-services").innerText = totalCustomServices;

    return totalCustomServices;
}

// Calcular el total según el proceso y el tipo de vehículo
function calculateTotal(process, vehicleType, discount) {
    const prices = {
        sencillo: { automovil: 40000, camioneta: 45000, moto: 35000 },
        "brillado-vip": { automovil: 80000, camioneta: 90000, moto: 35000 },
        premium: { automovil: 130000, camioneta: 140000, moto: 35000 },
        diamante: { automovil: 230000, camioneta: 250000, moto: 35000 },
        detailing: { automovil: 400000, camioneta: 500000, moto: 35000 },
        ceramico: { automovil: 700000, camioneta: 800000, moto: 35000 },
    };

    let basePrice = prices[process][vehicleType] || 0;
    let discountAmount = basePrice * (discount / 100);
    let total = basePrice - discountAmount;

    return total;
}

// Cargar historial
function loadHistory() {
    let history = JSON.parse(localStorage.getItem("historial")) || [];
    console.log("Historial cargado desde localStorage:", history);

    const historyTable = document.getElementById("history-body");
    historyTable.innerHTML = ''; 

    history.forEach(vehicle => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${vehicle.id}</td>
            <td>${vehicle.licensePlate}</td>
            <td>${vehicle.ownerName}</td>
            <td>${vehicle.process}</td>
            <td>${vehicle.total}</td>
            <td>${vehicle.arrivalTime}</td>
            <td>${vehicle.deliveryTime || "Pendiente"}</td>
            <td>${vehicle.observations ? vehicle.observations : ""}</td>
            <td>
                <button onclick="deliverVehicle(${vehicle.id})">Entregar</button>
            </td>
        `;
        historyTable.appendChild(row);
    });
}


// Marcar vehículo como entregado
function deliverVehicle(vehicleId) {
    let history = JSON.parse(localStorage.getItem("historial")) || [];

    const vehicle = history.find(v => v.id === vehicleId);
    if (vehicle) {
        vehicle.deliveryTime = new Date().toLocaleString();
        localStorage.setItem("historial", JSON.stringify(history));
        loadHistory();
    }
}

// Limpiar historial
function clearHistory() {
    if (confirm("¿Estás seguro de que deseas limpiar el historial?")) {
        // Reiniciar el ID y limpiar el historial
        localStorage.setItem("historial", JSON.stringify([]));
        alert("Historial limpio.");
        loadHistory(); // Recargar el historial vacío
    }
}
function clearCierre() {
    if (confirm("¿Estás seguro de que deseas limpiar el cierre de caja?")) {
        // Eliminar los datos de historial y ventas de productos en localStorage
        localStorage.removeItem("historial");   // Elimina el historial de vehículos
        localStorage.removeItem("productSales"); // Elimina las ventas de productos
        localStorage.removeItem("cierreData");   // Elimina cualquier dato de cierre de caja

        // Reiniciar los totales en la interfaz
        document.getElementById("total-efectivo").innerText = 0;
        document.getElementById("total-qr").innerText = 0;
        document.getElementById("total-vehiculos").innerText = 0;
        document.getElementById("total-servicios").innerText = 0;

        // Limpiar las filas de la tabla de cierre de caja
        let cierreBody = document.getElementById("cierre-body");
        
        // Usar una forma confiable para eliminar todas las filas
        while (cierreBody.rows.length > 0) {
            cierreBody.deleteRow(0); // Elimina la primera fila (hace esto hasta que no haya más filas)
        }

        // Mostrar un mensaje de confirmación
        alert("Cierre de caja limpio.");
    }
}




function loadCaja() {
    let history = JSON.parse(localStorage.getItem("historial")) || [];
    const cierreData = JSON.parse(localStorage.getItem("cierreData")) || {
        totalEfectivo: 0,
        totalQR: 0,
        totalVehiculos: 0,
        totalServicios: 0
    };

    // Mostrar los datos guardados en la interfaz
    document.getElementById("total-efectivo").innerText = cierreData.totalEfectivo;
    document.getElementById("total-qr").innerText = cierreData.totalQR;
    document.getElementById("total-vehiculos").innerText = cierreData.totalVehiculos;
    document.getElementById("total-servicios").innerText = cierreData.totalServicios;

    // Cargar la tabla de vehículos
    const cierreTable = document.getElementById("cierre-body");
    cierreTable.innerHTML = '';

    history.forEach(vehicle => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${vehicle.process}</td>
            <td>${vehicle.vehicleType}</td>
            <td>${vehicle.licensePlate}</td> <!-- Mostrar número de placa -->
            <td>${vehicle.total}</td>
            <td>
                <select id="payment-method-${vehicle.id}">
                    <option value="efectivo">Efectivo</option>
                    <option value="qr">QR</option>
                </select>
            </td>
        `;
        cierreTable.appendChild(row);

        // Seleccionar el método de pago guardado si existe
        const paymentMethodElement = document.getElementById(`payment-method-${vehicle.id}`);
        if (vehicle.paymentMethod) {
            paymentMethodElement.value = vehicle.paymentMethod;
        }

        // Agregar evento para actualizar el método de pago en localStorage
        paymentMethodElement.addEventListener("change", () => {
            vehicle.paymentMethod = paymentMethodElement.value;
            localStorage.setItem("historial", JSON.stringify(history)); // Actualizar el historial en localStorage
        });
    });
}





// Llamar a la función para cargar el historial y cierre
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("cierre-body")) loadCaja();
});

document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("history-body")) {
        console.log("Cargando historial...");
        loadHistory();
    }
    if (document.getElementById("cierre-body")) {
        console.log("Cargando cierre de caja...");
        loadCaja();
    }
});

function updateTotals() {
    let history = JSON.parse(localStorage.getItem("historial")) || [];
    let totalEfectivo = 0;
    let totalQR = 0;
    let totalServicios = 0;
    let totalVehiculos = 0;

    history.forEach(vehicle => {
        const paymentMethodElement = document.getElementById(`payment-method-${vehicle.id}`);
        if (paymentMethodElement) {
            const paymentMethod = paymentMethodElement.value;

            if (paymentMethod === "efectivo") {
                totalEfectivo += vehicle.total;
            } else if (paymentMethod === "qr") {
                totalQR += vehicle.total;
            }

            totalServicios += vehicle.total;
            totalVehiculos++;
        }
    });

    // Actualizar los totales en el HTML
    document.getElementById("total-efectivo").innerText = totalEfectivo;
    document.getElementById("total-qr").innerText = totalQR;
    document.getElementById("total-vehiculos").innerText = totalVehiculos;
    document.getElementById("total-servicios").innerText = totalServicios;

    // Guardar los totales en localStorage
    const cierreData = {
        totalEfectivo,
        totalQR,
        totalVehiculos,
        totalServicios
    };
    localStorage.setItem("cierreData", JSON.stringify(cierreData));
}
function addProductSale() {
    // Obtener el nombre y valor del producto
    const productName = document.getElementById("product-name").value;
    const productPrice = parseFloat(document.getElementById("product-price").value);

    if (!productName || isNaN(productPrice) || productPrice <= 0) {
        alert("Por favor, ingrese un nombre y valor válido para el producto.");
        return;
    }

    // Crear un objeto para la venta del producto
    const productSale = {
        id: Date.now(),
        name: productName,
        price: productPrice
    };

    // Obtener las ventas de productos previas de localStorage
    let productSales = JSON.parse(localStorage.getItem("productSales")) || [];
    productSales.push(productSale);

    // Guardar el nuevo producto en localStorage
    localStorage.setItem("productSales", JSON.stringify(productSales));

    // Actualizar el total de ventas en el cierre de caja
    updateProductTotals();

    // Limpiar el formulario
    document.getElementById("product-form").reset();
    alert("Producto agregado correctamente.");
}

