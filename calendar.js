/* =========================================
   AYNA BOOK
   WORLD PERPETUAL CALENDAR
   ========================================= */

"use strict";


/* ---------- ELEMENTS ---------- */

const daysEl =
  document.getElementById("days");

const monthNameEl =
  document.getElementById("monthName");

const yearNameEl =
  document.getElementById("yearName");

const yearInput =
  document.getElementById("year");

const countrySelect =
  document.getElementById("country");

const selectedDateEl =
  document.getElementById("selectedDate");

const selectedHijriEl =
  document.getElementById("selectedHijri");

const eventsEl =
  document.getElementById("events");

const prevMonthBtn =
  document.getElementById("prevMonth");

const nextMonthBtn =
  document.getElementById("nextMonth");

const todayBtn =
  document.getElementById("todayBtn");


/* ---------- MONTH NAMES ---------- */

const months = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর"
];


/* ---------- HIJRI MONTH ---------- */

const hijriMonths = [
  "মুহররম",
  "সফর",
  "রবিউল আউয়াল",
  "রবিউস সানি",
  "জুমাদিউল আউয়াল",
  "জুমাদিউস সানি",
  "রজব",
  "শাবান",
  "রমজান",
  "শাওয়াল",
  "জিলকদ",
  "জিলহজ"
];


/* ---------- STATE ---------- */

const now = new Date();

let currentYear =
  now.getFullYear();

let currentMonth =
  now.getMonth();

let selectedDate =
  new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );


/* ---------- LIMITS ---------- */

const MIN_YEAR = 1;
const MAX_YEAR = 9999;


/* ---------- SAVE ---------- */

function saveSettings(){

  localStorage.setItem(
    "aynaCalendarCountry",
    countrySelect.value
  );

}


/* ---------- LOAD ---------- */

function loadSettings(){

  const savedCountry =
    localStorage.getItem(
      "aynaCalendarCountry"
    );

  if(savedCountry){

    const option =
      [...countrySelect.options]
      .find(
        option =>
          option.value === savedCountry
      );

    if(option){

      countrySelect.value =
        savedCountry;

    }

  }

}


/* ---------- NUMBER ---------- */

function bnNumber(value){

  const en =
    String(value);

  const bn =
    "০১২৩৪৫৬৭৮৯";

  return en.replace(
    /\d/g,
    digit =>
      bn[digit]
  );

}


/* ---------- GREGORIAN FORMAT ---------- */

function formatDate(date){

  return date.toLocaleDateString(
    "bn-BD",
    {
      weekday:"long",
      year:"numeric",
      month:"long",
      day:"numeric"
    }
  );

}


/* ---------- HIJRI ---------- */

function getHijri(date){

  try{

    const result =
      new Intl.DateTimeFormat(
        "en-u-ca-islamic",
        {
          day:"numeric",
          month:"numeric",
          year:"numeric"
        }
      ).formatToParts(date);

    let day = "";
    let month = "";
    let year = "";

    result.forEach(part => {

      if(part.type === "day")
        day = Number(part.value);

      if(part.type === "month")
        month = Number(part.value);

      if(part.type === "year")
        year = Number(part.value);

    });

    return {
      day,
      month,
      year
    };

  }catch(error){

    return null;

  }

}


/* ---------- HIJRI TEXT ---------- */

function hijriText(date){

  const h =
    getHijri(date);

  if(!h){

    return "হিজরি তারিখ পাওয়া যায়নি";

  }

  const monthName =
    hijriMonths[h.month - 1] ||
    "হিজরি মাস";

  return (
    bnNumber(h.day) +
    " " +
    monthName +
    " " +
    bnNumber(h.year) +
    " হিজরি"
  );

}


/* ---------- CALENDAR ---------- */

