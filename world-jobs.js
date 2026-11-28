/* =========================================================
   AYNA BOOK — World Jobs & Careers
   File: world-jobs.js

   No Firebase / No RTDB required
   API-ready architecture
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   CONFIG
--------------------------------------------------------- */

const CONFIG = {
  homePage: "./index.html",

  /*
   Future live jobs API can be connected here.
   Keep empty until a real API is selected.
  */
  jobsApiUrl: "",

  defaultCountry: "all",
  defaultType: "all",
  defaultCategory: "all"
};


/* ---------------------------------------------------------
   DEMO JOB DATABASE
--------------------------------------------------------- */

const JOBS = [

  {
    id: "job-001",
    title: "Software Engineer",
    company: "AYNA Technology",
    country: "bangladesh",
    countryName: "Bangladesh",
    location: "Dhaka, Bangladesh",
    type: "full-time",
    category: "technology",
    salary: "$800 - $1,800 / month",
    description:
      "Develop modern web applications, APIs and digital services.",
    skills: [
      "JavaScript",
      "HTML",
      "CSS",
      "Firebase"
    ],
    applyUrl: "#"
  },

  {
    id: "job-002",
    title: "AI Research Engineer",
    company: "Global AI Research",
    country: "usa",
    countryName: "United States",
    location: "California, USA",
    type: "full-time",
    category: "research",
    salary: "$7,000 - $12,000 / month",
    description:
      "Research artificial intelligence, machine learning and intelligent systems.",
    skills: [
      "Python",
      "AI",
      "Machine Learning",
      "Research"
    ],
    applyUrl: "#"
  },

  {
    id: "job-003",
    title: "Remote Frontend Developer",
    company: "Global Web Labs",
    country: "uk",
    countryName: "United Kingdom",
    location: "Remote",
    type: "remote",
    category: "technology",
    salary: "£3,000 - £5,500 / month",
    description:
      "Build responsive web applications for international users.",
    skills: [
      "JavaScript",
      "React",
      "HTML",
      "CSS"
    ],
    applyUrl: "#"
  },

  {
    id: "job-004",
    title: "Civil Engineer",
    company: "International Engineering Group",
    country: "uae",
    countryName: "UAE",
    location: "Dubai, UAE",
    type: "full-time",
    category: "engineering",
    salary: "AED 8,000 - 16,000 / month",
    description:
      "Work on infrastructure and construction engineering projects.",
    skills: [
      "Civil Engineering",
      "AutoCAD",
      "Project Management"
    ],
    applyUrl: "#"
  },

  {
    id: "job-005",
    title: "Medical Officer",
    company: "International Medical Center",
    country: "saudi",
    countryName: "Saudi Arabia",
    location: "Riyadh, Saudi Arabia",
    type: "full-time",
    category: "medical",
    salary: "SAR 12,000 - 22,000 / month",
    description:
      "Provide medical services and patient care in a modern healthcare facility.",
    skills: [
      "Medicine",
      "Patient Care",
      "Clinical Practice"
    ],
    applyUrl: "#"
  },

  {
    id: "job-006",
    title: "English Teacher",
    company: "International School",
    country: "japan",
    countryName: "Japan",
    location: "Tokyo, Japan",
    type: "full-time",
    category: "education",
    salary: "¥300,000 - ¥500,000 / month",
    description:
      "Teach English to students in an international education environment.",
    skills: [
      "English",
      "Teaching",
      "Communication"
    ],
    applyUrl: "#"
  },

  {
    id: "job-007",
    title: "Financial Analyst",
    company: "Global Finance Group",
    country: "usa",
    countryName: "United States",
    location: "New York, USA",
    type: "full-time",
    category: "finance",
    salary: "$5,000 - $9,000 / month",
    description:
      "Analyze financial data, markets and business performance.",
    skills: [
      "Finance",
      "Excel",
      "Data Analysis",
      "Accounting"
    ],
    applyUrl: "#"
  },

  {
    id: "job-008",
    title: "Aviation Operations Officer",
    company: "International Aviation",
    country: "uae",
    countryName: "UAE",
    location: "Abu Dhabi, UAE",
    type: "full-time",
    category: "aviation",
    salary: "AED 7,000 - 14,000 / month",
    description:
      "Coordinate aviation operations, airport services and flight activities.",
    skills: [
      "Aviation",
      "Operations",
      "Airport Management"
    ],
    applyUrl: "#"
  },

  {
    id: "job-009",
    title: "Research Assistant",
    company: "Global Science Institute",
    country: "germany",
    countryName: "Germany",
    location: "Berlin, Germany",
    type: "full-time",
    category: "research",
    salary: "€3,000 - €5,000 / month",
    description:
      "Assist scientific research projects and analyze experimental data.",
    skills: [
      "Research",
      "Data Analysis",
      "Science"
    ],
    applyUrl: "#"
  },

  {
    id: "job-010",
    title: "Digital Marketing Specialist",
    company: "Global Media Group",
    country: "canada",
    countryName: "Canada",
    location: "Toronto, Canada",
    type: "remote",
    category: "marketing",
    salary: "CAD 4,000 - 7,000 / month",
    description:
      "Develop digital marketing campaigns and manage online audiences.",
    skills: [
      "Digital Marketing",
      "SEO",
      "Social Media",
      "Analytics"
    ],
    applyUrl: "#"
  },

  {
    id: "job-011",
    title: "Government IT Officer",
    company: "Public Digital Services",
    country: "bangladesh",
    countryName: "Bangladesh",
    location: "Dhaka, Bangladesh",
    type: "full-time",
    category: "government",
    salary: "BDT 50,000 - 100,000 / month",
    description:
      "Support government digital services and information systems.",
    skills: [
      "IT",
      "Networking",
      "Cyber Security"
    ],
    applyUrl: "#"
  },

  {
    id: "job-012",
    title: "Freelance Graphic Designer",
    company: "Global Creative Network",
    country: "india",
    countryName: "India",
    location: "Remote",
    type: "freelance",
    category: "marketing",
    salary: "$300 - $1,500 / project",
    description:
      "Create digital graphics, brand materials and social media designs.",
    skills: [
      "Graphic Design",
      "Photoshop",
      "Illustrator",
      "Branding"
    ],
    applyUrl: "#"
  },

  {
    id: "job-013",
    title: "Mechanical Engineer",
    company: "Global Manufacturing",
    country: "germany",
    countryName: "Germany",
    location: "Munich, Germany",
    type: "full-time",
    category: "engineering",
    salary: "€4,000 - €7,000 / month",
    description:
      "Design and improve mechanical systems and manufacturing processes.",
    skills: [
      "Mechanical Engineering",
      "CAD",
      "Manufacturing"
    ],
    applyUrl: "#"
  },

  {
    id: "job-014",
    title: "Cyber Security Analyst",
    company: "Secure World Systems",
    country: "australia",
    countryName: "Australia",
    location: "Sydney, Australia",
    type: "full-time",
    category: "technology",
    salary: "AUD 7,000 - 11,000 / month",
    description:
      "Monitor systems, identify security threats and protect digital infrastructure.",
    skills: [
      "Cyber Security",
      "Networking",
      "Linux",
      "SIEM"
    ],
    applyUrl: "#"
  },

  {
    id: "job-015",
    title: "University Lecturer",
    company: "International University",
    country: "canada",
    countryName: "Canada",
    location: "Vancouver, Canada",
    type: "full-time",
    category: "education",
    salary: "CAD 5,000 - 9,000 / month",
    description:
      "Teach university students and participate in academic research.",
    skills: [
      "Teaching",
      "Research",
      "Academic Writing"
    ],
    applyUrl: "#"
  },

  {
    id: "job-016",
    title: "Part-Time Data Analyst",
    company: "Digital Analytics Lab",
    country: "india",
    countryName: "India",
    location: "Remote",
    type: "part-time",
    category: "technology",
    salary: "$500 - $1,200 / month",
    description:
      "Analyze business datasets and create useful reports.",
    skills: [
      "Excel",
      "SQL",
      "Python",
      "Data Analysis"
    ],
    applyUrl: "#"
  }

];


