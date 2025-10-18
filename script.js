// =================== BOOK PAGE ===================

// Hàm chọn phòng và hiển thị bill mini ở trang book.html
function selectRoom(button) {
  const billSection = document.getElementById("billSection");
  const billList = document.getElementById("billList");
  const totalPrice = document.getElementById("totalPrice");

  const roomType = button.getAttribute("data-room-type");
  const price = parseInt(button.getAttribute("data-price"));

  // Lấy số lượng phòng (mặc định = 1)
  const quantityInput = document.getElementById("roomQuantity");
  const quantity = parseInt(quantityInput?.value || 1);

  // Tính số ngày giữa checkin và checkout
  const checkinInput = document.getElementById("checkin");
  const checkoutInput = document.getElementById("checkout");
  let days = 1;

  if (checkinInput && checkoutInput && checkinInput.value && checkoutInput.value) {
    const [checkinDay, checkinMonth, checkinYear] = checkinInput.value.split("/").map(Number);
    const [checkoutDay, checkoutMonth, checkoutYear] = checkoutInput.value.split("/").map(Number);

    const checkinDate = new Date(checkinYear, checkinMonth - 1, checkinDay);
    const checkoutDate = new Date(checkoutYear, checkoutMonth - 1, checkoutDay);

    const diffTime = checkoutDate - checkinDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    days = diffDays > 0 ? diffDays : 1;
  }

  // Lưu danh sách phòng vào localStorage
  let selectedRooms = JSON.parse(localStorage.getItem("selectedRooms")) || [];
  selectedRooms.push({ roomType, price, quantity, days });
  localStorage.setItem("selectedRooms", JSON.stringify(selectedRooms));

  // Hiện bill mini
  if (billSection) billSection.style.display = "block";
  renderBillMini(selectedRooms, totalPrice, billList);
}

// Hiển thị bill mini trong book.html
function renderBillMini(selectedRooms, totalPriceElem, billListElem) {
  if (!billListElem || !totalPriceElem) return;
  let html = "";
  let total = 0;

  selectedRooms.forEach((r, i) => {
    const roomTotal = r.price * r.quantity * r.days;
    html += `<p>${i + 1}. ${r.roomType} × ${r.quantity} room(s) × ${r.days} day(s) = ${roomTotal.toLocaleString()}đ</p>`;
    total += roomTotal;
  });

  billListElem.innerHTML = html;
  totalPriceElem.textContent = total.toLocaleString() + "đ";
  localStorage.setItem("roomTotal", total);
}

// Khi nhấn "Continue Add Service" → chuyển sang plans.html
document.addEventListener("DOMContentLoaded", () => {
  const continueBtn = document.getElementById("continueBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      window.location.href = "plans.html";
    });
  }

  // Reset dữ liệu nếu quay lại book.html
  if (window.location.pathname.includes("book.html")) {
    localStorage.removeItem("selectedRooms");
    localStorage.removeItem("roomTotal");
  }
});

// =================== PLANS PAGE ===================

// Thêm dịch vụ (ngoại trừ Breakfast)
function addService(name, price) {
  if (name === "Breakfast - Included") return;

  let selectedServices = JSON.parse(localStorage.getItem("selectedServices")) || [];
  let existing = selectedServices.find(s => s.name === name);

  if (existing) {
    existing.quantity = (existing.quantity || 0) + 1;
  } else {
    selectedServices.push({ name, price, quantity: 1 });
  }

  localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
  updateBillDisplay();
}

// Giảm số lượng dịch vụ
function decreaseService(name) {
  if (name === "Breakfast - Included") return;

  let selectedServices = JSON.parse(localStorage.getItem("selectedServices")) || [];
  let existing = selectedServices.find(s => s.name === name);

  if (existing) {
    existing.quantity--;
    if (existing.quantity <= 0) {
      selectedServices = selectedServices.filter(s => s.name !== name);
    }
  }

  localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
  updateBillDisplay();
}

// Xóa dịch vụ
function removeService(name) {
  if (name === "Breakfast - Included") return;

  let selectedServices = JSON.parse(localStorage.getItem("selectedServices")) || [];
  selectedServices = selectedServices.filter(s => s.name !== name);
  localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
  updateBillDisplay();
}

// =================== BREAKFAST FIX ===================

// Luôn có Breakfast mặc định
function ensureDefaultBreakfast() {
  let selectedServices = JSON.parse(localStorage.getItem("selectedServices")) || [];
  selectedServices = selectedServices.filter(s => s.name !== "Breakfast - Included");
  selectedServices.unshift({ name: "Breakfast - Included", price: 0, quantity: 1 });
  localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
}

// =================== BILL DISPLAY ===================

function updateBillDisplay() {
  const billItems = document.getElementById("bill-items");
  const roomPriceElem = document.getElementById("roomPrice");
  const servicesPriceElem = document.getElementById("servicesPrice");
  const totalPriceElem = document.getElementById("totalPrice");

  if (!billItems) return;

  let selectedRooms = JSON.parse(localStorage.getItem("selectedRooms")) || [];
  let selectedServices = JSON.parse(localStorage.getItem("selectedServices")) || [];

  // Đảm bảo Breakfast duy nhất
  selectedServices = selectedServices.filter((s, i, arr) => i === arr.findIndex(x => x.name === s.name));
  if (!selectedServices.some(s => s.name === "Breakfast - Included")) {
    selectedServices.unshift({ name: "Breakfast - Included", price: 0, quantity: 1 });
  }

  // Render rooms
  let roomHtml = "<h4>Rooms:</h4>";
  let totalRoom = 0;
  selectedRooms.forEach((r, i) => {
    const roomTotal = r.price * r.quantity * r.days;
    totalRoom += roomTotal;
    roomHtml += `<p>${i + 1}. ${r.roomType} × ${r.quantity} × ${r.days} day(s) = ${roomTotal.toLocaleString()}đ</p>`;
  });

  // Render services
  let serviceHtml = "<h4>Services:</h4>";
  let totalService = 0;

  selectedServices.forEach(s => {
    if (s.name === "Breakfast - Included") {
      serviceHtml += `<p>Breakfast - Included</p>`;
    } else {
      const subtotal = (s.price || 0) * (s.quantity || 0);
      totalService += subtotal;

      serviceHtml += `
        <p>
          ${s.name} - ${s.price.toLocaleString()}đ × ${s.quantity}
          <button onclick="addService('${s.name}', ${s.price})">+</button>
          <button onclick="decreaseService('${s.name}')">-</button>
          <button onclick="removeService('${s.name}')">❌</button>
        </p>`;
    }
  });

  // Hiển thị tổng
  billItems.innerHTML = roomHtml + serviceHtml;
  if (roomPriceElem) roomPriceElem.textContent = `Room total: ${totalRoom.toLocaleString()}đ`;
  if (servicesPriceElem) servicesPriceElem.textContent = `Services total: ${totalService.toLocaleString()}đ`;
  if (totalPriceElem) totalPriceElem.textContent = `Total: ${(totalRoom + totalService).toLocaleString()}đ`;

  localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
  localStorage.setItem("finalTotal", totalRoom + totalService);
}

// Khi tải plans.html thì tự thêm Breakfast
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".bill")) {
    ensureDefaultBreakfast();
    updateBillDisplay();
  }
});
