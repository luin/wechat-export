const showAll = () => {
  [...document.querySelectorAll(".message")].forEach((element) => {
    element.style.display = "block";
  });
};

document.getElementById("all").addEventListener("click", () => {
  showAll();
});

document.body.addEventListener("dblclick", () => {
  showAll();
});

["voice", "text", "picture", "video"].forEach((type) => {
  const text = document.getElementById(type).textContent;
  document.getElementById(type).innerHTML = `${text} (${
    document.body.querySelectorAll(`.message.${type}`).length
  })`;

  document.getElementById(type).addEventListener("click", () => {
    showAll();
    [...document.querySelectorAll(`.message:not(.${type})`)].forEach(
      (element) => {
        element.style.display = "none";
      }
    );
  });
});

const audios = [...document.getElementsByTagName("audio")];
audios.forEach((audio, index) => {
  audio.addEventListener("ended", () => {
    const next = audios[index + 1];
    if (next) {
      audios.forEach((audio) => audio.pause());
      next.play();
      next.scrollIntoView();
    }
  });
});