/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */

let filteredJobs = [...JOBS];

let currentFilters = {
  search: "",
  country: "all",
  type: "all",
  category: "all"
};


/* ---------------------------------------------------------
   DOM
--------------------------------------------------------- */

const jobSearch =
  document.getElementById("jobSearch");

const countrySelect =
  document.getElementById("countrySelect");

const jobTypeSelect =
  document.getElementById("jobTypeSelect");

const categorySelect =
  document.getElementById("categorySelect");

const searchBtn =
  document.getElementById("searchBtn");

const jobsContainer =
  document.getElementById("jobsContainer");

const resultCount =
  document.getElementById("resultCount");

const jobCount =
  document.getElementById("jobCount");

const countryCount =
  document.getElementById("countryCount");

const homeBtn =
  document.getElementById("homeBtn");

const fullScreenBtn =
  document.getElementById("fullScreenBtn");


/* ---------------------------------------------------------
   START
--------------------------------------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    initialize();

    renderJobs(JOBS);

    updateStats();

    await tryLoadExternalJobs();

  }
);


/* ---------------------------------------------------------
   INITIALIZE
--------------------------------------------------------- */

function initialize() {

  searchBtn?.addEventListener(
    "click",
    runSearch
  );


  jobSearch?.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        runSearch();
      }

    }
  );


  countrySelect?.addEventListener(
    "change",
    runSearch
  );


  jobTypeSelect?.addEventListener(
    "change",
    runSearch
  );


  categorySelect?.addEventListener(
    "change",
    runSearch
  );


  homeBtn?.addEventListener(
    "click",
    () => {

      window.location.href =
        CONFIG.homePage;

    }
  );


  fullScreenBtn?.addEventListener(
    "click",
    toggleFullscreen
  );


  document
    .querySelectorAll(".category")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const category =
            button.dataset.category;

          if (categorySelect) {

            categorySelect.value =
              category;

          }

          runSearch();

          window.scrollTo({
            top:
              document
                .querySelector(".results")
                ?.offsetTop || 0,
            behavior: "smooth"
          });

        }
      );

    });

}


