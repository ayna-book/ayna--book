"use strict";


/* =========================================
   AYNA BOOK
   ARABIC / HIJRI CALENDAR
   ========================================= */


/* ---------- ELEMENTS ---------- */

const daysEl =
  document.getElementById("days");

const hijriYearEl =
  document.getElementById("hijriYear");

const hijriMonthEl =
  document.getElementById("hijriMonth");

const monthArabicEl =
  document.getElementById("monthArabic");

const monthBanglaEl =
  document.getElementById("monthBangla");

const selectedHijriEl =
  document.getElementById("selectedHijri");

const selectedGregorianEl =
  document.getElementById("selectedGregorian");

const eventBox =
  document.getElementById("eventBox");

const prevBtn =
  document.getElementById("prevBtn");

const nextBtn =
  document.getElementById("nextBtn");

const todayBtn =
  document.getElementById("todayBtn");


/* ---------- MONTHS ---------- */

const months = [

  {
    ar:"مُحَرَّم",
    bn:"মুহররম"
  },

  {
    ar:"صَفَر",
    bn:"সফর"
  },

  {
    ar:"رَبِيعُ الأَوَّل",
    bn:"রবিউল আউয়াল"
  },

  {
    ar:"رَبِيعُ الثَّانِي",
    bn:"রবিউস সানি"
  },

  {
    ar:"جُمَادَىٰ الأُولَى",
    bn:"জুমাদিউল আউয়াল"
  },

  {
    ar:"جُمَادَىٰ الثَّانِيَة",
    bn:"জুমাদিউস সানি"
  },

  {
    ar:"رَجَب",
    bn:"রজব"
  },

  {
    ar:"شَعْبَان",
    bn:"শাবান"
  },

  {
    ar:"رَمَضَان",
    bn:"রমজান"
  },

  {
    ar:"شَوَّال",
    bn:"শাওয়াল"
  },

  {
    ar:"ذُو القَعْدَة",
    bn:"জিলকদ"
  },

  {
    ar:"ذُو الحِجَّة",
    bn:"জিলহজ"
  }

];


/* ---------- BANGLA NUMBERS ---------- */

function bnNumber(value){

  const digits =
    "০১২৩৪৫৬৭৮৯";

  return String(value).replace(
    /\d/g,
    n => digits[n]
  );

}


/* ---------- TODAY ---------- */

const today =
  new Date();


/* ---------- GET CURRENT HIJRI ---------- */

