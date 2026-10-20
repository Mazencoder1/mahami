/*
 * todo.js — طبقة البيانات (Model)
 * مستوحى من فكرة مشروع Vanilla-JavaScript-ToDo-App (رخصة MIT)
 * https://github.com/lapcevicmarko/Vanilla-JavaScript-ToDo-App
 * هذا الكود مكتوب من جديد مع إضافات: أولوية، تعديل، رسائل بلهجة سعودية.
 */
class TodoStore {
  constructor(storageKey = "mahami.tasks.v1") {
    this.storageKey = storageKey;
    this.tasks = this.#load();
  }

  #load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  #save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    } catch {
      /* التخزين ممتلي أو ممنوع، التطبيق يكمل بدونه */
    }
  }

  add(title, priority = "normal") {
    const clean = String(title).trim();
    if (!clean) return null;
    const task = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      title: clean,
      priority,
      done: false,
      createdAt: Date.now(),
    };
    this.tasks.unshift(task);
    this.#save();
    return task;
  }

  toggle(id) {
    const t = this.tasks.find((x) => x.id === id);
    if (t) {
      t.done = !t.done;
      this.#save();
    }
    return t;
  }

  rename(id, title) {
    const clean = String(title).trim();
    const t = this.tasks.find((x) => x.id === id);
    if (!t || !clean) return false;
    t.title = clean;
    this.#save();
    return true;
  }

  remove(id) {
    this.tasks = this.tasks.filter((x) => x.id !== id);
    this.#save();
  }

  clearDone() {
    this.tasks = this.tasks.filter((x) => !x.done);
    this.#save();
  }

  filter(tab) {
    if (tab === "active") return this.tasks.filter((t) => !t.done);
    if (tab === "done") return this.tasks.filter((t) => t.done);
    return this.tasks;
  }

  get remaining() {
    return this.tasks.filter((t) => !t.done).length;
  }
}