/* ---------------------------------------------------------
   SEARCH
--------------------------------------------------------- */

function runSearch() {

  currentFilters.search =
    String(
      jobSearch?.value || ""
    )
      .trim()
      .toLowerCase();

  currentFilters.country =
    countrySelect?.value || "all";

  currentFilters.type =
    jobTypeSelect?.value || "all";

  currentFilters.category =
    categorySelect?.value || "all";


  filteredJobs =
    JOBS.filter(job => {

      const matchesSearch =
        !currentFilters.search ||
        job.title
          .toLowerCase()
          .includes(
            currentFilters.search
          ) ||
        job.company
          .toLowerCase()
          .includes(
            currentFilters.search
          ) ||
        job.description
          .toLowerCase()
          .includes(
            currentFilters.search
          ) ||
        job.skills.some(skill =>
          skill
            .toLowerCase()
            .includes(
              currentFilters.search
            )
        );


      const matchesCountry =
        currentFilters.country === "all" ||
        job.country ===
          currentFilters.country;


      const matchesType =
        currentFilters.type === "all" ||
        job.type ===
          currentFilters.type;


      const matchesCategory =
        currentFilters.category === "all" ||
        job.category ===
          currentFilters.category;


      return (
        matchesSearch &&
        matchesCountry &&
        matchesType &&
        matchesCategory
      );

    });


  renderJobs(filteredJobs);

  updateResultCount(
    filteredJobs.length
  );

}


/* ---------------------------------------------------------
   RENDER JOBS
--------------------------------------------------------- */

