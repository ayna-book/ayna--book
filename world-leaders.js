(() => {
  const FALLBACK_DATA = [
    {
      country: "Bangladesh",
      countryBn: "বাংলাদেশ",
      code: "BD",
      flag: "flags/bd.svg",
      leaders: [
        {
          role: "প্রধানমন্ত্রী",
          name: "তারেক রহমান",
          term: "১৭ ফেব্রুয়ারি ২০২৬ – বর্তমান",
          photo: "photos/bd-pm.jpg",
          phone: "অফিসিয়াল দপ্তর অনুযায়ী",
          email: "pmo.gov.bd"
        },
        {
          role: "রাষ্ট্রপতি",
          name: "মির্জা ফখরুল ইসলাম আলমগীর",
          term: "২১ আগস্ট ২০২৬ – বর্তমান",
          photo: "photos/bd-president.jpg",
          phone: "অফিসিয়াল দপ্তর অনুযায়ী",
          email: "bangabhaban.gov.bd"
        }
      ]
    }
  ];

  const gridEl = document.getElementById("leadersGrid");
  const searchEl = document.getElementById("leaderSearch");
  let allEntries = [...FALLBACK_DATA];

  function placeholderFlag(code = "UN") {
    return "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64"><rect width="100%" height="100%" fill="#0b1633"/><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#ffe64d" font-size="24" font-family="Arial">${code}</text></svg>`
    );
  }

  function placeholderPhoto() {
    return "data:image/svg+xml," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144"><rect width="100%" height="100%" fill="#0b1633"/><circle cx="72" cy="52" r="26" fill="#ffe64d"/><path d="M22 144 Q30 92 72 92 Q114 92 122 144" fill="#ffe64d"/></svg>'
    );
  }

  function render(query = "") {
    const q = query.trim().toLowerCase();
    gridEl.innerHTML = "";

    const filtered = allEntries.filter(entry => {
      if (!q) return true;
      const leaderText = (entry.leaders || []).map(l => `${l.name} ${l.role} ${l.term}`).join(" ");
      return `${entry.country} ${entry.countryBn} ${entry.code} ${leaderText}`.toLowerCase().includes(q);
    });

    filtered.forEach(entry => {
      const card = document.createElement("div");
      card.className = "card";

      const head = document.createElement("div");
      head.className = "country-head";

      const flag = document.createElement("img");
      flag.className = "flag-img";
      flag.src = entry.flag || placeholderFlag(entry.code);
      flag.alt = entry.country;
      flag.onerror = () => { flag.src = placeholderFlag(entry.code); };

      const title = document.createElement("div");
      title.innerHTML = `<strong>${entry.countryBn || entry.country}</strong><div style="font-size:15px;color:#38f2ff;">${entry.country} (${entry.code})</div>`;

      head.append(flag, title);
      card.appendChild(head);

      (entry.leaders || []).forEach(leader => {
        const row = document.createElement("div");
        row.className = "leader-row";

        const photo = document.createElement("img");
        photo.className = "leader-photo";
        photo.src = leader.photo || placeholderPhoto();
        photo.alt = leader.name;
        photo.onerror = () => { photo.src = placeholderPhoto(); };

        const info = document.createElement("div");
        info.className = "meta";
        info.innerHTML = `
          <strong>${leader.name}</strong>
          <div>পদবি: ${leader.role}</div>
          <div>মেয়াদকাল: ${leader.term || "তথ্য সংযুক্ত করুন"}</div>
          <div>যোগাযোগ/ইমেইল: ${leader.email || "—"}</div>
          <div>ফোন: ${leader.phone || "—"}</div>
        `;

        row.append(photo, info);
        card.appendChild(row);
      });

      gridEl.appendChild(card);
    });
  }

  async function loadJson() {
    try {
      const res = await fetch("leaders.json");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          allEntries = data;
        }
      }
    } catch (_) {
      // লোকাল ফলব্যাক ডেটা ব্যবহার করা হবে
    }
    render(searchEl.value);
  }

  searchEl.addEventListener("input", e => render(e.target.value));
  loadJson();
})();