// ===================== FINISH PAGE =====================

// Chạy khi trang load
document.addEventListener("DOMContentLoaded", () => {
  initBill();
  initBookButton();
  initPaymentOptions();
  initBookingFor(); // Xử lý Myself / Someone else
});

// ===================== BILL =====================
function initBill() {
  const billItemsDiv = document.getElementById("bill-items");
  const roomDiv = document.getElementById("roomPrice");
  const servicesDiv = document.getElementById("servicesPrice");
  const totalDiv = document.getElementById("totalPrice");
  const totalDisplay = document.querySelector(".price-total");

  if (!billItemsDiv) return;

  // Lấy dữ liệu từ localStorage (từ plans.html và book.html)
  const selectedRooms = JSON.parse(localStorage.getItem("selectedRooms")) || [];
  let selectedServices = JSON.parse(localStorage.getItem("selectedServices")) || [];
  const finalTotal = parseInt(localStorage.getItem("finalTotal")) || 0;

  // Đảm bảo có đúng 1 breakfast duy nhất
  selectedServices = selectedServices.filter((s, i, arr) =>
    i === arr.findIndex(x => x.name === s.name)
  );
  if (!selectedServices.some(s => s.name === "Breakfast - Included")) {
    selectedServices.unshift({ name: "Breakfast - Included", price: 0, quantity: 1 });
  }

  // ======== Hiển thị phòng ========
  let roomHtml = "<h4>Rooms:</h4>";
  let roomTotal = 0;

  selectedRooms.forEach((r, i) => {
    const subtotal = r.price * r.quantity * r.days;
    roomTotal += subtotal;
    roomHtml += `<p>${i + 1}. ${r.roomType} × ${r.quantity} room(s) × ${r.days} day(s) = ${subtotal.toLocaleString()}đ</p>`;
  });

  // ======== Hiển thị dịch vụ ========
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

  // ======== Render tổng ========
  billItemsDiv.innerHTML = roomHtml + serviceHtml;
  if (roomDiv) roomDiv.textContent = `Room total: ${roomTotal.toLocaleString()}đ`;
  if (servicesDiv) servicesDiv.textContent = `Services total: ${serviceTotal.toLocaleString()}đ`;

  const grandTotal = roomTotal + serviceTotal;
  if (totalDiv) totalDiv.textContent = `Total: ${grandTotal.toLocaleString()}đ`;
  if (totalDisplay) totalDisplay.textContent = `${grandTotal.toLocaleString()}đ`;

  // Lưu tổng vào localStorage để thanh toán
  localStorage.setItem("finalTotal", grandTotal);
}

// ===================== PAYMENT =====================
function initPaymentOptions() {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const bankInfoDiv = document.querySelector(".bank-info");
  if (!paymentRadios || !bankInfoDiv) return;

  paymentRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.nextSibling.textContent.includes("Bank transfer") && radio.checked) {
        bankInfoDiv.style.display = "block";
      } else if (radio.checked) {
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

    const fields = document.querySelectorAll("input, select, textarea");
    let valid = true;

    // Kiểm tra các trường bắt buộc
    fields.forEach(f => {
      if (f.hasAttribute("required") && !f.value.trim()) {
        f.style.borderColor = "red";
        valid = false;
      } else {
        f.style.borderColor = "#ccc";
      }
    });

    // Điều khoản
    const agree = document.getElementById("agree-terms");
    if (!agree || !agree.checked) {
      alert("⚠️ Please agree to the Terms & Conditions before booking!");
      valid = false;
    }

    // Kiểm tra phương thức thanh toán
    const paymentChecked = document.querySelector('input[name="payment"]:checked');
    if (!paymentChecked) {
      alert("⚠️ Please select a payment method!");
      valid = false;
    }

    if (!valid) return;

    alert(`✅ Booking successful! Payment method: ${paymentChecked.nextSibling.textContent.trim()}`);

    // Xóa dữ liệu cũ sau khi đặt thành công
    localStorage.removeItem("guestInfo");
    localStorage.removeItem("selectedRooms");
    localStorage.removeItem("selectedServices");
    localStorage.removeItem("finalTotal");

    // Có thể chuyển hướng sang trang cảm ơn
    // window.location.href = "thankyou.html";
  });
}

// ===================== MYSELF / SOMEONE ELSE =====================
function initBookingFor() {
  const bookingForBtns = document.querySelectorAll(".booking-for button");
  const form = document.querySelector(".booking-form");
  if (!bookingForBtns || !form) return;

  const recipientFormHTML = `
    <h3>Recipient Information</h3>
    <div class="form-row">
      <div class="form-group">
        <label>Recipient First Name</label>
        <input type="text" placeholder="Enter recipient's first name" required>
      </div>
      <div class="form-group">
        <label>Recipient Last Name</label>
        <input type="text" placeholder="Enter recipient's last name" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Recipient Phone</label>
        <input type="tel" placeholder="Enter recipient's phone" required>
      </div>
      <div class="form-group">
        <label>Recipient Email</label>
        <input type="email" placeholder="Enter recipient's email" required>
      </div>
    </div>
    <div class="form-group">
      <label>Recipient Country</label>
      <select>
        <option>🇬🇧 United Kingdom</option>
        <option>🇻🇳 Vietnam</option>
        <option>🇺🇸 United States</option>
        <option>🇫🇷 France</option>
      </select>
    </div>
    <div class="form-group">
      <label>Recipient Request</label>
      <textarea placeholder="Write recipient's request here..."></textarea>
    </div>
  `;

  const originalFormHTML = form.innerHTML;

  bookingForBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      bookingForBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const isSomeoneElse = btn.textContent.trim().toLowerCase() === "someone else";

      if (isSomeoneElse) {
        form.innerHTML = recipientFormHTML;
      } else {
        form.innerHTML = originalFormHTML;
      }
    });
  });
}