function renderJobs(jobs) {

  if (!jobsContainer) {
    return;
  }


  jobsContainer.innerHTML = "";


  if (!jobs.length) {

    jobsContainer.innerHTML = `

      <div class="job-card"
           style="grid-column:1/-1;text-align:center;">

        <div class="job-title">
          🔎 কোনো চাকরি পাওয়া যায়নি
        </div>

        <div class="job-description">
          Search keyword, country বা category
          পরিবর্তন করে আবার চেষ্টা করুন।
        </div>

        <button
          class="job-btn"
          id="resetJobsBtn"
          type="button"
          style="margin-top:18px;width:100%;">

          🔄 Reset Search

        </button>

      </div>

    `;


    document
      .getElementById("resetJobsBtn")
      ?.addEventListener(
        "click",
        resetSearch
      );

    updateResultCount(0);

    return;
  }


  jobs.forEach(job => {

    const card =
      createJobCard(job);

    jobsContainer.appendChild(card);

  });


  updateResultCount(
    jobs.length
  );

}


/* ---------------------------------------------------------
   CREATE JOB CARD
--------------------------------------------------------- */

function createJobCard(job) {

  const card =
    document.createElement("article");

  card.className =
    "job-card";


  const typeName =
    getJobTypeName(job.type);


  const categoryName =
    getCategoryName(job.category);


  const countryFlag =
    getCountryFlag(job.country);


  const skills =
    job.skills
      .map(
        skill =>
          `<span style="
            display:inline-block;
            margin:3px 4px 3px 0;
            padding:5px 8px;
            border:1px solid #456092;
            border-radius:8px;
            color:#dce7ff;
            font-size:14px;
          ">${escapeHtml(skill)}</span>`
      )
      .join("");


  card.innerHTML = `

    <div class="job-top">

      <div class="job-title">
        ${escapeHtml(job.title)}
      </div>

      <div class="job-type">
        ${escapeHtml(typeName)}
      </div>

    </div>


    <div class="company">
      🏢 ${escapeHtml(job.company)}
    </div>


    <div class="job-info">

      <div>
        📍 ${countryFlag}
        ${escapeHtml(job.location)}
      </div>

      <div>
        💼 ${escapeHtml(categoryName)}
      </div>

      <div>
        💰 ${escapeHtml(job.salary)}
      </div>

    </div>


    <div class="job-description">
      ${escapeHtml(job.description)}
    </div>


    <div style="margin-top:12px;">
      ${skills}
    </div>


    <div class="job-actions">

      <button
        class="job-btn"
        type="button"
        data-action="details"
        data-job-id="${escapeHtml(job.id)}">

        📋 Details

      </button>


      <button
        class="job-btn apply"
        type="button"
        data-action="apply"
        data-job-id="${escapeHtml(job.id)}">

        🚀 Apply

      </button>

    </div>

  `;


  card
    .querySelectorAll("[data-action]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.jobId;

          const action =
            button.dataset.action;

          const selected =
            JOBS.find(
              item =>
                item.id === id
            );

          if (!selected) {
            return;
          }

          if (action === "details") {

            showJobDetails(
              selected
            );

          }

          if (action === "apply") {

            applyForJob(
              selected
            );

          }

        }
      );

    });


  return card;

}


/* ---------------------------------------------------------
   JOB DETAILS
--------------------------------------------------------- */

function showJobDetails(job) {

  const skills =
    job.skills
      .map(
        skill =>
          `• ${skill}`
      )
      .join("\n");


  const message =

    `AYNA BOOK JOB DETAILS\n\n` +

    `Position: ${job.title}\n` +

    `Company: ${job.company}\n` +

    `Country: ${job.countryName}\n` +

    `Location: ${job.location}\n` +

    `Type: ${getJobTypeName(job.type)}\n` +

    `Category: ${getCategoryName(job.category)}\n` +

    `Salary: ${job.salary}\n\n` +

    `Skills:\n${skills}\n\n` +

    `${job.description}`;


  alert(message);

}


/* ---------------------------------------------------------
   APPLY
--------------------------------------------------------- */