function renderCalendar(){

  daysEl.innerHTML = "";

  yearInput.value =
    currentYear;

  yearNameEl.textContent =
    bnNumber(currentYear);

  monthNameEl.textContent =
    months[currentMonth];


  const firstDay =
    new Date(
      currentYear,
      currentMonth,
      1
    ).getDay();


  const daysInMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();


  /* EMPTY CELLS */

  for(
    let i = 0;
    i < firstDay;
    i++
  ){

    const empty =
      document.createElement("div");

    empty.className =
      "day empty";

    daysEl.appendChild(empty);

  }


  /* DAYS */

  for(
    let day = 1;
    day <= daysInMonth;
    day++
  ){

    const cell =
      document.createElement("div");

    cell.className =
      "day";


    const date =
      new Date(
        currentYear,
        currentMonth,
        day
      );


    /* TODAY */

    if(
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    ){

      cell.classList.add("today");

    }


    /* SELECTED */

    if(
      date.getFullYear() ===
        selectedDate.getFullYear() &&
      date.getMonth() ===
        selectedDate.getMonth() &&
      date.getDate() ===
        selectedDate.getDate()
    ){

      cell.classList.add("selected");

    }


    const number =
      document.createElement("div");

    number.className =
      "day-number";

    number.textContent =
      bnNumber(day);


    const hijri =
      document.createElement("div");

    hijri.className =
      "hijri";

    const h =
      getHijri(date);

    if(h){

      hijri.textContent =
        bnNumber(h.day) +
        " " +
        (hijriMonths[h.month - 1] || "");

    }


    cell.appendChild(number);
    cell.appendChild(hijri);


    /* EVENT */

    const event =
      getEvent(date);

    if(event){

      const dot =
        document.createElement("span");

      dot.className =
        "event-dot";

      cell.appendChild(dot);

    }


    cell.addEventListener(
      "click",
      () => {

        selectedDate =
          new Date(date);

        showSelectedDate();

        renderCalendar();

      }
    );


    daysEl.appendChild(cell);

  }

}


/* ---------- EVENT DATABASE ---------- */

function getEvent(date){

  const month =
    date.getMonth();

  const day =
    date.getDate();


  /* Gregorian fixed dates */

  if(month === 0 && day === 1)
    return "New Year's Day";

  if(month === 1 && day === 14)
    return "Valentine's Day";

  if(month === 4 && day === 1)
    return "International Workers' Day";

  if(month === 5 && day === 5)
    return "World Environment Day";

  if(month === 6 && day === 1)
    return "Canada Day";

  if(month === 7 && day === 15)
    return "Independence Day";

  if(month === 9 && day === 24)
    return "United Nations Day";

  if(month === 11 && day === 25)
    return "Christmas Day";


  return null;

}


/* ---------- SELECTED DATE ---------- */

function showSelectedDate(){

  selectedDateEl.textContent =
    formatDate(selectedDate);


  selectedHijriEl.textContent =
    hijriText(selectedDate);


  eventsEl.innerHTML = "";


  const event =
    getEvent(selectedDate);


  if(event){

    const box =
      document.createElement("div");

    box.className =
      "event";

    box.textContent =
      "📌 " + event;

    eventsEl.appendChild(box);

  }else{

    const box =
      document.createElement("div");

    box.className =
      "event";

    box.textContent =
      "এই তারিখের জন্য কোনো সংরক্ষিত বিশেষ দিন নেই।";

    eventsEl.appendChild(box);

  }

}


/* ---------- CHANGE MONTH ---------- */

function changeMonth(amount){

  currentMonth += amount;


  if(currentMonth < 0){

    currentMonth = 11;
    currentYear--;

  }


  if(currentMonth > 11){

    currentMonth = 0;
    currentYear++;

  }


  if(currentYear < MIN_YEAR)
    currentYear = MIN_YEAR;

  if(currentYear > MAX_YEAR)
    currentYear = MAX_YEAR;


  selectedDate =
    new Date(
      currentYear,
      currentMonth,
      1
    );


  renderCalendar();

  showSelectedDate();

}


/* ---------- PREVIOUS ---------- */

prevMonthBtn.addEventListener(
  "click",
  () => {

    changeMonth(-1);

  }
);


/* ---------- NEXT ---------- */

nextMonthBtn.addEventListener(
  "click",
  () => {

    changeMonth(1);

  }
);


/* ---------- YEAR INPUT ---------- */

yearInput.addEventListener(
  "change",
  () => {

    let year =
      parseInt(
        yearInput.value,
        10
      );


    if(
      isNaN(year) ||
      year < MIN_YEAR
    ){

      year = MIN_YEAR;

    }


    if(year > MAX_YEAR){

      year = MAX_YEAR;

    }


    currentYear =
      year;


    selectedDate =
      new Date(
        currentYear,
        currentMonth,
        1
      );


    renderCalendar();

    showSelectedDate();

  }
);


/* ---------- COUNTRY ---------- */

countrySelect.addEventListener(
  "change",
  saveSettings
);


/* ---------- TODAY ---------- */

todayBtn.addEventListener(
  "click",
  () => {

    const today =
      new Date();

    currentYear =
      today.getFullYear();

    currentMonth =
      today.getMonth();

    selectedDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

    renderCalendar();

    showSelectedDate();

  }
);


/* ---------- START ---------- */

loadSettings();

renderCalendar();

showSelectedDate();