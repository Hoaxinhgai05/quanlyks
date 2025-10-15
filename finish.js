document.addEventListener("DOMContentLoaded", () => {
  initBill();
  initBookButton();
  initPaymentOptions(); // thêm hàm xử lý payment
});

function initBill() {
  const billItemsDiv = document.getElementById("bill-items");
  const roomDiv = document.getElementById("roomPrice");
  const servicesDiv = document.getElementById("servicesPrice");
  const totalDiv = document.getElementById("totalPrice");
  const totalDisplay = document.querySelector(".price-total");
  if (!billItemsDiv) return;

  const roomPrice = parseInt(localStorage.getItem("selectedRoomPrice")) || 0;
  const services = JSON.parse(localStorage.getItem("selectedServices") || "[]");
  const guestInfo = JSON.parse(localStorage.getItem("guestInfo") || "{}");
  const roomCount = guestInfo.rooms || 1;

  const roomTotal = roomPrice * roomCount;
  let serviceTotal = 0;

  billItemsDiv.innerHTML = "";
  services.forEach(s => {
    const p = document.createElement("p");
    if (s.name.toLowerCase() === "breakfast") {
      p.textContent = `Breakfast: Included`;
    } else {
      const price = s.price * s.quantity;
      serviceTotal += price;
      p.textContent = `${s.name} (${s.quantity}): ${price.toLocaleString("vi-VN")} VND`;
    }
    billItemsDiv.appendChild(p);
  });

  if (roomDiv) roomDiv.textContent = `Room: ${roomPrice} x ${roomCount} = ${roomTotal.toLocaleString("vi-VN")} VND`;
  if (servicesDiv) servicesDiv.textContent = `Services: ${serviceTotal.toLocaleString("vi-VN")} VND`;
  if (totalDiv) totalDiv.textContent = `Total: ${(roomTotal + serviceTotal).toLocaleString("vi-VN")} VND`;
  if (totalDisplay) totalDisplay.textContent = `${(roomTotal + serviceTotal).toLocaleString("vi-VN")} VND`;
}

// Xử lý hiển thị info chuyển khoản
function initPaymentOptions() {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const bankInfoDiv = document.querySelector(".bank-info");
  if (!paymentRadios || !bankInfoDiv) return;

  paymentRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.nextSibling.textContent.includes("Chuyển khoản") && radio.checked) {
        bankInfoDiv.style.display = "block";
      } else if (radio.checked) {
        bankInfoDiv.style.display = "none";
      }
    });
  });
}

function initBookButton() {
  const bookBtn = document.getElementById("bookNow");
  if (!bookBtn) return;

  bookBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const fields = [
      document.querySelector('input[placeholder="Enter your first name"]'),
      document.querySelector('input[placeholder="Enter your last name"]'),
      document.querySelector('input[type="tel"]'),
      document.querySelector('input[type="email"]'),
      document.querySelector("select")
    ];

    let valid = true;
    fields.forEach(f => {
      if (!f.value.trim()) {
        f.style.borderColor = "red";
        valid = false;
      } else f.style.borderColor = "#ccc";
    });

    const agree = document.getElementById("agree-terms");
    if (!agree || !agree.checked) {
      alert("⚠️ Please agree to the Terms & Conditions before booking!");
      valid = false;
    }

    // kiểm tra radio payment
    const paymentChecked = document.querySelector('input[name="payment"]:checked');
    if (!paymentChecked) {
      alert("⚠️ Please select a payment method!");
      valid = false;
    }

    if (!valid) {
      return;
    }

    alert(`✅ Booking successful! Payment method: ${paymentChecked.nextSibling.textContent.trim()}`);

    // Xóa dữ liệu booking đã lưu
    localStorage.removeItem("guestInfo");
    localStorage.removeItem("selectedRoomPrice");
    localStorage.removeItem("selectedRoomType");
    localStorage.removeItem("selectedServices");

    // Có thể chuyển về trang index hoặc thank you page
    // window.location.href = "index.html";
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initBill();
  initBookButton();
  initPaymentOptions();
  initBookingFor(); // 👈 thêm dòng này
});