function applyForJob(job) {

  /*
   * Demo jobs use #.
   * Real jobs should contain verified official
   * application URLs.
   */

  if (
    !job.applyUrl ||
    job.applyUrl === "#"
  ) {

    alert(
      `🚀 ${job.title}\n\n` +
      `এই চাকরিটির application link এখনো ` +
      `live API থেকে যুক্ত করা হয়নি।\n\n` +
      `দয়া করে কোম্পানির official career page ` +
      `থেকে আবেদন করুন।`
    );

    return;

  }


  try {

    window.open(
      job.applyUrl,
      "_blank",
      "noopener,noreferrer"
    );

  } catch (error) {

    console.error(
      "Application error:",
      error
    );

  }

}


/* ---------------------------------------------------------
   RESET
--------------------------------------------------------- */

function resetSearch() {

  if (jobSearch) {
    jobSearch.value = "";
  }

  if (countrySelect) {
    countrySelect.value = "all";
  }

  if (jobTypeSelect) {
    jobTypeSelect.value = "all";
  }

  if (categorySelect) {
    categorySelect.value = "all";
  }


  currentFilters = {
    search: "",
    country: "all",
    type: "all",
    category: "all"
  };


  filteredJobs =
    [...JOBS];


  renderJobs(
    filteredJobs
  );

}


/* ---------------------------------------------------------
   STATISTICS
--------------------------------------------------------- */

function updateStats() {

  if (jobCount) {

    jobCount.textContent =
      JOBS.length;

  }


  if (countryCount) {

    const countries =
      new Set(
        JOBS.map(
          job => job.country
        )
      );

    countryCount.textContent =
      `${countries.size}+`;

  }

}


/* ---------------------------------------------------------
   RESULT COUNT
--------------------------------------------------------- */

function updateResultCount(count) {

  if (!resultCount) {
    return;
  }

  resultCount.textContent =
    `${count} Jobs Found`;

}


/* ---------------------------------------------------------
   JOB TYPE NAME
--------------------------------------------------------- */

function getJobTypeName(type) {

  const names = {

    "full-time":
      "Full Time",

    "part-time":
      "Part Time",

    "remote":
      "Remote",

    "contract":
      "Contract",

    "internship":
      "Internship",

    "freelance":
      "Freelance"

  };


  return (
    names[type] ||
    type
  );

}


/* ---------------------------------------------------------
   CATEGORY NAME
--------------------------------------------------------- */

function getCategoryName(category) {

  const names = {

    technology:
      "Technology",

    engineering:
      "Engineering",

    medical:
      "Medical",

    education:
      "Education",

    finance:
      "Finance",

    marketing:
      "Marketing",

    government:
      "Government",

    aviation:
      "Aviation",

    research:
      "Research",

    hospitality:
      "Hospitality"

  };


  return (
    names[category] ||
    category
  );

}


/* ---------------------------------------------------------
   COUNTRY FLAGS
--------------------------------------------------------- */

function getCountryFlag(country) {

  const flags = {

    bangladesh: "🇧🇩",

    india: "🇮🇳",

    usa: "🇺🇸",

    uk: "🇬🇧",

    canada: "🇨🇦",

    australia: "🇦🇺",

    germany: "🇩🇪",

    uae: "🇦🇪",

    saudi: "🇸🇦",

    japan: "🇯🇵"

  };


  return (
    flags[country] ||
    "🌍"
  );

}


/* ---------------------------------------------------------
   FULL SCREEN
--------------------------------------------------------- */

async function toggleFullscreen() {

  try {

    if (!document.fullscreenElement) {

      const app =
        document.getElementById("app") ||
        document.documentElement;

      await app.requestFullscreen();

      if (fullScreenBtn) {

        fullScreenBtn.textContent =
          "✕ Exit Full Screen";

      }

    } else {

      await document.exitFullscreen();

    }

  } catch (error) {

    console.warn(
      "Fullscreen unavailable:",
      error
    );

    alert(
      "এই browser-এ Full Screen সুবিধাটি পাওয়া যাচ্ছে না।"
    );

  }

}


/* ---------------------------------------------------------
   FULLSCREEN EVENT
--------------------------------------------------------- */

