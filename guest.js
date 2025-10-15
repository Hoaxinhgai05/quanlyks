// ======================= SIDEBAR TOGGLE =======================
function toggleMenu() {
  const sidebar = document.getElementById("mySidebar");
  if (sidebar) {
    sidebar.style.width = sidebar.style.width === "250px" ? "0" : "250px";
  }
}

// ======================= CHECKIN / CHECKOUT =======================
document.addEventListener("DOMContentLoaded", () => {
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");

  if (checkin) {
    flatpickr(checkin, {
      dateFormat: "d/m/Y",
      allowInput: true,
      defaultDate: localStorage.getItem("checkin") || "22/09/2025",
      onChange: (_, s) => localStorage.setItem("checkin", s)
    });
    if (localStorage.getItem("checkin")) checkin.value = localStorage.getItem("checkin");
  }

  if (checkout) {
    flatpickr(checkout, {
      dateFormat: "d/m/Y",
      allowInput: true,
      defaultDate: localStorage.getItem("checkout") || "26/09/2025",
      onChange: (_, s) => localStorage.setItem("checkout", s)
    });
    if (localStorage.getItem("checkout")) checkout.value = localStorage.getItem("checkout");
  }

  // Cho click icon 🗓 mở lịch
  document.querySelectorAll(".calendar-icon").forEach(icon => {
    icon.addEventListener("click", function () {
      this.previousElementSibling._flatpickr.open();
    });
  });

  initGuests();
});

// ======================= GUESTS =======================
// ======================= GUESTS =======================
function initGuests() {
  const guestBox = document.getElementById("guestBox");
  const guestsPopup = document.getElementById("guestsPopup");
  const addRoomBtn = document.getElementById("addRoomBtn");
  const doneBtn = document.getElementById("doneBtn");
  if (!guestBox || !guestsPopup) return;

  let open = false;

  // Load dữ liệu đã lưu
  const saved = JSON.parse(localStorage.getItem("guestInfo") || "{}");
  if (saved.adults !== undefined) {
    guestBox.textContent = `${saved.adults} Adults, ${saved.children} Children`;
  }

  // Mở / đóng popup
  guestBox.addEventListener("click", () => {
    open = !open;
    guestsPopup.style.display = open ? "block" : "none";
  });

  // Thêm phòng
  if (addRoomBtn) {
    addRoomBtn.addEventListener("click", () => {
      const roomCount = guestsPopup.querySelectorAll(".room").length + 1; // ✅ luôn đếm thực tế
      const div = document.createElement("div");
      div.className = "room";
      div.innerHTML = `
        <div class="room-header">
          <span>Room ${roomCount}</span>
          <button class="delete-room" onclick="deleteRoom(this)">🗑</button>
        </div>
        <div class="controls">
          <div class="control">
            <label>Adults</label>
            <button class="minus">-</button>
            <span class="count">2</span>
            <button class="plus">+</button>
          </div>
          <div class="control">
            <label>Children</label>
            <button class="minus">-</button>
            <span class="count">0</span>
            <button class="plus">+</button>
          </div>
        </div>`;
      guestsPopup.insertBefore(div, addRoomBtn);
      updateRoomLabels(); // ✅ luôn cập nhật lại số phòng
    });
  }

  // Cộng trừ khách
  guestsPopup.addEventListener("click", (e) => {
    if (e.target.classList.contains("plus")) {
      const c = e.target.previousElementSibling;
      c.textContent = parseInt(c.textContent) + 1;
    } else if (e.target.classList.contains("minus")) {
      const c = e.target.nextElementSibling;
      let v = parseInt(c.textContent);
      if (v > 0) c.textContent = v - 1;
    }
  });

  // Hoàn tất chọn khách
  if (doneBtn) {
    doneBtn.addEventListener("click", () => {
      let adults = 0, children = 0;
      const rooms = document.querySelectorAll(".room");
      rooms.forEach(r => {
        const nums = r.querySelectorAll(".count");
        adults += parseInt(nums[0].textContent);
        children += parseInt(nums[1].textContent);
      });

      const info = { rooms: rooms.length, adults, children };
      localStorage.setItem("guestInfo", JSON.stringify(info));

      guestBox.textContent = `${adults} Adults, ${children} Children`;
      guestsPopup.style.display = "none";
      open = false;
    });
  }
}

// Xóa phòng
function deleteRoom(btn) {
  const room = btn.closest(".room");
  const rooms = document.querySelectorAll(".room");
  if (rooms.length > 1) {
    room.remove();
    updateRoomLabels(); // ✅ cập nhật lại số thứ tự phòng
  } else {
    alert("⚠️ Must have at least one room!");
  }
}

// ✅ Hàm cập nhật lại số thứ tự phòng sau khi xóa/thêm
function updateRoomLabels() {
  document.querySelectorAll(".room").forEach((r, i) => {
    const header = r.querySelector(".room-header span");
    if (header) header.textContent = `Room ${i + 1}`;
  });
}
