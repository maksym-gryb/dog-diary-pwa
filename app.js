const login_section = document.getElementById("login_section");
const calendar = document.getElementById("calendar");
const day = document.getElementById("day");

const project = "dog-diary-pwa";
const dbname = "diary";
const storename = "diary";

const today = new Date();
const currentDay = today.getDay();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const startingData = [
  { "date": "2026-06-09", "time": "06:30", "activity": "pee" }
];

const activities = ["pee", "poop", "toothbrush", "bath"];

const LegacyActivityMap = Object.freeze({
  peeing: "pee",
  pooping: "poop"
});

const ActivityIcon = Object.freeze({
  pee: "fa-toilet",
  poop: "fa-poo",
  walk: "fa-person-walking",
  eat: "fa-bone",
  drink: "fa-mug-hot",
  sleep: "fa-bed",

  toothbrush: "fa-tooth",
  bath: "fa-bath"
});

function createIcon(activityType) {
  const icon = document.createElement("i");

  icon.classList.add("fa-solid");

  let t = activityType;
  if(!activities.includes(t)) {
    t = LegacyActivityMap[t]
  }

  const specific = ActivityIcon[t] || "fa-question";
  icon.classList.add(specific);

  return icon;
}

let data_set = []

/****************************** DB SETUP ******************************/
// Initialize Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { 
  collection,
  query,
  where,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
}
  from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

let unsubscribe = null

function listenByDate(db, queryDate) {
  day.innerHTML = "<div class='spinner'/>";

  document.querySelectorAll(".calendar-date-selected").forEach(e => {
    e.classList.remove("calendar-date-selected");
  });

  const selectedElement = document.getElementById(queryDate);
  selectedElement.classList.add("calendar-date-selected");

  // stop old listener
  if (unsubscribe) {
    unsubscribe();
  }

  const q = query(
    collection(db, "diary"),
    where("date", "==", queryDate)
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    data_set = entries;

    console.log("Today updated:", entries);
    renderDay(queryDate, entries);
  });
}

// async function loadToday() {
//   const q = query(
//     collection(db, "diary"),
//     where("date", "==", "2026-06-09")
//   );

//   const snapshot = await getDocs(q);

//   snapshot.forEach((docSnap) => {
//     console.log(docSnap.data());
//   });

//   return snapshot.docs.map(s => s.data());
// }

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { firebaseConfig } from "./config.local.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
let userCredential = null;

// Enable persistent login
await setPersistence(auth, browserLocalPersistence);


// const analytics = getAnalytics(app);

const db = getFirestore(app)

// let db;
// const request = indexedDB.open(dbname);
// request.onerror = (event) => {
//   console.error(`Database error: ${event.target.error?.message}`);

// };
// request.onsuccess = (event) => {
//   db = event.target.result;
// };
// // This event is only implemented in recent browsers
// request.onupgradeneeded = (event) => {
//   // Save the IDBDatabase interface
//   const db = event.target.result;

//   // Create an objectStore for this database
//   const objectStore = db.createObjectStore(storename, { autoIncrement: true });

//   objectStore.createIndex("date", "date", { unique: false });
//   // objectStore.createIndex("time", "time", { unique: false });

//   // Use transaction oncomplete to make sure the objectStore creation is
//   // finished before adding data into it.
//   objectStore.transaction.oncomplete = (event) => {
//     // Store values in the newly created objectStore.
//     const customerObjectStore = db
//       .transaction(storename, "readwrite")
//       .objectStore(storename);
//     startingData.forEach((act) => {
//       customerObjectStore.add(act);
//     });
//   }
// };
/****************************** END DB SETUP ******************************/

