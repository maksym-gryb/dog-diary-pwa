
const calendar = document.getElementById("calendar");
const day = document.getElementById("day");

const project = "dog-diary-pwa";
const dbname = "diary";
const storename = "activities";

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const startingData = [
  {"date": "2026-06-09", "time": "06:30", "activity":"pee"}
];

/****************************** DB SETUP ******************************/
let db;
const request = indexedDB.open(dbname);
request.onerror = (event) => {
  console.error(`Database error: ${event.target.error?.message}`);

};
request.onsuccess = (event) => {
  db = event.target.result;
};
// This event is only implemented in recent browsers
request.onupgradeneeded = (event) => {
  // Save the IDBDatabase interface
  const db = event.target.result;

  // Create an objectStore for this database
  const objectStore = db.createObjectStore(storename, { autoIncrement: true });

  objectStore.createIndex("date", "date", { unique: false });
  // objectStore.createIndex("time", "time", { unique: false });

  // Use transaction oncomplete to make sure the objectStore creation is
  // finished before adding data into it.
  objectStore.transaction.oncomplete = (event) => {
    // Store values in the newly created objectStore.
    const customerObjectStore = db
      .transaction(storename, "readwrite")
      .objectStore(storename);
    startingData.forEach((act) => {
      customerObjectStore.add(act);
    });
  }
};
/****************************** END DB SETUP ******************************/

function renderCalendar(month, year) {
  calendar.textContent = "";
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInLastMonth = new Date(year, month - 1, 0).getDate();

  // 7 x 5 grid -> 35
  for (let i = 0; i < 35; i++) {

    let thisDay = new Date(year, month);
    thisDay.setDate(thisDay.getDate() + i - firstDayOfMonth)
    const d = thisDay.getDate();
    const d_str = thisDay.toISOString().split('T')[0]

    if (i != 0 && i % 7 == 0) {
      calendar.appendChild(document.createElement("br"))
    }


    const e = document.createElement("div");
    e.textContent = d;
    e.className = "calendar-date";
    e.onclick = function () { renderDay(d_str) };
    calendar.appendChild(e);
  }
}

function renderDay(renderDate) {
  day.textContent = "";

  const store = db.transaction(storename, "readonly").objectStore(storename);
  const index = store.index("date");

  const keyRange = IDBKeyRange.only(renderDate);
  const query = index.getAll(keyRange);


  query.onsuccess = () => {
    for (let i = 0; i < 48; i++) {
      const timeslot = `${leftPad(Math.floor(i / 2).toString())}:${leftPad((i % 2 * 30).toString())}`;

      const slot_data = query.result.filter(l => l.time == timeslot)

      const e = document.createElement("div");
      e.id = timeslot.replace(":", "_");
      e.className = "slot";
      e.textContent = `${timeslot} - ${slot_data.map(l => l.activity)}`
      day.appendChild(e);
    }

    window.location.hash = "";
    window.location.hash = "#10_30";
  }
}

/**
* @param {string} i - input
*/
function leftPad(i) {
  if (i.length == 2) return i;
  return "0"+i;
}

renderCalendar(currentMonth, currentYear);


// const newPeriodFormEl = document.getElementsByTagName("form")[0];
// const startDateInputEl = document.getElementById("start-date");
// const endDateInputEl = document.getElementById("end-date");
// const pastPeriodContainer = document.getElementById("past-periods");

// // Add the storage key as an app-wide constant
// const STORAGE_KEY = "dog-diary";

// // Listen to form submissions.
// newPeriodFormEl.addEventListener("submit", (event) => {
//   event.preventDefault();
//   const startDate = startDateInputEl.value;
//   const endDate = endDateInputEl.value;
//   if (checkDatesInvalid(startDate, endDate)) {
//     return;
//   }
//   storeNewPeriod(startDate, endDate);
//   renderPastPeriods();
//   newPeriodFormEl.reset();
// });

// function checkDatesInvalid(startDate, endDate) {
//   if (!startDate || !endDate || startDate > endDate) {
//     newPeriodFormEl.reset();
//     return true;
//   }
//   return false;
// }

// function storeNewPeriod(startDate, endDate) {
//   const periods = getAllStoredPeriods();
//   periods.push({ startDate, endDate });
//   periods.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
//   window.localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
// }

// function getAllStoredPeriods() {
//   const data = window.localStorage.getItem(STORAGE_KEY);
//   const periods = data ? JSON.parse(data) : [];
//   console.dir(periods);
//   console.log(periods);
//   return periods;
// }

// function renderPastPeriods() {
//   const pastPeriodHeader = document.createElement("h2");
//   const pastPeriodList = document.createElement("ul");
//   const periods = getAllStoredPeriods();
//   if (periods.length === 0) {
//     return;
//   }
//   pastPeriodContainer.textContent = "";
//   pastPeriodHeader.textContent = "Past periods";
//   periods.forEach((period) => {
//     const periodEl = document.createElement("li");
//     periodEl.textContent = `From ${formatDate(
//       period.startDate,
//     )} to ${formatDate(period.endDate)}`;
//     pastPeriodList.appendChild(periodEl);
//   });

//   pastPeriodContainer.appendChild(pastPeriodHeader);
//   pastPeriodContainer.appendChild(pastPeriodList);
// }

// function formatDate(dateString) {
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-US", { timeZone: "UTC" });
// }

// renderPastPeriods();