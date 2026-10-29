const purple = "#7162f5",
  teal = "#23b8b5",
  grid = "#e9edf5",
  muted = "#77829a";

function canvas(id) {
  let c = document.getElementById(id);
  if (!c) return null;

  let r = c.getBoundingClientRect(),
    d = window.devicePixelRatio || 1;

  c.width = Math.max(1, r.width * d);
  c.height = Math.max(1, r.height * d);

  let x = c.getContext("2d");
  x.scale(d, d);

  return { x, w: r.width, h: r.height };
}

function bars(id, labels, vals, max, opts = {}) {
  let o = canvas(id);
  if (!o) return;

  let { x, w, h } = o,
    left = opts.left || 145,
    right = 48,
    top = 12,
    bottom = 28,
    pw = w - left - right,
    ph = h - top - bottom,
    gap = ph / labels.length;

  x.clearRect(0, 0, w, h);
  x.font = "11px Segoe UI";

  for (let i = 0; i <= 4; i++) {
    let xx = left + pw * i / 4;
    x.strokeStyle = grid;
    x.beginPath();
    x.moveTo(xx, top);
    x.lineTo(xx, top + ph);
    x.stroke();
    x.fillStyle = muted;
    x.textAlign = "center";
    x.fillText(
      (max * i / 4).toFixed(opts.decimals || 0) + (opts.percent ? "%" : ""),
      xx,
      h - 7
    );
  }

  labels.forEach((s, i) => {
    let y = top + gap * (i + .5),
      bw = pw * vals[i] / max;

    x.textAlign = "right";
    x.fillStyle = "#48536d";
    x.fillText(s, left - 8, y + 4);

    let g = x.createLinearGradient(left, 0, left + bw, 0);
    g.addColorStop(0, purple);
    g.addColorStop(1, teal);
    x.fillStyle = g;

    x.beginPath();
    x.roundRect(
      left,
      y - Math.min(22, gap * .52) / 2,
      Math.max(1, bw),
      Math.min(22, gap * .52),
      5
    );
    x.fill();

    x.textAlign = "left";
    x.fillStyle = "#25304a";
    x.font = "bold 10px Segoe UI";
    x.fillText(
      opts.labels ? opts.labels[i] : vals[i],
      Math.min(left + bw + 6, w - 45),
      y + 4
    );
    x.font = "11px Segoe UI";
  });
}

function donut(id, vals) {
  let o = canvas(id);
  if (!o) return;

  let { x, w, h } = o,
    cx = w / 2,
    cy = h / 2 - 4,
    r = Math.min(w, h) * .32,
    inner = r * .62,
    total = vals.reduce((a, b) => a + b, 0),
    a = -Math.PI / 2;

  x.clearRect(0, 0, w, h);

  vals.forEach((v, i) => {
    let b = a + Math.PI * 2 * v / total;
    x.beginPath();
    x.arc(cx, cy, r, a, b);
    x.arc(cx, cy, inner, b, a, true);
    x.closePath();
    x.fillStyle = i ? teal : purple;
    x.fill();
    a = b;
  });

  x.textAlign = "center";
  x.fillStyle = "#202944";
  x.font = "bold 23px Segoe UI";
  x.fillText(total.toLocaleString(), cx, cy);

  x.font = "11px Segoe UI";
  x.fillStyle = muted;
  x.fillText("test records", cx, cy + 19);
}

function charts() {
  bars(
    "metrics",
    ["Accuracy", "Precision", "Recall", "F1-score"],
    [92.43, 66.74, 95.21, 78.47],
    100,
    {
      left: 85,
      percent: true,
      labels: ["92.43%", "66.74%", "95.21%", "78.47%"]
    }
  );

  donut("classes", [5674, 961]);

  bars(
    "performance",
    ["Accuracy", "Drop-off precision", "Drop-off recall", "Drop-off F1-score"],
    [92.43, 66.74, 95.21, 78.47],
    100,
    {
      left: 145,
      percent: true,
      labels: ["92.43%", "66.74%", "95.21%", "78.47%"]
    }
  );

  bars(
    "feature",
    [
      "Attention required · high",
      "Hook strength",
      "Cognitive load",
      "Pause count",
      "Skip intro",
      "Pacing score",
      "Episode duration"
    ],
    [.49105, .312232, .135919, .043077, .013834, .003208, .000680],
    .55,
    {
      left: 155,
      decimals: 2,
      labels: [
        "0.491050",
        "0.312232",
        "0.135919",
        "0.043077",
        "0.013834",
        "0.003208",
        "0.000680"
      ]
    }
  );
}

function go(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.toggle("active", s.id === id)
  );

  document.querySelectorAll(".nav button").forEach(b =>
    b.classList.toggle("active", b.dataset.page === id)
  );

  setTimeout(charts, 40);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav button").forEach(b =>
  b.onclick = () => go(b.dataset.page)
);

function predictDemo() {
  let a = document.getElementById("attention").value,
    h = document.getElementById("hook").value,
    l = document.getElementById("load").value,
    p = Number(document.getElementById("pauses").value) || 0,
    s = (a === "High" ? 2 : 0) +
        (h === "Low" ? 2 : 0) +
        (l === "High" ? 1 : 0) +
        (p >= 4 ? 1 : 0),
    risk = s >= 3;

  document.getElementById("resultText").textContent = risk
    ? "The illustrative rules flag this combination for further review."
    : "The illustrative rules do not flag this combination as high risk.";

  let t = document.getElementById("resultTag");
  t.textContent = risk
    ? "Illustrative: review suggested"
    : "Illustrative: no high-risk flag";
  t.className = "tag" + (risk ? "" : " low");

  document.getElementById("result").classList.add("show");
}

window.addEventListener("load", charts);
window.addEventListener("resize", () => setTimeout(charts, 100));