// 🔥 សូមដាក់ Link Web App ដែលអ្នកបាន Deploy ថ្មីនៅទីនេះ
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzFOoxgNjviWxiLx1Z3MF-jj9eR2Ai_4Gckp-mQufYD2OwvVIzEAkmcv2kYksKjcpTG/exec";

const dateDisplay = document.getElementById("dateDisplay");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");
const contentArea = document.getElementById("contentArea");
const desktopTableBody = document.getElementById("desktopTableBody");
const mobileCardContainer = document.getElementById("mobileCardContainer");
const noResult = document.getElementById("noResult");
const totalStaffEl = document.getElementById("totalStaff");
const totalOTEl = document.getElementById("totalOT");

let allEmployees = [];

// បង្ហាញកាលបរិច្ឆេទ
const now = new Date();
dateDisplay.innerText = now.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

// 1. Fetch Data
async function fetchData() {
  try {
    const response = await fetch(`${WEB_APP_URL}?action=read`);
    const data = await response.json();
    allEmployees = data;
    renderData(data);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oppss...",
      text: "បរាជ័យក្នុងការទាញទិន្នន័យ! សូមពិនិត្យមើល Internet ឬ Link",
      confirmButtonColor: "#3b82f6",
    });
    loading.classList.add("hidden");
  }
}

// 2. Render Data
function renderData(data) {
  updateSummary(data);

  loading.classList.add("hidden");
  contentArea.classList.remove("hidden");

  desktopTableBody.innerHTML = "";
  mobileCardContainer.innerHTML = "";

  if (data.length === 0) {
    noResult.classList.remove("hidden");
    return;
  } else {
    noResult.classList.add("hidden");
  }

  data.forEach((emp, index) => {
    const isPresent = emp.isPresent;

    // Status Badge
    const statusBadge = isPresent
      ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-check-circle mr-1.5"></i> បានកត់</span>`
      : `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">មិនទាន់មក</span>`;

    // Button Styles
    const btnClass = isPresent
      ? "bg-emerald-500 text-white cursor-not-allowed opacity-80 border border-emerald-600"
      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg shadow-blue-500/30 transform active:scale-95 border border-transparent";

    const btnText = isPresent ? "កត់រួចរាល់" : "កត់វត្តមាន (OT)";
    const btnIcon = isPresent
      ? '<i class="fa-solid fa-check"></i>'
      : '<i class="fa-solid fa-fingerprint"></i>';
    const isDisabled = isPresent ? "disabled" : "";

    // --- Desktop Row ---
    const tr = document.createElement("tr");
    tr.className = "transition duration-200 group";
    tr.innerHTML = `
            <td class="py-4 px-6 text-gray-400 font-poppins text-sm group-hover:text-blue-500 transition-colors">${
              index + 1
            }</td>
            <td class="py-4 px-6 text-gray-800 font-semibold text-base">${
              emp.name
            }</td>
            <td class="py-4 px-6 text-center">
                <span class="${
                  emp.gender === "ស្រី"
                    ? "text-pink-600 bg-pink-50 border-pink-100"
                    : "text-blue-600 bg-blue-50 border-blue-100"
                } font-bold text-xs px-3 py-1.5 rounded-lg border">
                    ${emp.gender}
                </span>
            </td>
            <td class="py-4 px-6 text-center">${statusBadge}</td>
            <td class="py-4 px-6 text-right">
                <button onclick="markAttendance(this, ${emp.row}, ${
      emp.todayCol
    }, '${emp.name}')" 
                    class="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ml-auto flex items-center gap-2 ${btnClass}" ${isDisabled}>
                    ${btnIcon} <span>${btnText}</span>
                </button>
            </td>
        `;
    desktopTableBody.appendChild(tr);

    // --- Mobile Card ---
    const card = document.createElement("div");
    card.className =
      "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-[0.99] transition-transform";
    card.innerHTML = `
            <div>
                <h3 class="font-bold text-gray-800 text-base mb-1">${
                  emp.name
                }</h3>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] px-2 py-0.5 rounded font-bold ${
                      emp.gender === "ស្រី"
                        ? "bg-pink-50 text-pink-500"
                        : "bg-blue-50 text-blue-500"
                    }">
                        ${emp.gender}
                    </span>
                    ${statusBadge}
                </div>
            </div>
            <button onclick="markAttendance(this, ${emp.row}, ${
      emp.todayCol
    }, '${emp.name}')" 
                class="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md ${btnClass}" ${isDisabled}>
                ${btnIcon}
            </button>
        `;
    mobileCardContainer.appendChild(card);
  });
}

// 3. Update Summary Stats
function updateSummary(data) {
  const total = data.length;
  const otCount = data.filter((emp) => emp.isPresent).length;

  // Simple count up effect
  totalStaffEl.innerText = total;
  totalOTEl.innerText = otCount;
}

// 4. Search Function
searchInput.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = allEmployees.filter((emp) =>
    emp.name.toLowerCase().includes(keyword)
  );
  renderData(filtered);
});

// 5. Mark Attendance
async function markAttendance(btn, row, col, name) {
  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;

  try {
    const response = await fetch(WEB_APP_URL + "?action=write", {
      method: "POST",
      body: JSON.stringify({ row: row, col: col }),
    });
    const result = await response.json();

    if (result.status === "success") {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({ icon: "success", title: `បានកត់វត្តមាន ${name}` });

      // Optimistic UI Update (Update Local Data without fetching again)
      const empIndex = allEmployees.findIndex((e) => e.row === row);
      if (empIndex !== -1) {
        allEmployees[empIndex].isPresent = true;
        const currentSearch = searchInput.value;
        const dataToRender = currentSearch
          ? allEmployees.filter((e) =>
              e.name.toLowerCase().includes(currentSearch.toLowerCase())
            )
          : allEmployees;
        renderData(dataToRender);
      }
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    Swal.fire("Error", "មានបញ្ហា៖ " + error, "error");
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

// Start
fetchData();
