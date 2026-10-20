/* script.js — واجهة المستخدم (Controller / View) */
(() => {
  const store = new TodoStore();

  const $ = (sel) => document.querySelector(sel);
  const form = $("#taskForm");
  const input = $("#taskInput");
  const prioritySelect = $("#prioritySelect");
  const listEl = $("#taskList");
  const emptyEl = $("#emptyMsg");
  const counterEl = $("#counter");
  const greetingEl = $("#greeting");
  const tabs = document.querySelectorAll(".tabs a");

  const EMPTY_MESSAGES = {
    all: "ما عندك مهام للحين، ابدأ بأول وحدة وتوكل على الله 💪",
    active: "الله يعطيك العافية، خلصت كل شي! ☕",
    done: "للحين ما خلصت شي، يلا شد حيلك!",
  };

  const dateFmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("ar-SA", { hour: "numeric", minute: "2-digit" });

  function greeting() {
    const h = new Date().getHours();
    let hello = "مساك الله بالخير";
    if (h >= 4 && h < 12) hello = "صباح الخير";
    else if (h >= 12 && h < 17) hello = "يا هلا والله";
    return `${hello}، اليوم ${dateFmt.format(new Date())}`;
  }

  const currentTab = () => {
    const t = location.hash.replace("#", "");
    return ["all", "active", "done"].includes(t) ? t : "all";
  };

  function counterText(n) {
    if (n === 0) return "ما باقي شي";
    if (n === 1) return "باقي لك مهمة وحدة";
    if (n === 2) return "باقي لك مهمتين";
    if (n <= 10) return `باقي لك ${n.toLocaleString("ar-SA")} مهام`;
    return `باقي لك ${n.toLocaleString("ar-SA")} مهمة`;
  }

  function render() {
    const tab = currentTab();
    tabs.forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));

    const items = store.filter(tab);
    listEl.replaceChildren(...items.map(renderItem));
    emptyEl.hidden = items.length > 0;
    emptyEl.textContent = EMPTY_MESSAGES[tab];
    counterEl.textContent = counterText(store.remaining);
  }

  function renderItem(task) {
    const li = document.createElement("li");
    li.className = `item ${task.priority} ${task.done ? "done" : ""}`;
    li.dataset.id = task.id;

    const dot = document.createElement("span");
    dot.className = "dot";

    const body = document.createElement("div");
    body.className = "body";
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.title; // textContent يمنع حقن HTML
    const time = document.createElement("span");
    time.className = "time";
    time.textContent = timeFmt.format(new Date(task.createdAt));
    body.append(title, time);

    const del = document.createElement("button");
    del.className = "del";
    del.type = "button";
    del.dataset.action = "delete";
    del.setAttribute("aria-label", "احذف المهمة");
    del.textContent = "✕";

    li.append(dot, body, del);
    return li;
  }

  function startEdit(li) {
    const id = li.dataset.id;
    const titleEl = li.querySelector(".title");
    const editor = document.createElement("input");
    editor.className = "edit-input";
    editor.value = titleEl.textContent;
    titleEl.replaceWith(editor);
    editor.focus();
    editor.select();

    const finish = (save) => {
      if (save) store.rename(id, editor.value);
      render();
    };
    editor.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finish(true);
      if (e.key === "Escape") finish(false);
    });
    editor.addEventListener("blur", () => finish(true), { once: true });
  }

  // ---- الأحداث ----
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (store.add(input.value, prioritySelect.value)) {
      input.value = "";
      prioritySelect.value = "normal";
      render();
    }
  });

  // تفويض الأحداث: مستمع واحد للقائمة كلها
  listEl.addEventListener("click", (e) => {
    const li = e.target.closest(".item");
    if (!li || e.target.closest(".edit-input")) return;
    if (e.detail > 1) return; // النقرة الثانية في الدبل كليك، نخلي dblclick يتولاها
    if (e.target.dataset.action === "delete") {
      store.remove(li.dataset.id);
    } else {
      store.toggle(li.dataset.id);
    }
    render();
  });

  listEl.addEventListener("dblclick", (e) => {
    const li = e.target.closest(".item");
    if (!li || e.target.closest(".edit-input") || e.target.dataset.action === "delete") return;
    store.toggle(li.dataset.id); // نرجّع الحالة لأن النقرة الأولى غيّرتها
    render();
    const fresh = listEl.querySelector(`[data-id="${CSS.escape(li.dataset.id)}"]`);
    if (fresh) startEdit(fresh);
  });

  $("#clearDone").addEventListener("click", () => {
    store.clearDone();
    render();
  });

  window.addEventListener("hashchange", render);

  greetingEl.textContent = greeting();
  render();
})();