document.addEventListener(
  "fullscreenchange",
  () => {

    if (!fullScreenBtn) {
      return;
    }

    fullScreenBtn.textContent =
      document.fullscreenElement
        ? "✕ Exit Full Screen"
        : "⛶ Full Screen";

  }
);


/* ---------------------------------------------------------
   EXTERNAL JOB API
--------------------------------------------------------- */

async function tryLoadExternalJobs() {

  /*
   * Do nothing when API URL is empty.
   *
   * This prevents broken/unknown APIs from making
   * the page unusable.
   */

  if (!CONFIG.jobsApiUrl) {
    return;
  }


  try {

    const response =
      await fetch(
        CONFIG.jobsApiUrl,
        {
          method: "GET",
          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      console.warn(
        "AYNA Jobs API returned unsupported format."
      );

      return;

    }


    /*
     * API mapping can be added here after
     * selecting a real jobs provider.
     */

    console.log(
      "AYNA BOOK external jobs:",
      data
    );


  } catch (error) {

    console.warn(
      "Live Jobs API unavailable:",
      error
    );

  }

}


/* ---------------------------------------------------------
   AI CAREER ANALYSIS
--------------------------------------------------------- */

function analyzeCareerQuery(query) {

  const text =
    String(query || "")
      .toLowerCase()
      .trim();


  if (!text) {

    return {
      category: "technology",
      message:
        "আপনার দক্ষতা লিখুন—যেমন JavaScript, শিক্ষকতা, চিকিৎসা বা engineering।"
    };

  }


  const keywordMap = {

    technology: [
      "javascript",
      "programming",
      "developer",
      "software",
      "web",
      "app",
      "computer",
      "coding",
      "it"
    ],

    engineering: [
      "engineer",
      "engineering",
      "civil",
      "mechanical",
      "electrical"
    ],

    medical: [
      "doctor",
      "medical",
      "nurse",
      "health",
      "hospital"
    ],

    education: [
      "teacher",
      "teaching",
      "education",
      "lecturer",
      "school",
      "university"
    ],

    finance: [
      "finance",
      "bank",
      "accounting",
      "accountant",
      "financial"
    ],

    aviation: [
      "pilot",
      "aviation",
      "airport",
      "airline",
      "flight"
    ],

    research: [
      "research",
      "scientist",
      "science",
      "laboratory",
      "laboratory"
    ],

    marketing: [
      "marketing",
      "seo",
      "sales",
      "social media",
      "advertising"
    ]

  };


  let bestCategory =
    "technology";

  let bestScore =
    0;


  Object.entries(
    keywordMap
  ).forEach(
    ([category, keywords]) => {

      let score = 0;

      keywords.forEach(
        keyword => {

          if (
            text.includes(keyword)
          ) {

            score++;

          }

        }
      );


      if (score > bestScore) {

        bestScore =
          score;

        bestCategory =
          category;

      }

    }
  );


  return {

    category:
      bestCategory,

    score:
      bestScore,

    message:
      `আপনার অনুসন্ধানের সঙ্গে ` +
      `${getCategoryName(bestCategory)} ` +
      `ক্যাটাগরির চাকরি বেশি উপযোগী হতে পারে।`

  };

}


/* ---------------------------------------------------------
   SAFE HTML
--------------------------------------------------------- */

function escapeHtml(value) {

  return String(value ?? "")
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


/* ---------------------------------------------------------
   PUBLIC AYNA API
--------------------------------------------------------- */

window.AYNA_WORLD_JOBS = {

  jobs:
    () =>
      [...JOBS],

  search:
    query => {

      if (jobSearch) {
        jobSearch.value =
          query || "";
      }

      runSearch();

      return [
        ...filteredJobs
      ];

    },

  reset:
    () => {

      resetSearch();

    },

  careerAI:
    query => {

      return analyzeCareerQuery(
        query
      );

    }

};


/* ---------------------------------------------------------
   CONSOLE
--------------------------------------------------------- */

console.log(
  "AYNA BOOK World Jobs loaded successfully."
);

console.log(
  `AYNA BOOK Jobs: ${JOBS.length}`
);