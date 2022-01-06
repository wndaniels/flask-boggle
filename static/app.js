class BoggleGame {
  /* make new Boggle Game */

  constructor(boardId, sec = 60) {
    this.sec = sec;
    this.showTimer();

    this.score = 0;
    this.words = new Set();
    this.board = $("#" + boardId);

    // every 1000 ms, "tick"
    this.timer = setInterval(this.tick.bind(this), 1000);

    $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
  }

  /* show word in list of words */

  showWord(word) {
    $(".words", this.board).append($("<li>", { text: word }));
  }

  /* show score */

  showScore() {
    $(".score", this.board).text(this.score);
  }

  /* show a status message */

  showMsg(msg, cls) {
    $(".msg", this.board).text(msg).removeClass().addClass(`msg ${cls}`);
  }

  /* handle submission of word: if not used and valid, show and add score */

  async handleSubmit(evt) {
    evt.preventDefault();
    const $word = $(".word", this.board);

    let word = $word.val();
    if (!word) return;

    if (this.words.has(word)) {
      this.showMsg(`${word} has already been used`, "err");
      return;
    }

    // check server for validity
    const res = await axios.get("/check-word", { params: { word: word } });
    if (res.data.result === "not-word") {
      this.showMsg(`${word} is not valid`, "err");
    } else if (res.data.result === "not-on-board") {
      this.showMsg(`${word} is not on board`, "err");
    } else {
      this.showWord(word);
      this.score += word.length;
      this.showScore();
      this.words.add(word);
      this.showMsg(`${word} Added!`, "ok");
    }

    $word.val("").focus();
  }

  /* Update DOM */

  showTimer() {
    $(".timer", this.board).text(this.sec);
  }

  /* handle ticks for seconds of game */

  async tick() {
    this.sec -= 1;
    this.showTimer();

    if (this.sec === 0) {
      clearInterval(this.timer);
      await this.scoreGame();
    }
  }

  /* end of game: score and update message. */

  async scoreGame() {
    $(".add-word", this.board).hide();
    const res = await axios.post("/show-score", { score: this.score });
    if (res.data.brokeRecord) {
      this.showMsg(`New High Score: ${this.score}`, "ok");
    } else {
      this.showMsg(`Final Score: ${this.score}`, "ok");
    }
  }
}
