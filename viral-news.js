/*
=========================================================
AYNA BOOK ★ VIRAL NEWS
viral-news.js
=========================================================

এই ফাইলের কাজ:

1. News list দেখানো
2. Search
3. Category filter
4. Previous / Next
5. Video player
6. News card
7. Date/time
8. Refresh
9. URL দিয়ে video চালানো
10. ভবিষ্যতে real API যুক্ত করার জন্য প্রস্তুত structure

IMPORTANT:
কোনো fake live news তৈরি করা হচ্ছে না।
NEWS_DATA-তে verified video URL বসাতে হবে।
=========================================================
*/

"use strict";


/* =====================================================
   GLOBAL STATE
===================================================== */

let NEWS_DATA = [];

let filteredNews = [];

let currentIndex = 0;


/* =====================================================
   ELEMENTS
===================================================== */

const newsGrid =
  document.getElementById("newsGrid");

const searchInput =
  document.getElementById("searchInput");

const categoryFilter =
  document.getElementById("categoryFilter");

const refreshBtn =
  document.getElementById("refreshBtn");

const refreshBtnTop =
  document.getElementById("refreshBtnTop");

const homeBtn =
  document.getElementById("homeBtn");

const previousBtn =
  document.getElementById("previousBtn");

const nextBtn =
  document.getElementById("nextBtn");

const openVideoBtn =
  document.getElementById("openVideoBtn");

const newsVideo =
  document.getElementById("newsVideo");

const videoPlaceholder =
  document.getElementById("videoPlaceholder");

const videoTitle =
  document.getElementById("videoTitle");

const videoDescription =
  document.getElementById("videoDescription");

const videoCategory =
  document.getElementById("videoCategory");

const videoSource =
  document.getElementById("videoSource");

const videoDate =
  document.getElementById("videoDate");

const lastUpdated =
  document.getElementById("lastUpdated");


/* =====================================================
   NEWS DATA
=====================================================

   এখানে verified news item যোগ করা যাবে।

   video:
   - MP4 হলে সরাসরি browser player-এ চলবে।
   - YouTube/Facebook/TikTok page URL এখানে
     সরাসরি <video> tag-এ চলবে না।
   - সেক্ষেত্রে embed/API integration লাগবে।

===================================================== */

NEWS_DATA = [

  {
    id:1,

    title:
      "AYNA BOOK Viral News — Verified News Feed",

    description:
      "এখানে verified viral news video যুক্ত করা যাবে।",

    category:
      "world",

    source:
      "Verified Source",

    date:
      getToday(),

    video:
      "",

    thumbnail:
      "",

    verified:
      false
  },

  {
    id:2,

    title:
      "Technology News — Daily Update",

    description:
      "নতুন প্রযুক্তি, AI, smartphone, computer এবং robotics সংবাদ।",

    category:
      "technology",

    source:
      "Technology Source",

    date:
      getToday(),

    video:
      "",

    thumbnail:
      "",

    verified:
      false
  },

  {
    id:3,

    title:
      "Science & Research News",

    description:
      "নতুন বৈজ্ঞানিক আবিষ্কার এবং গবেষণার সংবাদ।",

    category:
      "science",

    source:
      "Science Source",

    date:
      getToday(),

    video:
      "",

    thumbnail:
      "",

    verified:
      false
  },

  {
    id:4,

    title:
      "Education News",

    description:
      "বিশ্বের শিক্ষা, scholarship, university এবং learning technology।",

    category:
      "education",

    source:
      "Education Source",

    date:
      getToday(),

    video:
      "",

    thumbnail:
      "",

    verified:
      false
  },

  {
    id:5,

    title:
      "Health & Vaccine Research",

    description:
      "Medicine, vaccine এবং health research-এর গুরুত্বপূর্ণ আপডেট।",

    category:
      "health",

    source:
      "Health Source",

    date:
      getToday(),

    video:
      "",

    thumbnail:
      "",

    verified:
      false
  },

  {
    id:6,

    title:
      "Global Business News",

    description:
      "বিশ্ব অর্থনীতি, ব্যবসা ও বাজারের গুরুত্বপূর্ণ সংবাদ।",

    category:
      "business",

    source:
      "Business Source",

    date:
      getToday(),

    video:
      "",

    thumbnail:
      "",

    verified:
      false
  },

  {
    id:7,

    title:
      "World Sports News",

    description:
      "বিশ্বের গুরুত্বপূর্ণ খেলাধুলার সংবাদ।",

    category:
      "sports",

    source:
      "Sports Source",

    date:
      getToday(),

    video:
      "",

    thumbnail:
      "",

    verified:
      false
  }

];


