document.addEventListener("DOMContentLoaded", () => {
  initBill();
});

// ===== Chọn phòng =====
function selectRoom(button) {
  const price = button.getAttribute("data-price");
  const roomType = button.getAttribute("data-room-type");
  localStorage.setItem("selectedRoomPrice", price);
  localStorage.setItem("selectedRoomType", roomType);

  // Default services
  const defaultServices = [{ name: "Breakfast", price: 0, quantity: 1 }];
  localStorage.setItem("selectedServices", JSON.stringify(defaultServices));

  window.location.href = "plans.html";
}

// ===== Quản lý dịch vụ =====
function addService(name, price) {
  let selectedServices = JSON.parse(localStorage.getItem("selectedServices") || "[]");
  const idx = selectedServices.findIndex(s => s.name === name);
  if (idx === -1) selectedServices.push({ name, price, quantity: 1 });
  else selectedServices[idx].quantity++;
  localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
  initBill();
}

function updateServiceQuantity(name, delta) {
  let selectedServices = JSON.parse(localStorage.getItem("selectedServices") || "[]");
  const service = selectedServices.find(s => s.name === name);
  if (!service) return;
  service.quantity = Math.max(1, service.quantity + delta);
  localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
  initBill();
}

function removeService(name) {
  let selectedServices = JSON.parse(localStorage.getItem("selectedServices") || "[]");
  selectedServices = selectedServices.filter(s => s.name !== name);
  localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
  initBill();
}

// ===== Bill =====
function initBill() {
  const billItemsDiv = document.getElementById("bill-items");
  const roomDiv = document.getElementById("roomPrice");
  const servicesDiv = document.getElementById("servicesPrice");
  const totalDiv = document.getElementById("totalPrice");
  if (!billItemsDiv) return;

  const roomPrice = parseInt(localStorage.getItem("selectedRoomPrice")) || 0;
  const services = JSON.parse(localStorage.getItem("selectedServices") || "[]");
  const guestInfo = JSON.parse(localStorage.getItem("guestInfo") || '{"rooms":1,"adults":[2],"children":[0]}');
  const roomCount = guestInfo.rooms || 1;

  // Tính số ngày ở
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  let stayDays = 1;
  if (checkin && checkout) {
    const inDate = flatpickr.parseDate(checkin, "d/m/Y");
    const outDate = flatpickr.parseDate(checkout, "d/m/Y");
    stayDays = Math.max(1, Math.round((outDate - inDate) / (1000*60*60*24)));
  }

  const roomTotal = roomPrice * roomCount * stayDays;

  let serviceTotal = 0;
  billItemsDiv.innerHTML = "";

  services.forEach(s => {
    const p = document.createElement("p");
    if (s.name.toLowerCase() === "breakfast") {
      p.textContent = "Breakfast: Included";
    } else {
      const price = s.price * s.quantity;
      serviceTotal += price;
      p.textContent = `${s.name} (${s.quantity}): ${price.toLocaleString("vi-VN")} VND`;

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.onclick = () => updateServiceQuantity(s.name, 1);

      const minus = document.createElement("button");
      minus.textContent = "−";
      minus.onclick = () => updateServiceQuantity(s.name, -1);

      const del = document.createElement("button");
      del.textContent = "🗑";
      del.onclick = () => removeService(s.name);

      p.appendChild(plus);
      p.appendChild(minus);
      p.appendChild(del);
    }
    billItemsDiv.appendChild(p);
  });

  if (roomDiv) roomDiv.textContent = `Room: ${roomPrice} x ${roomCount} x ${stayDays} = ${roomTotal.toLocaleString("vi-VN")} VND`;
  if (servicesDiv) servicesDiv.textContent = `Services: ${serviceTotal.toLocaleString("vi-VN")} VND`;
  if (totalDiv) totalDiv.textContent = `Total: ${(roomTotal + serviceTotal).toLocaleString("vi-VN")} VND`;
}