function renderCalendar(month, year) {
  calendar.textContent = "";
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInLastMonth = new Date(year, month - 1, 0).getDate();

  for (let i = 0; i < 7 * 5; i++) {

    let thisDay = new Date(year, month);
    thisDay.setDate(thisDay.getDate() + i - firstDayOfMonth)
    const d = thisDay.getDate();
    
    const isCurrentDay =
      currentYear == thisDay.getFullYear() && currentMonth == thisDay.getMonth() && currentDay == thisDay.getDate();

    const d_str = thisDay.toISOString().split('T')[0]

    if (i != 0 && i % 7 == 0) {
      calendar.appendChild(document.createElement("br"))
    }


    const e = document.createElement("div");
    e.id = d_str;
    e.textContent = d;
    e.classList.add("calendar-date");
    if(isCurrentDay) {
      e.classList.add("calendar-date-today");
    }
    e.onclick = function () { listenByDate(db, d_str) };
    calendar.appendChild(e);
  }
}

async function renderDay(renderDate, all_data) {
  day.textContent = "";

  // const all_data = await loadToday();

  // const store = db.transaction(storename, "readonly").objectStore(storename);
  // const index = store.index("date");

  // const keyRange = IDBKeyRange.only(renderDate);
  // const query = index.getAll(keyRange);


  // query.onsuccess = () => {
  for (let i = 0; i < 48; i++) {
    const timeslot = `${leftPad(Math.floor(i / 2).toString())}:${leftPad((i % 2 * 30).toString())}`;

    const slot_data = all_data.filter(l => l.time == timeslot)

    const e = document.createElement("div");
    e.id = timeslot.replace(":", "_");
    e.className = "slot";
    // e.textContent = `${timeslot} - ${slot_data.map(l => l.activity)}`
    const acts = activities.map(a => {
      const dv = document.createElement("div");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = slot_data.filter(l => l.activity == a).length > 0 ? true : false;

      input.addEventListener("click", async (e) => {
        e.stopPropagation();

        await toggleActivity(timeslot, renderDate, a)
      });

      dv.classList.add("activity_checkbox")
      if (input.checked) {
        dv.classList.add("checked")
      }

      dv.innerHTML = `${ActivityIcon[a]}: `;
      dv.appendChild(input)
      dv.appendChild(createIcon(a))
      return dv;
    });
    e.innerHTML = `<b>${timeslot}</b>`
    acts.forEach(act => e.appendChild(act));
    // e.onclick = function () { toggleActivity(timeslot, renderDate) }
    e.onclick = function () { revealSlotOptions(e.id) }
    day.appendChild(e);
  }

  // window.location.hash = "";
  // window.location.hash = "#10_30";
  // }
}

async function toggleActivity(timeslot, date, activity) {
  try {
    let existingData = [];
    if (data_set.length > 0) {
      existingData = data_set.filter(x => 
        x.time == timeslot && x.date == date && x.activity == activity);
    }

    if(existingData && existingData.length > 0) {
      await Promise.all(
        existingData.map(d => deleteDoc(doc(db, storename, d.id)))
      );
      console.log("Deleted ids: ", existingData.map(d => d.id).join(" , "));
    }
    else {
      const docRef = await addDoc(collection(db, storename), {
        date: date,
        time: timeslot,
        activity: activity,
        creator: auth.currentUser.uid
      });

    console.log("Saved with ID:", docRef.id);
    }
  } catch (e) {
    console.error("Error adding document:", e);
  }
}

function revealSlotOptions(slot_id) {
  console.log(slot_id)

  const slot = document.getElementById(slot_id);
  const olds = document.getElementsByClassName("slot_select")

  let isReSelected = false;
  for (const l of olds) {
    if(l.id == slot.id) {
      isReSelected = true;
      break;
    }
  }

  while (olds.length > 0 && olds[0].classList.contains("slot_select")) {
    olds[0].classList.remove("slot_select")
  }

  if(!isReSelected) {
    slot.classList.add("slot_select")
  }
}

/**
* @param {string} i - input
*/
function leftPad(i) {
  if (i.length == 2) return i;
  return "0" + i;
}

// Login button
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    userCredential = user;
    console.log(user)
    login_section.innerHTML = `<p>Logged in as: ${user.email}</p>`
    renderCalendar(currentMonth, currentYear);
  } else {
    calendar.innerText = "Not logged in";
  }
});



// if(login()){
//   renderCalendar(currentMonth, currentYear);
// }


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