/* =====================================================
   DATE
===================================================== */

function getToday(){

  const now =
    new Date();

  return now.toLocaleDateString(
    "en-GB",
    {
      day:"2-digit",
      month:"short",
      year:"numeric"
    }
  );
}


/* =====================================================
   UPDATE TIME
===================================================== */

function updateTimestamp(){

  if(!lastUpdated){
    return;
  }

  const now =
    new Date();

  lastUpdated.textContent =
    "Updated: " +
    now.toLocaleString(
      "en-GB",
      {
        day:"2-digit",
        month:"short",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit"
      }
    );
}


/* =====================================================
   CATEGORY NAME
===================================================== */

function categoryName(category){

  const names = {

    world:
      "🌍 World",

    technology:
      "🤖 Technology",

    science:
      "🔬 Science",

    education:
      "🎓 Education",

    health:
      "💊 Health",

    business:
      "💰 Business",

    sports:
      "⚽ Sports"

  };

  return names[category] ||
         "News";
}


/* =====================================================
   FILTER NEWS
===================================================== */

function filterNews(){

  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";

  const category =
    categoryFilter
      ? categoryFilter.value
      : "all";


  filteredNews =
    NEWS_DATA.filter(
      function(item){

        const text =
          (
            item.title +
            " " +
            item.description +
            " " +
            item.source
          ).toLowerCase();


        const matchesSearch =
          !search ||
          text.includes(search);


        const matchesCategory =
          category === "all" ||
          item.category === category;


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  currentIndex = 0;

  renderNews();

}


/* =====================================================
   RENDER NEWS CARDS
===================================================== */

function renderNews(){

  if(!newsGrid){
    return;
  }


  newsGrid.innerHTML = "";


  if(
    !filteredNews ||
    filteredNews.length === 0
  ){

    newsGrid.innerHTML = `
      <div class="empty">
        🔎 কোনো সংবাদ পাওয়া যায়নি।
      </div>
    `;

    return;
  }


  filteredNews.forEach(
    function(item,index){

      const card =
        document.createElement("article");

      card.className =
        "news-card";


      const verifiedText =
        item.verified
          ? "✓ Verified"
          : "Source Required";


      card.innerHTML = `

        <div>

          <div class="card-video">

            ${
              item.video
                ? "▶"
                : "📰"
            }

          </div>

          <div class="card-title">

            ${escapeHTML(item.title)}

          </div>

          <div class="card-meta">

            ${escapeHTML(item.description)}

          </div>

          <div class="card-meta">

            ${categoryName(item.category)}
            •
            ${escapeHTML(item.source)}
            •
            ${escapeHTML(item.date)}

          </div>

        </div>


        <button
          class="card-button"
          type="button"
          data-index="${index}">

          ${
            item.video
              ? "▶ WATCH VIDEO"
              : "VIEW NEWS"

          }

        </button>

      `;


      const button =
        card.querySelector(
          ".card-button"
        );


      if(button){

        button.addEventListener(
          "click",
          function(){

            selectNews(index);

          }
        );

      }


      newsGrid.appendChild(card);

    }
  );

}


/* =====================================================
   SELECT NEWS
===================================================== */

function selectNews(index){

  if(
    !filteredNews ||
    !filteredNews[index]
  ){
    return;
  }


  currentIndex =
    index;


  const item =
    filteredNews[currentIndex];


  videoTitle.textContent =
    item.title;


  videoDescription.textContent =
    item.description;


  videoCategory.textContent =
    categoryName(
      item.category
    );


  videoSource.textContent =
    "Source: " +
    item.source;


  videoDate.textContent =
    item.date;


  stopVideo();


  if(item.video){

    newsVideo.src =
      item.video;

    newsVideo.style.display =
      "block";

    videoPlaceholder.style.display =
      "none";

    openVideoBtn.textContent =
      "▶ PLAY VIDEO";

  }else{

    newsVideo.removeAttribute(
      "src"
    );

    newsVideo.load();

    newsVideo.style.display =
      "none";

    videoPlaceholder.style.display =
      "flex";

    openVideoBtn.textContent =
      "▶ VIDEO NOT ADDED";

  }


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =====================================================
   PREVIOUS
===================================================== */

function previousNews(){

  if(
    !filteredNews ||
    filteredNews.length === 0
  ){
    return;
  }


  currentIndex--;

  if(currentIndex < 0){

    currentIndex =
      filteredNews.length - 1;

  }


  selectNews(currentIndex);

}


/* =====================================================
   NEXT
===================================================== */

function nextNews(){

  if(
    !filteredNews ||
    filteredNews.length === 0
  ){
    return;
  }


  currentIndex++;

  if(
    currentIndex >=
    filteredNews.length
  ){

    currentIndex = 0;

  }


  selectNews(currentIndex);

}


/* =====================================================
   PLAY VIDEO
===================================================== */

function playCurrentVideo(){

  if(
    !filteredNews ||
    !filteredNews[currentIndex]
  ){
    return;
  }


  const item =
    filteredNews[currentIndex];


  if(!item.video){

    alert(
      "এই News-এর জন্য এখনো verified video URL যোগ করা হয়নি।"
    );

    return;

  }


  newsVideo.style.display =
    "block";

  videoPlaceholder.style.display =
    "none";


  const promise =
    newsVideo.play();


  if(
    promise &&
    typeof promise.catch === "function"
  ){

    promise.catch(
      function(){

        /*
          Browser autoplay policy-এর কারণে
          play বন্ধ হতে পারে।
          তখন user নিজে Play চাপতে পারবেন।
        */

      }
    );

  }

}


/* =====================================================
   STOP VIDEO
===================================================== */

function stopVideo(){

  if(!newsVideo){
    return;
  }


  try{

    newsVideo.pause();

  }catch(error){

    console.warn(
      "Video pause error:",
      error
    );

  }

}


/* =====================================================
   REFRESH
===================================================== */

function refreshNews(){

  updateTimestamp();

  /*
    ভবিষ্যতে এখানে API call বসানো যাবে।

    উদাহরণ:

    await fetch(
      "YOUR_NEWS_API_URL"
    );

    তারপর NEWS_DATA update করে
    filterNews() চালাতে হবে।
  */

  filterNews();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value){

  return String(value || "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================================
   EVENTS
===================================================== */

if(searchInput){

  searchInput.addEventListener(
    "input",
    filterNews
  );

}


if(categoryFilter){

  categoryFilter.addEventListener(
    "change",
    filterNews
  );

}


if(refreshBtn){

  refreshBtn.addEventListener(
    "click",
    refreshNews
  );

}


if(refreshBtnTop){

  refreshBtnTop.addEventListener(
    "click",
    refreshNews
  );

}


if(homeBtn){

  homeBtn.addEventListener(
    "click",
    function(){

      window.location.href =
        "./index.html";

    }
  );

}


if(previousBtn){

  previousBtn.addEventListener(
    "click",
    previousNews
  );

}


if(nextBtn){

  nextBtn.addEventListener(
    "click",
    nextNews
  );

}


if(openVideoBtn){

  openVideoBtn.addEventListener(
    "click",
    playCurrentVideo
  );

}


/* =====================================================
   VIDEO EVENTS
===================================================== */

if(newsVideo){

  newsVideo.addEventListener(
    "error",
    function(){

      console.warn(
        "Video could not be loaded."
      );

    }
  );


  newsVideo.addEventListener(
    "ended",
    function(){

      nextNews();

    }
  );

}


/* =====================================================
   START
===================================================== */

function initializeViralNews(){

  updateTimestamp();

  filterNews();

}


/* =====================================================
   RUN
===================================================== */

initializeViralNews();


/* =====================================================
   OPTIONAL GLOBAL API
=====================================================

   ভবিষ্যতে অন্য JS file থেকে ব্যবহার করা যাবে:

   window.AYNA_VIRAL_NEWS.refresh()

===================================================== */

window.AYNA_VIRAL_NEWS = {

  refresh:
    refreshNews,

  next:
    nextNews,

  previous:
    previousNews,

  select:
    selectNews

};