function getCurrentHijri(){

  const parts =
    new Intl.DateTimeFormat(
      "en-u-ca-islamic",
      {
        day:"numeric",
        month:"numeric",
        year:"numeric"
      }
    ).formatToParts(today);


  let day = 1;
  let month = 1;
  let year = 1447;


  parts.forEach(part => {

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

}


/* ---------- STATE ---------- */

const current =
  getCurrentHijri();

let currentYear =
  current.year;

let currentMonth =
  current.month;

let selected =
  new Date();


/* ---------- DAYS IN HIJRI MONTH ---------- */

/*
  Islamic calendar alternates
  30 / 29 days.

  This is a calculated perpetual
  calendar. Actual moon sighting
  can differ by location.
*/

function daysInHijriMonth(
  year,
  month
){

  if(month % 2 === 1)
    return 30;

  if(
    month === 12 &&
    isLeapHijriYear(year)
  )
    return 30;

  return 29;

}


/* ---------- HIJRI LEAP YEAR ---------- */

function isLeapHijriYear(year){

  const position =
    ((year * 11) + 14) % 30;

  const leapYears = [
    2,5,7,10,13,
    16,18,21,24,
    26,29
  ];

  return leapYears.includes(position);

}


/* ---------- HIJRI TO JULIAN ---------- */

function hijriToJD(
  year,
  month,
  day
){

  return (
    day +
    Math.ceil(
      29.5 * (month - 1)
    ) +
    (year - 1) * 354 +
    Math.floor(
      (3 + 11 * year) / 30
    ) +
    1948439.5 -
    1
  );

}


/* ---------- JULIAN TO GREGORIAN ---------- */

function jdToDate(jd){

  const unix =
    (jd - 2440587.5) *
    86400000;

  return new Date(unix);

}


/* ---------- CONVERT ---------- */

function hijriToGregorian(
  year,
  month,
  day
){

  const jd =
    hijriToJD(
      year,
      month,
      day
    );

  return jdToDate(jd);

}


/* ---------- GREGORIAN TEXT ---------- */

function gregorianText(date){

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


/* ---------- SPECIAL DAYS ---------- */

function getSpecialDay(
  month,
  day
){

  if(month === 1 && day === 1)
    return "🌙 ইসলামী নববর্ষ";

  if(month === 1 && day === 10)
    return "🕌 আশুরা";

  if(month === 9 && day === 1)
    return "🌙 রমজান শুরু";

  if(month === 9 && day === 27)
    return "✨ লাইলাতুল কদর";

  if(month === 10 && day === 1)
    return "🎉 ঈদুল ফিতর";

  if(month === 12 && day === 9)
    return "🕋 আরাফার দিন";

  if(month === 12 && day === 10)
    return "🕋 ঈদুল আজহা";

  return null;

}


/* ---------- RENDER ---------- */

function render(){

  daysEl.innerHTML = "";


  hijriYearEl.value =
    currentYear;

  hijriMonthEl.value =
    currentMonth;


  const month =
    months[currentMonth - 1];


  monthArabicEl.textContent =
    month.ar;

  monthBanglaEl.textContent =
    month.bn;


  const totalDays =
    daysInHijriMonth(
      currentYear,
      currentMonth
    );


  /*
    Find Gregorian weekday
    for Hijri month first day.
  */

  const firstDate =
    hijriToGregorian(
      currentYear,
      currentMonth,
      1
    );


  const firstWeekday =
    firstDate.getDay();


  /* EMPTY */

  for(
    let i = 0;
    i < firstWeekday;
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
    day <= totalDays;
    day++
  ){

    const cell =
      document.createElement("div");

    cell.className =
      "day";


    const gregorian =
      hijriToGregorian(
        currentYear,
        currentMonth,
        day
      );


    /* HIJRI NUMBER */

    const number =
      document.createElement("div");

    number.className =
      "day-number";

    number.textContent =
      bnNumber(day);


    /* GREGORIAN */

    const greg =
      document.createElement("div");

    greg.className =
      "gregorian";

    greg.textContent =
      gregorian.toLocaleDateString(
        "bn-BD",
        {
          day:"numeric",
          month:"short"
        }
      );


    cell.appendChild(number);
    cell.appendChild(greg);


    /* SPECIAL */

    const special =
      getSpecialDay(
        currentMonth,
        day
      );


    if(special){

      const dot =
        document.createElement("span");

      dot.className =
        "special";

      cell.appendChild(dot);

    }


    /* TODAY */

    const currentH =
      getCurrentHijri();


    if(
      currentH.year === currentYear &&
      currentH.month === currentMonth &&
      currentH.day === day
    ){

      cell.classList.add("today");

    }


    /* CLICK */

    cell.addEventListener(
      "click",
      () => {

        selected =
          gregorian;

        showSelected(
          day,
          gregorian,
          special
        );

        document
          .querySelectorAll(".day")
          .forEach(
            item =>
              item.classList.remove(
                "selected"
              )
          );

        cell.classList.add(
          "selected"
        );

      }
    );


    daysEl.appendChild(cell);

  }

}


/* ---------- SELECTED ---------- */

function showSelected(
  day,
  gregorian,
  special
){

  const month =
    months[currentMonth - 1];


  selectedHijriEl.textContent =
    bnNumber(day) +
    " " +
    month.bn +
    " " +
    bnNumber(currentYear) +
    " হিজরি";


  selectedGregorianEl.textContent =
    gregorianText(gregorian);


  eventBox.innerHTML = "";


  if(special){

    const box =
      document.createElement("div");

    box.className =
      "event";

    box.textContent =
      special;

    eventBox.appendChild(box);

  }

}


/* ---------- INITIAL SELECTED ---------- */

function showToday(){

  const h =
    getCurrentHijri();


  const date =
    hijriToGregorian(
      h.year,
      h.month,
      h.day
    );


  currentYear =
    h.year;

  currentMonth =
    h.month;

  selected =
    date;


  const special =
    getSpecialDay(
      h.month,
      h.day
    );


  showSelected(
    h.day,
    date,
    special
  );


  render();

}


/* ---------- PREVIOUS ---------- */

prevBtn.addEventListener(
  "click",
  () => {

    currentMonth--;

    if(currentMonth < 1){

      currentMonth = 12;
      currentYear--;

    }

    render();

  }
);


/* ---------- NEXT ---------- */

nextBtn.addEventListener(
  "click",
  () => {

    currentMonth++;

    if(currentMonth > 12){

      currentMonth = 1;
      currentYear++;

    }

    render();

  }
);


/* ---------- YEAR ---------- */

hijriYearEl.addEventListener(
  "change",
  () => {

    let value =
      parseInt(
        hijriYearEl.value,
        10
      );


    if(
      isNaN(value) ||
      value < 1
    )
      value = 1;


    if(value > 9999)
      value = 9999;


    currentYear =
      value;


    render();

  }
);


/* ---------- MONTH ---------- */

hijriMonthEl.addEventListener(
  "change",
  () => {

    let value =
      parseInt(
        hijriMonthEl.value,
        10
      );


    if(
      isNaN(value) ||
      value < 1
    )
      value = 1;


    if(value > 12)
      value = 12;


    currentMonth =
      value;


    render();

  }
);


/* ---------- TODAY ---------- */

todayBtn.addEventListener(
  "click",
  showToday
);


/* ---------- START ---------- */

showToday();