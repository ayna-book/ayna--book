const canvas =
  document.getElementById("militaryRadarCanvas");

const ctx = canvas.getContext("2d");

let sweep = 0;

const contacts = [];

function resize() {

  canvas.width =
    window.innerWidth;

  canvas.height =
    window.innerHeight;

}

window.addEventListener(
  "resize",
  resize
);

resize();

for (let i = 0; i < 12; i++) {

  contacts.push({

    angle:
      Math.random() *
      Math.PI * 2,

    distance:
      0.1 +
      Math.random() * 0.85

  });

}

function draw() {

  const cx =
    canvas.width / 2;

  const cy =
    canvas.height / 2;

  const radius =
    Math.min(
      canvas.width,
      canvas.height
    ) * .39;


  ctx.fillStyle =
    "#03070d";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* Radar rings */

  ctx.strokeStyle =
    "#4da6ff";

  ctx.lineWidth = 1;

  for (let i = 1; i <= 5; i++) {

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      radius * i / 5,
      0,
      Math.PI * 2
    );

    ctx.stroke();

  }


  /* Cross */

  ctx.beginPath();

  ctx.moveTo(
    cx - radius,
    cy
  );

  ctx.lineTo(
    cx + radius,
    cy
  );

  ctx.moveTo(
    cx,
    cy - radius
  );

  ctx.lineTo(
    cx,
    cy + radius
  );

  ctx.stroke();


  /* Sweep */

  const sx =
    cx +
    Math.cos(sweep) *
    radius;

  const sy =
    cy +
    Math.sin(sweep) *
    radius;

  ctx.strokeStyle =
    "#00b7ff";

  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.moveTo(cx, cy);

  ctx.lineTo(sx, sy);

  ctx.stroke();


  /* Simulated contacts */

  contacts.forEach(contact => {

    const x =
      cx +
      Math.cos(contact.angle) *
      radius *
      contact.distance;

    const y =
      cy +
      Math.sin(contact.angle) *
      radius *
      contact.distance;

    const diff =
      Math.abs(
        Math.atan2(
          Math.sin(
            sweep -
            contact.angle
          ),
          Math.cos(
            sweep -
            contact.angle
          )
        )
      );


    if (diff < .15) {

      ctx.fillStyle =
        "#ff3b3b";

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }

  });


  sweep += .018;

  requestAnimationFrame(draw);

}

draw();