// ================= BOOKING FOR MYSELF OR SOMEONE ELSE =================
document.addEventListener("DOMContentLoaded", () => {
  initBill();
  initBookButton();
  initPaymentOptions();
  initBookingFor(); // 👈 xử lý chuyển đổi "Myself" / "Someone else"
});

// ================= BOOKING FOR MYSELF OR SOMEONE ELSE =================
function initBookingFor() {
  const bookingForBtns = document.querySelectorAll(".booking-for button");
  const form = document.querySelector(".booking-form");
  if (!bookingForBtns || !form) return;

  // ✅ Tạo nội dung người được đặt hộ (ban đầu ẩn)
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

  // Lưu nội dung ban đầu của form để khi quay lại “Myself” có thể khôi phục
  const originalFormHTML = form.innerHTML;

  bookingForBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Chuyển trạng thái active
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

// ================= BILL, PAYMENT, BOOK BUTTON (các hàm bạn có sẵn) =================
function initBill() {
  const billItemsDiv = document.getElementById("bill-items");
  const roomDiv = document.getElementById("roomPrice");
  const servicesDiv = document.getElementById("servicesPrice");
  const totalDiv = document.getElementById("totalPrice");
  const totalDisplay = document.querySelector(".price-total");
  if (!billItemsDiv) return;

  const roomPrice = parseInt(localStorage.getItem("selectedRoomPrice")) || 0;
  const services = JSON.parse(localStorage.getItem("selectedServices") || "[]");
  const guestInfo = JSON.parse(localStorage.getItem("guestInfo") || "{}");
  const roomCount = guestInfo.rooms || 1;

  const roomTotal = roomPrice * roomCount;
  let serviceTotal = 0;

  billItemsDiv.innerHTML = "";
  services.forEach(s => {
    const p = document.createElement("p");
    if (s.name.toLowerCase() === "breakfast") {
      p.textContent = `Breakfast: Included`;
    } else {
      const price = s.price * s.quantity;
      serviceTotal += price;
      p.textContent = `${s.name} (${s.quantity}): ${price.toLocaleString("vi-VN")} VND`;
    }
    billItemsDiv.appendChild(p);
  });

  if (roomDiv) roomDiv.textContent = `Room: ${roomPrice} x ${roomCount} = ${roomTotal.toLocaleString("vi-VN")} VND`;
  if (servicesDiv) servicesDiv.textContent = `Services: ${serviceTotal.toLocaleString("vi-VN")} VND`;
  if (totalDiv) totalDiv.textContent = `Total: ${(roomTotal + serviceTotal).toLocaleString("vi-VN")} VND`;
  if (totalDisplay) totalDisplay.textContent = `${(roomTotal + serviceTotal).toLocaleString("vi-VN")} VND`;
}

function initPaymentOptions() {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const bankInfoDiv = document.querySelector(".bank-info");
  if (!paymentRadios || !bankInfoDiv) return;

  paymentRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.nextSibling.textContent.includes("Chuyển khoản") && radio.checked) {
        bankInfoDiv.style.display = "block";
      } else if (radio.checked) {
        bankInfoDiv.style.display = "none";
      }
    });
  });
}

function initBookButton() {
  const bookBtn = document.getElementById("bookNow");
  if (!bookBtn) return;

  bookBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const fields = document.querySelectorAll("input, select, textarea");
    let valid = true;

    fields.forEach(f => {
      if (f.hasAttribute("required") && !f.value.trim()) {
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

    alert(`✅ Booking successful! Payment method: ${paymentChecked.nextSibling.textContent.trim()}`);

    localStorage.removeItem("guestInfo");
    localStorage.removeItem("selectedRoomPrice");
    localStorage.removeItem("selectedRoomType");
    localStorage.removeItem("selectedServices");
  });
}
