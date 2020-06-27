export function set(name, vaule) {
  window.localStorage.setItem(name, JSON.stringify(vaule));
}

export function get(name, subst = null) {
  return JSON.parse(window.localStorage.getItem(name) || subst);
}

export function del(name) {
  localStorage.removeItem(name);
}
