// ================= MENU SIDEBAR =================
function toggleMenu() {
  const sidebar = document.getElementById("mySidebar");
  if (sidebar) {
    sidebar.style.width = sidebar.style.width === "250px" ? "0" : "250px";
  }
}

// ================= KHỞI TẠO FLATPICKR =================
document.addEventListener("DOMContentLoaded", () => {
  flatpickr("#checkin", {
    dateFormat: "d/m/Y",
    onChange: (selectedDates, dateStr) => {
      saveGuestsData(); // cập nhật dữ liệu chung
    },
  });

  flatpickr("#checkout", {
    dateFormat: "d/m/Y",
    onChange: (selectedDates, dateStr) => {
      saveGuestsData(); // cập nhật dữ liệu chung
    },
  });

  initGuestsPopup();
  restoreGuestData(); // khôi phục dữ liệu cũ nếu có
});

// ================= KHỞI TẠO POPUP GUESTS =================
function initGuestsPopup() {
  const guestBox = document.getElementById("guestBox");
  const guestsPopup = document.getElementById("guestsPopup");
  const addRoomBtn = document.getElementById("addRoomBtn");
  const doneBtn = document.getElementById("doneBtn");

  guestBox.addEventListener("click", () => {
    guestsPopup.style.display = "block";
  });

  doneBtn.addEventListener("click", () => {
    guestsPopup.style.display = "none";
    updateGuestBox();
    saveGuestsData();
  });

  addRoomBtn.addEventListener("click", () => {
    addRoom();
    saveGuestsData();
  });

  attachRoomEvents(document.querySelector(".room"));
}

// ================= THÊM PHÒNG =================
function addRoom() {
  const popup = document.getElementById("guestsPopup");
  const roomCount = popup.querySelectorAll(".room").length + 1;

  const roomDiv = document.createElement("div");
  roomDiv.classList.add("room");
  roomDiv.innerHTML = `
    <div class="room-header">
      <span>Room ${roomCount}</span>
      <button class="remove-room">🗑</button>
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
      <div class="control">
        <label>Type Room</label>
        <select class="room-type">
          <option value="Single Room">Single Room</option>
          <option value="Twin Room">Twin Room</option>
          <option value="VIP Room">VIP Room</option>
        </select>
      </div>
    </div>
  `;
  popup.insertBefore(roomDiv, document.getElementById("addRoomBtn"));
  attachRoomEvents(roomDiv);
}

// ================= GẮN SỰ KIỆN CHO 1 PHÒNG =================
function attachRoomEvents(roomDiv) {
  const buttons = roomDiv.querySelectorAll(".plus, .minus");
  const removeBtn = roomDiv.querySelector(".remove-room");
  const adultsSpan = roomDiv.querySelectorAll(".count")[0];
  const typeSelect = roomDiv.querySelector(".room-type");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const span = btn.parentElement.querySelector(".count");
      let value = parseInt(span.textContent);
      if (btn.classList.contains("plus")) value++;
      else if (btn.classList.contains("minus") && value > 0) value--;
      span.textContent = value;

      // Nếu adults > 2 → auto Twin Room
      const adults = parseInt(adultsSpan.textContent);
      if (adults > 2) {
        typeSelect.value = "Twin Room";
        typeSelect.disabled = true;
      } else {
        typeSelect.disabled = false;
      }

      updateGuestBox();
      saveGuestsData();
    });
  });

  // Xóa phòng
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      roomDiv.remove();
      updateRoomLabels();
      updateGuestBox();
      saveGuestsData();
    });
  }
}

// ================= CẬP NHẬT TÊN ROOM 1, ROOM 2... =================
function updateRoomLabels() {
  const rooms = document.querySelectorAll(".room");
  rooms.forEach((room, index) => {
    const header = room.querySelector(".room-header span");
    header.textContent = `Room ${index + 1}`;
  });
}

// ================= CẬP NHẬT Ô GUEST BOX =================
function updateGuestBox() {
  const rooms = document.querySelectorAll(".room");
  let totalAdults = 0;
  let totalChildren = 0;

  rooms.forEach((room) => {
    const counts = room.querySelectorAll(".count");
    totalAdults += parseInt(counts[0].textContent);
    totalChildren += parseInt(counts[1].textContent);
  });

  const guestBox = document.getElementById("guestBox");
  guestBox.textContent = `${totalAdults} Adults, ${totalChildren} Children`;
}

// ================= LƯU DỮ LIỆU ĐỒNG BỘ =================
function saveGuestsData() {
  const rooms = document.querySelectorAll(".room");
  const roomData = [];

  rooms.forEach((room) => {
    const counts = room.querySelectorAll(".count");
    const type = room.querySelector(".room-type").value;

    roomData.push({
      adults: parseInt(counts[0].textContent),
      children: parseInt(counts[1].textContent),
      type: type,
    });
  });

  const data = {
    checkin: document.getElementById("checkin").value || "",
    checkout: document.getElementById("checkout").value || "",
    rooms: roomData,
  };

  localStorage.setItem("guestData", JSON.stringify(data));
}

// ================= KHÔI PHỤC DỮ LIỆU CŨ =================
function restoreGuestData() {
  const data = JSON.parse(localStorage.getItem("guestData"));
  if (!data) return;

  document.getElementById("checkin").value = data.checkin || "";
  document.getElementById("checkout").value = data.checkout || "";

  const popup = document.getElementById("guestsPopup");
  const baseRoom = popup.querySelector(".room");
  const addBtn = document.getElementById("addRoomBtn");

  // Xóa tất cả phòng trừ phòng đầu
  popup.querySelectorAll(".room:not(:first-child)").forEach(r => r.remove());

  // Cập nhật dữ liệu phòng đầu
  if (data.rooms && data.rooms.length > 0) {
    const r0 = data.rooms[0];
    const counts = baseRoom.querySelectorAll(".count");
    counts[0].textContent = r0.adults;
    counts[1].textContent = r0.children;
    const select = baseRoom.querySelector(".room-type");
    select.value = r0.type;
  }

  // Nếu có nhiều hơn 1 phòng → thêm vào
  for (let i = 1; i < data.rooms.length; i++) {
    addRoom();
    const newRoom = popup.querySelectorAll(".room")[i];
    const r = data.rooms[i];
    const counts = newRoom.querySelectorAll(".count");
    counts[0].textContent = r.adults;
    counts[1].textContent = r.children;
    newRoom.querySelector(".room-type").value = r.type;
  }

  updateGuestBox();
}
