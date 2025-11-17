// ===================== FINISH PAGE =====================
document.addEventListener("DOMContentLoaded", () => {
  fillCustomerForm();    // Tự điền thông tin khách
  initBill();            // Hiển thị bill
  initBookButton();      // Nút BOOK
  initPaymentOptions();  // Chọn phương thức thanh toán
  initBookingFor();      // Myself / Someone else
});

// ===================== FILL CUSTOMER FORM =====================
function fillCustomerForm() {
  const guestInfo = JSON.parse(localStorage.getItem("guestInfo"));
  if (!guestInfo) return;

  // Dùng id hoặc placeholder để chắc chắn tìm đúng
  const firstNameInput = document.querySelector("input#firstnameFinish, input[placeholder='Enter your first name']");
  const lastNameInput  = document.querySelector("input#nameFinish, input[placeholder='Enter your last name']");
  const phoneInput     = document.querySelector("input#phoneFinish, input[placeholder='Enter your phone']");
  const emailInput     = document.querySelector("input#emailFinish, input[placeholder='Enter your email']");
  const countrySelect  = document.querySelector("select#countryFinish, select");

  if (firstNameInput) firstNameInput.value = guestInfo.firstname || "";
  if (lastNameInput)  lastNameInput.value  = guestInfo.name || "";
  if (phoneInput)     phoneInput.value     = guestInfo.phone || "";
  if (emailInput)     emailInput.value     = guestInfo.email || "";
  if (countrySelect)  countrySelect.value  = guestInfo.country || "🇻🇳 Vietnam";
}

// ===================== BILL =====================
function initBill() {
  const billItemsDiv = document.getElementById("bill-items");
  const roomDiv = document.getElementById("roomPrice");
  const servicesDiv = document.getElementById("servicesPrice");
  const totalDiv = document.getElementById("totalPrice");
  const totalDisplay = document.querySelector(".price-total");

  if (!billItemsDiv) return;

  const selectedRooms = JSON.parse(localStorage.getItem("selectedRooms")) || [];
  let selectedServices = JSON.parse(localStorage.getItem("selectedServices")) || [];

  // Đảm bảo có đúng 1 breakfast duy nhất
  selectedServices = selectedServices.filter((s, i, arr) =>
    i === arr.findIndex(x => x.name === s.name)
  );
  if (!selectedServices.some(s => s.name === "Breakfast - Included")) {
    selectedServices.unshift({ name: "Breakfast - Included", price: 0, quantity: 1 });
  }

  // ===== Hiển thị phòng =====
  let roomHtml = "<h4>Rooms:</h4>";
  let roomTotal = 0;
  selectedRooms.forEach((r, i) => {
    const subtotal = r.price * r.quantity * r.days;
    roomTotal += subtotal;
    roomHtml += `<p>${i + 1}. ${r.roomType} × ${r.quantity} room(s) × ${r.days} day(s) = ${subtotal.toLocaleString()}đ</p>`;
  });

  // ===== Hiển thị dịch vụ =====
  let serviceHtml = "<h4>Services:</h4>";
  let serviceTotal = 0;
  selectedServices.forEach(s => {
    if (s.name === "Breakfast - Included") {
      serviceHtml += `<p>Breakfast - Included</p>`;
    } else {
      const subtotal = (s.price || 0) * (s.quantity || 0);
      serviceTotal += subtotal;
      serviceHtml += `<p>${s.name} (${s.quantity}) = ${subtotal.toLocaleString()}đ</p>`;
    }
  });

  // ===== Render tổng =====
  billItemsDiv.innerHTML = roomHtml + serviceHtml;
  if (roomDiv) roomDiv.textContent = `Room total: ${roomTotal.toLocaleString()}đ`;
  if (servicesDiv) servicesDiv.textContent = `Services total: ${serviceTotal.toLocaleString()}đ`;

  const grandTotal = roomTotal + serviceTotal;
  if (totalDiv) totalDiv.textContent = `Total: ${grandTotal.toLocaleString()}đ`;
  if (totalDisplay) totalDisplay.textContent = `${grandTotal.toLocaleString()}đ`;

  localStorage.setItem("finalTotal", grandTotal);
}

// ===================== PAYMENT OPTIONS =====================
function initPaymentOptions() {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const bankInfoDiv = document.querySelector(".bank-info");
  if (!paymentRadios || !bankInfoDiv) return;

  paymentRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.nextSibling && radio.nextSibling.textContent.includes("Bank transfer") && radio.checked) {
        bankInfoDiv.style.display = "block";
      } else {
        bankInfoDiv.style.display = "none";
      }
    });
  });
}

// ===================== BOOK BUTTON =====================
function initBookButton() {
  const bookBtn = document.getElementById("bookNow");
  if (!bookBtn) return;

  bookBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const fields = document.querySelectorAll("input[required], select[required], textarea[required]");
    let valid = true;

    fields.forEach(f => {
      if (!f.value.trim()) {
        f.style.borderColor = "red";
        valid = false;
      } else {
        f.style.borderColor = "#ccc";
      }
    });

    const agree = document.getElementById("agree-terms");
    if (!agree || !agree.checked) {
      alert("⚠️ Please agree to the Terms & Conditions before booking!");
      valid = false;
    }

    const paymentChecked = document.querySelector('input[name="payment"]:checked');
    if (!paymentChecked) {
      alert("⚠️ Please select a payment method!");
      valid = false;
    }

    if (!valid) return;

    // ===== Thành công =====
    if (confirm(`✅ Booking successful! Payment method: ${paymentChecked.nextSibling.textContent.trim()}\nClick OK to go to homepage.`)) {
      // Xoá dữ liệu tạm
      localStorage.removeItem("guestInfo");
      localStorage.removeItem("selectedRooms");
      localStorage.removeItem("selectedServices");
      localStorage.removeItem("finalTotal");

      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "trangchu.html";
    }
  });
}

// ===================== BOOKING FOR MYSELF / SOMEONE ELSE =====================
function initBookingFor() {
  const myselfRadio = document.getElementById("bookForMyself");
  const someoneRadio = document.getElementById("bookForSomeone");
  const guestForm = document.querySelector(".customer-section");

  if (!myselfRadio || !someoneRadio || !guestForm) return;

  myselfRadio.addEventListener("change", () => {
    if (myselfRadio.checked) guestForm.style.display = "none";
  });
  someoneRadio.addEventListener("change", () => {
    if (someoneRadio.checked) guestForm.style.display = "block";
  });
}
