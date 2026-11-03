import Phaser from "phaser";
import { chocolateOrder } from "../data/learning/orders.js";
import { assessSubmission, CORRECT_RATIO_FORMULA } from "../systems/scaling.js";
import { createMatchId, createPlayerRecord, sendLearningRecords } from "../systems/learningEvidence.js";
import { requestStudentIds } from "../ui/studentIdForm.js";

const WIDTH = 1280;
const HEIGHT = 720;
const FONT = '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

const C = {
  cream: 0xfff4df,
  paper: 0xfffdf7,
  ink: 0x4b3024,
  brown: 0x75452f,
  brownDark: 0x4e2e22,
  line: 0xe3cdb1,
  muted: 0x806b5d,
  yellow: 0xffd66e,
  yellowLight: 0xffedb6,
  green: 0x5b8e66,
  greenLight: 0xe5f3df,
  red: 0xb9574e,
  redLight: 0xffe8e0,
  milk: 0x75452f,
  strawberry: 0xd97588,
  white: 0xe8c895,
};

const CHOCOLATE_COLORS = [
  { id: "milk", label: "牛奶", color: C.milk },
  { id: "strawberry", label: "草莓", color: C.strawberry },
  { id: "white", label: "白巧克力", color: C.white },
];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.svg("capybara", assetUrl("assets/custom/capybara.svg"), { width: 360, height: 360 });
    this.load.image("chocoTile", assetUrl("assets/kenney/platformer-art-candy/Tiles/choco.png"));
    this.load.image("candyRed", assetUrl("assets/kenney/platformer-art-candy/Tiles/candyRed.png"));
    this.load.image("lollipop", assetUrl("assets/kenney/platformer-art-candy/Tiles/lollipopWhiteGreen.png"));
    this.load.image("buttonYellow", assetUrl("assets/kenney/ui-pack/PNG/Yellow/Default/button_rectangle_depth_flat.png"));
  }

  create() {
    this.uiObjects = [];
    this.state = {
      phase: "briefing",
      playerIndex: 0,
      results: [null, null],
      draft: null,
      studentIds: null,
      matchId: null,
      submissionStatus: "idle",
      submissionError: "",
    };
    this.activeField = "k";
    this.cameras.main.setBackgroundColor(C.cream);
    this.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.BACKSPACE, Phaser.Input.Keyboard.KeyCodes.ENTER]);
    this.input.keyboard.on("keydown", this.handleKeyboardInput, this);
    this.events.once("shutdown", () => {
      this.input.keyboard.off("keydown", this.handleKeyboardInput, this);
    });
    this.renderBriefing();
  }

  handleKeyboardInput(event) {
    if (event.target instanceof HTMLElement && event.target.closest("#student-id-form")) return;
    if (this.state.phase !== "challenge" || !this.activeField) return;

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      this.appendInput(event.key);
    } else if (event.key === "." || event.key === ",") {
      event.preventDefault();
      this.appendInput(".");
    } else if (event.key === "Backspace") {
      event.preventDefault();
      this.appendInput("⌫");
    } else if (event.key === "Enter") {
      event.preventDefault();
      this.focusNextField();
    }
  }

  appendInput(key) {
    const draft = this.state.draft;
    if (!draft || !this.activeField) return;

    const current = draft.values[this.activeField] ?? "";
    if (key === "⌫") {
      draft.values[this.activeField] = current.slice(0, -1);
    } else if (key === "清除") {
      draft.values[this.activeField] = "";
    } else if (key === ".") {
      if (!current.includes(".")) draft.values[this.activeField] = current ? `${current}.` : "0.";
    } else if (current.length < 7) {
      draft.values[this.activeField] = `${current}${key}`;
    }

    this.renderChallenge();
  }

  focusNextField() {
    const fields = this.getFields();
    const index = fields.indexOf(this.activeField);
    this.activeField = fields[(index + 1) % fields.length];
    this.renderChallenge();
  }

  getFields() {
    const template = chocolateOrder.templates[this.state.draft.shape];
    return ["k", ...template.originalSides.map((_, index) => `side_${index}`)];
  }

  track(object) {
    this.uiObjects.push(object);
    return object;
  }

  clearScreen() {
    for (const object of this.uiObjects) {
      if (object && !object.isDestroyed && typeof object.destroy === "function") object.destroy();
    }
    this.uiObjects.length = 0;
  }

  addText(x, y, text, size = 22, color = C.ink, options = {}) {
    const object = this.add.text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      color: `#${color.toString(16).padStart(6, "0")}`,
      fontStyle: options.bold ? "bold" : "normal",
      align: options.align ?? "left",
      lineSpacing: options.lineSpacing ?? 5,
      wordWrap: options.wrap ? { width: options.wrap } : undefined,
    });
    if (options.originX !== undefined || options.originY !== undefined) {
      object.setOrigin(options.originX ?? 0, options.originY ?? 0);
    }
    if (options.depth !== undefined) object.setDepth(options.depth);
    return this.track(object);
  }

  addImage(x, y, key, width, height = width) {
    const image = this.add.image(x, y, key).setDisplaySize(width, height);
    return this.track(image);
  }

  drawBackdrop() {
    const bg = this.add.graphics();
    bg.fillStyle(C.cream, 1);
    bg.fillRect(0, 0, WIDTH, HEIGHT);
    bg.fillStyle(0xf9e7c6, 0.42);
    bg.fillCircle(1210, 670, 120);
    bg.fillCircle(30, 35, 90);
    this.track(bg);
  }

  drawPanel(x, y, width, height, fill = C.paper, stroke = C.line, radius = 22) {
    const graphics = this.add.graphics();
    graphics.fillStyle(fill, 1);
    graphics.fillRoundedRect(x, y, width, height, radius);
    graphics.lineStyle(2, stroke, 1);
    graphics.strokeRoundedRect(x, y, width, height, radius);
    return this.track(graphics);
  }

  drawHeader(status = "訂單簡報") {
    const bar = this.add.graphics();
    bar.fillStyle(C.brownDark, 1);
    bar.fillRect(0, 0, WIDTH, 88);
    this.track(bar);
    this.addImage(50, 44, "chocoTile", 46, 46);
    this.addText(82, 22, "水豚巧克力工坊", 28, 0xfff7e8, { bold: true });
    this.addText(660, 31, status, 18, 0xffe6b2, { align: "center", originX: 0.5 });
    this.addImage(1190, 48, "capybara", 76, 76);
  }

  addButton(x, y, width, height, label, callback, options = {}) {
    const isPrimary = options.primary ?? false;
    let background;

    if (isPrimary && this.textures.exists("buttonYellow")) {
      background = this.add.nineslice(
        x + width / 2,
        y + height / 2,
        "buttonYellow",
        undefined,
        width,
        height,
        14,
        14,
        14,
        14,
      );
    } else {
      background = this.add.rectangle(
        x + width / 2,
        y + height / 2,
        width,
        height,
        options.fill ?? C.yellowLight,
      );
      background.setStrokeStyle(2, options.stroke ?? C.line);
    }

    background.setInteractive({ useHandCursor: true });
    background.on("pointerdown", callback);
    this.track(background);
    const labelObject = this.addText(x + width / 2, y + height / 2, label, options.fontSize ?? 18, options.textColor ?? C.ink, {
      bold: options.bold ?? true,
      align: "center",
      originX: 0.5,
      originY: 0.5,
    });
    labelObject.setDepth(2);
    return background;
  }

  renderBriefing() {
    this.clearScreen();
    this.drawBackdrop();
    this.drawHeader("今日訂單");
    this.drawPanel(48, 116, 700, 552);
    this.drawPanel(770, 116, 462, 552, 0xfff9ee, 0xf0d5aa);

    this.addText(84, 150, "訂單 01｜巧克力放大訂單", 27, C.brownDark, { bold: true });
    this.addText(84, 198, "把顧客選定的邊長放大到包裝規格，\n再用同一個倍率完成整塊巧克力。", 20, C.ink, { lineSpacing: 10 });

    this.addText(90, 288, "長方形模具", 20, C.brownDark, { bold: true });
    this.drawChocolate(225, 350, "rectangle", C.milk, 138, 78, false);
    this.addText(340, 325, "原圖：4 × 6 cm", 18, C.ink, { bold: true });
    this.addText(340, 355, "指定邊：4 cm → 8 cm", 16, C.muted);

    this.addText(90, 430, "三角形模具", 20, C.brownDark, { bold: true });
    this.drawChocolate(225, 507, "triangle", C.strawberry, 138, 82, false);
    this.addText(340, 482, "原圖：直角邊 3、底邊 4、斜邊 5 cm", 17, C.ink, { bold: true });
    this.addText(340, 512, "指定邊：3 cm → 6 cm", 16, C.muted);

    this.addText(84, 602, "兩位玩家各選一種形狀；答案等雙方完成後才揭曉。", 16, C.muted, { wrap: 620 });
    this.addText(815, 160, "嗨！我是水豚店長。\n記得讓每一條對應邊\n都乘上同一個比例喔！", 20, C.ink, { lineSpacing: 9 });
    this.addImage(995, 330, "capybara", 208, 216);
    this.addImage(830, 400, "lollipop", 58, 58);
    this.addImage(1165, 542, "candyRed", 56, 56);
    this.addText(820, 498, "兩人共用一台裝置，\n輸入學號後輪流完成訂單。", 17, C.muted, { lineSpacing: 7 });
    this.addButton(864, 585, 300, 60, "輸入學號，開始設計", () => this.startSession(), { primary: true, fontSize: 20 });
  }

  async startSession() {
    try {
      const studentIds = await requestStudentIds();
      if (!studentIds) return;
      this.state.studentIds = studentIds;
      this.state.matchId = createMatchId();
      this.state.submissionStatus = "idle";
      this.state.submissionError = "";
      this.startTurn(0);
    } catch (error) {
      this.state.submissionStatus = "failed";
      this.state.submissionError = error instanceof Error ? error.message : "無法開啟學號表單。";
      this.renderBriefing();
    }
  }

  createDraft() {
    return {
      shape: "rectangle",
      color: "milk",
      decoration: false,
      formula: null,
      values: { k: "", side_0: "", side_1: "", side_2: "" },
      attempts: 0,
      firstAttempt: null,
      firstAttemptRaw: null,
      finalAttemptRaw: null,
      hintUsed: false,
      feedback: "",
      feedbackTone: "muted",
    };
  }

  startTurn(playerIndex) {
    this.state.playerIndex = playerIndex;
    this.state.phase = "challenge";
    this.state.draft = this.createDraft();
    this.activeField = "k";
    this.renderChallenge();
  }

  selectedTemplate() {
    return chocolateOrder.templates[this.state.draft.shape];
  }

  getCurrentColor() {
    return CHOCOLATE_COLORS.find((option) => option.id === this.state.draft.color)?.color ?? C.milk;
  }

  renderChallenge() {
    this.clearScreen();
    this.drawBackdrop();
    this.drawHeader(`玩家 ${this.state.playerIndex + 1} 設計中`);

    const left = { x: 32, y: 112, w: 320, h: 570 };
    const middle = { x: 366, y: 112, w: 360, h: 570 };
    const right = { x: 740, y: 112, w: 508, h: 570 };
    this.drawPanel(left.x, left.y, left.w, left.h);
    this.drawPanel(middle.x, middle.y, middle.w, middle.h);
    this.drawPanel(right.x, right.y, right.w, right.h);

    this.renderOrderCard(left);
    this.renderDesignCard(middle);
    this.renderCalculationCard(right);
  }

  renderOrderCard(card) {
    const template = this.selectedTemplate();
    const targetSource = template.originalSides[template.targetIndex];

    this.addText(card.x + 24, card.y + 22, "訂單 01", 23, C.brownDark, { bold: true });
    this.addText(card.x + 24, card.y + 62, "顧客指定一條邊長，\n請計算整個圖樣的縮放。", 17, C.muted, { lineSpacing: 7 });
    this.addText(card.x + 24, card.y + 130, "本回合選用的原圖", 16, C.brown, { bold: true });
    const dimensions = template.edgeLabels
      .map((label, index) => `${label} ${template.originalSides[index]}`)
      .join("、");
    this.addText(card.x + 24, card.y + 160, `${template.name}：${dimensions} cm`, 18, C.ink, { bold: true, wrap: card.w - 48 });
    this.addText(card.x + 24, card.y + 201, `包裝指定邊：${targetSource} cm → ${template.targetLength} cm`, 17, C.muted, { wrap: card.w - 48 });

    const separator = this.add.graphics();
    separator.lineStyle(1, C.line, 1);
    separator.lineBetween(card.x + 20, card.y + 253, card.x + card.w - 20, card.y + 253);
    this.track(separator);
    this.addImage(card.x + 76, card.y + 374, "capybara", 112, 122);
    this.addText(card.x + 158, card.y + 316, "水豚店長提醒", 16, C.brown, { bold: true });
    this.addText(card.x + 158, card.y + 346, "先找出對應邊，\n再把同一倍率\n用在每一條邊。", 16, C.muted, { lineSpacing: 7 });
    this.addText(card.x + 24, card.y + 510, "輸入完可用數字鍵盤，\n也能點右側的數字按鈕。", 14, C.muted, { lineSpacing: 5 });
  }

  renderDesignCard(card) {
    const template = this.selectedTemplate();
    const color = this.getCurrentColor();

    this.addText(card.x + 22, card.y + 22, "你的巧克力", 23, C.brownDark, { bold: true });
    this.addText(card.x + 22, card.y + 62, "選擇模具", 15, C.muted);
    this.addButton(card.x + 20, card.y + 86, 145, 42, "長方形", () => this.setShape("rectangle"), {
      fill: this.state.draft.shape === "rectangle" ? C.yellow : 0xfff9ee,
      stroke: this.state.draft.shape === "rectangle" ? C.brown : C.line,
      fontSize: 16,
    });
    this.addButton(card.x + 180, card.y + 86, 145, 42, "三角形", () => this.setShape("triangle"), {
      fill: this.state.draft.shape === "triangle" ? C.yellow : 0xfff9ee,
      stroke: this.state.draft.shape === "triangle" ? C.brown : C.line,
      fontSize: 16,
    });

    this.addText(card.x + 22, card.y + 151, "巧克力口味顏色", 15, C.muted);
    CHOCOLATE_COLORS.forEach((option, index) => {
      const cx = card.x + 58 + index * 106;
      const swatch = this.add.circle(cx, card.y + 194, 20, option.color);
      swatch.setStrokeStyle(this.state.draft.color === option.id ? 4 : 2, this.state.draft.color === option.id ? C.brownDark : C.line);
      swatch.setInteractive({ useHandCursor: true });
      swatch.on("pointerdown", () => {
        this.state.draft.color = option.id;
        this.renderChallenge();
      });
      this.track(swatch);
      this.addText(cx, card.y + 226, option.label, 13, C.muted, { align: "center", originX: 0.5 });
    });

    this.drawChocolate(card.x + card.w / 2, card.y + 356, template.id, color, 220, 145, this.state.draft.decoration);
    this.addText(card.x + card.w / 2, card.y + 453, `原圖邊長：${template.originalSides.join("、")} cm`, 15, C.muted, { align: "center", originX: 0.5 });
    this.addButton(card.x + 56, card.y + 490, 250, 44, this.state.draft.decoration ? "移除糖果裝飾" : "加上糖果裝飾", () => {
      this.state.draft.decoration = !this.state.draft.decoration;
      this.renderChallenge();
    }, {
      fill: this.state.draft.decoration ? C.yellowLight : 0xfff9ee,
      stroke: C.line,
      fontSize: 15,
    });
    this.addText(card.x + card.w / 2, card.y + 544, "裝飾不影響尺寸判定", 13, C.muted, { align: "center", originX: 0.5 });
  }

  renderCalculationCard(card) {
    const template = this.selectedTemplate();
    const contentX = card.x + 22;

    this.addText(contentX, card.y + 20, "計算與輸入", 23, C.brownDark, { bold: true });
    this.addText(contentX, card.y + 61, "選擇比例算式", 15, C.muted);
    this.addButton(contentX, card.y + 84, 220, 48, "目標邊長 ÷ 原圖對應邊", () => {
      this.state.draft.formula = CORRECT_RATIO_FORMULA;
      this.renderChallenge();
    }, {
      fill: this.state.draft.formula === CORRECT_RATIO_FORMULA ? C.greenLight : 0xfff9ee,
      stroke: this.state.draft.formula === CORRECT_RATIO_FORMULA ? C.green : C.line,
      fontSize: 14,
    });
    this.addButton(contentX + 232, card.y + 84, 232, 48, "原圖對應邊 ÷ 目標邊長", () => {
      this.state.draft.formula = "original-over-target";
      this.renderChallenge();
    }, {
      fill: this.state.draft.formula === "original-over-target" ? C.redLight : 0xfff9ee,
      stroke: this.state.draft.formula === "original-over-target" ? C.red : C.line,
      fontSize: 14,
    });

    this.addText(contentX, card.y + 157, "縮放比例 k", 16, C.brown, { bold: true });
    this.drawInputField("k", "k", contentX + 130, card.y + 150, 140, 48);
    this.addText(contentX, card.y + 216, "縮放後的對應邊長（cm）", 16, C.brown, { bold: true });

    const count = template.originalSides.length;
    const gap = 10;
    const fieldWidth = count === 3 ? 132 : 198;
    const totalWidth = count * fieldWidth + (count - 1) * gap;
    const startX = contentX + Math.max(0, (card.w - 44 - totalWidth) / 2);
    template.originalSides.forEach((_, index) => {
      const x = startX + index * (fieldWidth + gap);
      this.drawInputField(`side_${index}`, template.edgeLabels[index], x, card.y + 249, fieldWidth, 48);
    });

    this.drawKeypad(card.x + 22, card.y + 326);
    this.addButton(card.x + 246, card.y + 348, 218, 48, "水豚提示", () => this.showHint(), {
      fill: C.greenLight,
      stroke: 0xb8d4ad,
      fontSize: 17,
    });
    this.addButton(card.x + 246, card.y + 408, 218, 54, "送出設計", () => this.submitTurn(), {
      primary: true,
      fontSize: 19,
    });

    const feedbackColor = this.state.draft.feedbackTone === "error" ? C.red : C.muted;
    if (this.state.draft.feedback) {
      this.addText(card.x + 22, card.y + 483, this.state.draft.feedback, 14, feedbackColor, { wrap: card.w - 44, lineSpacing: 4 });
    } else {
      this.addText(card.x + 22, card.y + 492, "先點選數值格，再輸入或使用數字鍵盤。", 13, C.muted, { wrap: card.w - 44 });
    }
  }

  drawInputField(key, label, x, y, width, height) {
    this.addText(x, y, label, 13, C.muted, { align: "center", originX: 0.5 });
    const box = this.add.rectangle(x + width / 2, y + 33, width, height, this.activeField === key ? 0xffedb6 : 0xfffdf7);
    box.setStrokeStyle(2, this.activeField === key ? C.brown : C.line);
    box.setInteractive({ useHandCursor: true });
    box.on("pointerdown", () => {
      this.activeField = key;
      this.renderChallenge();
    });
    this.track(box);
    const value = this.state.draft.values[key];
    this.addText(x + width / 2, y + 33, value || "—", 20, value ? C.ink : 0xb0a094, {
      align: "center",
      originX: 0.5,
      originY: 0.5,
      bold: value.length > 0,
      depth: 2,
    });
  }

  drawKeypad(x, y) {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
    const width = 56;
    const height = 34;
    const gap = 7;
    keys.forEach((key, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const button = this.add.rectangle(x + column * (width + gap) + width / 2, y + row * (height + gap) + height / 2, width, height, 0xfff8eb);
      button.setStrokeStyle(1, C.line);
      button.setInteractive({ useHandCursor: true });
      button.on("pointerdown", () => this.appendInput(key));
      this.track(button);
      this.addText(button.x, button.y, key, 17, C.ink, { align: "center", originX: 0.5, originY: 0.5, bold: true });
    });
  }

  setShape(shape) {
    if (this.state.draft.shape === shape) return;
    this.state.draft.shape = shape;
    this.state.draft.values = { k: "", side_0: "", side_1: "", side_2: "" };
    this.state.draft.formula = null;
    this.state.draft.feedback = "";
    this.activeField = "k";
    this.renderChallenge();
  }

  showHint() {
    this.state.draft.hintUsed = true;
    this.state.draft.feedbackTone = "muted";
    this.state.draft.feedback = "先用目標邊 ÷ 原圖對應邊求 k，再讓每一條對應邊都乘上同一個 k。";
    this.renderChallenge();
  }

  submitTurn() {
    const template = this.selectedTemplate();
    const draft = this.state.draft;
    const fields = this.getFields();
    if (!draft.formula || fields.some((field) => draft.values[field] === "")) {
      draft.feedback = "先選一個比例算式，並填完 k 和所有對應邊長。";
      draft.feedbackTone = "error";
      this.renderChallenge();
      return;
    }

    const assessment = assessSubmission(template, draft.values, draft.formula);
    const rawAttempt = {
      formula: draft.formula,
      factor: Number(draft.values.k),
      sides: template.originalSides.map((_, index) => Number(draft.values[`side_${index}`])),
    };
    if (draft.attempts === 0) {
      draft.firstAttempt = {
        formulaCorrect: assessment.formulaCorrect,
        factorCorrect: assessment.factorCorrect,
        sidesCorrect: assessment.sidesCorrect,
      };
      draft.firstAttemptRaw = rawAttempt;
    }
    draft.finalAttemptRaw = rawAttempt;
    draft.attempts += 1;

    if (assessment.allCorrect) {
      const targetSource = template.originalSides[template.targetIndex];
      const result = {
        player: this.state.playerIndex + 1,
        orderId: chocolateOrder.id,
        shape: template.id,
        shapeName: template.name,
        edgeLabels: [...template.edgeLabels],
        originalSides: [...template.originalSides],
        targetSource,
        targetLength: template.targetLength,
        factor: Number(draft.values.k),
        newSides: template.originalSides.map((_, index) => Number(draft.values[`side_${index}`])),
        color: draft.color,
        decoration: draft.decoration,
        attempts: draft.attempts,
        firstAttempt: draft.firstAttempt,
        firstAttemptRaw: draft.firstAttemptRaw,
        finalAttemptRaw: draft.finalAttemptRaw,
        firstAttemptScore: Object.values(draft.firstAttempt).filter(Boolean).length,
        hintUsed: draft.hintUsed,
      };
      this.state.results[this.state.playerIndex] = result;
      if (this.state.playerIndex === 0) this.renderHandoff();
      else void this.sendMatchRecords();
      return;
    }

    const messages = [];
    if (!assessment.formulaCorrect) messages.push("比例算式方向再看一次");
    if (!assessment.factorCorrect) messages.push("檢查目標邊與原圖邊的比值");
    if (!assessment.sidesCorrect) messages.push("每一條對應邊都要乘同一個 k");
    draft.feedback = `${messages.join("；")}。可以修正後再送出。`;
    draft.feedbackTone = "error";
    this.renderChallenge();
  }

  renderHandoff() {
    this.state.phase = "handoff";
    this.clearScreen();
    this.drawBackdrop();
    this.drawHeader("答案已封存");
    this.drawPanel(120, 128, 1040, 528, 0xfff9ee, 0xf0d5aa);
    this.addText(640, 192, "玩家一的設計已封存！", 32, C.brownDark, { align: "center", originX: 0.5, bold: true });
    this.addText(640, 255, "請把裝置交給玩家二。\n答案會等兩位玩家都完成後一起揭曉。", 23, C.ink, {
      align: "center",
      originX: 0.5,
      lineSpacing: 10,
    });
    this.addImage(640, 430, "capybara", 190, 200);
    this.addText(640, 538, "水豚店長：準備好就開始第二份訂單！", 18, C.muted, { align: "center", originX: 0.5 });
    this.addButton(480, 578, 320, 58, "玩家二，開始設計", () => this.startTurn(1), { primary: true, fontSize: 21 });
  }

  renderResults() {
    this.state.phase = "results";
    this.clearScreen();
    this.drawBackdrop();
    this.drawHeader("訂單完成");

    const [first, second] = this.state.results;
    const scoreOne = first.firstAttemptScore;
    const scoreTwo = second.firstAttemptScore;
    const outcome = scoreOne === scoreTwo
      ? "平手！你們都完成了正確的相似縮放。"
      : `玩家 ${scoreOne > scoreTwo ? 1 : 2} 的首次計算表現較完整。`;

    this.addText(640, 111, outcome, 25, C.brownDark, { align: "center", originX: 0.5, bold: true });
    this.addText(640, 147, "首次完整提交：比例算式、倍率、全部對應邊各 1 點；修正重試不扣分。", 15, C.muted, { align: "center", originX: 0.5 });
    this.renderResultCard(48, 182, first);
    this.renderResultCard(660, 182, second);

    this.drawPanel(250, 586, 780, 92, 0xfff9ee, 0xf0d5aa, 18);
    this.addText(640, 607, "一起想一想：為什麼所有對應邊都要乘同一個倍率？", 19, C.brownDark, { align: "center", originX: 0.5, bold: true });
    this.addText(640, 641, "水豚店長提醒：邊長按 k 倍縮放，圖樣才會保持相似。", 15, C.muted, { align: "center", originX: 0.5 });
    const statusMessage = {
      sending: "正在傳送本局學習紀錄…",
      dispatched: "傳送要求已送出，請教師確認試算表。",
      failed: this.state.submissionError || "傳送失敗，請確認連線後重試。",
    }[this.state.submissionStatus];
    if (statusMessage) {
      this.addText(640, 666, statusMessage, 13, this.state.submissionStatus === "failed" ? C.red : C.green, {
        align: "center",
        originX: 0.5,
        wrap: 760,
      });
    }
    if (this.state.submissionStatus === "failed") {
      this.addButton(1040, 605, 190, 54, "重試傳送", () => this.sendMatchRecords(), { primary: true, fontSize: 18 });
    } else if (this.state.submissionStatus === "dispatched") {
      this.addButton(1040, 605, 190, 54, "再玩一次", () => this.resetGame(), { primary: true, fontSize: 18 });
    }
  }

  async sendMatchRecords() {
    if (this.state.submissionStatus === "sending" || this.state.submissionStatus === "dispatched") return;
    if (!this.state.results.every(Boolean) || !this.state.studentIds || !this.state.matchId) return;

    const sessionState = this.state;
    sessionState.submissionStatus = "sending";
    sessionState.submissionError = "";
    this.renderResults();

    const records = sessionState.results.map((result, index) => createPlayerRecord({
      matchId: sessionState.matchId,
      studentId: sessionState.studentIds[index],
      playerNo: index + 1,
      result,
    }));

    try {
      await sendLearningRecords(records);
      if (this.state !== sessionState) return;
      sessionState.submissionStatus = "dispatched";
    } catch (error) {
      if (this.state !== sessionState) return;
      sessionState.submissionStatus = "failed";
      sessionState.submissionError = error instanceof Error ? error.message : "無法送出學習紀錄。";
    }

    if (this.state === sessionState && sessionState.phase === "results") this.renderResults();
  }

  renderResultCard(x, y, result) {
    this.drawPanel(x, y, 572, 382, C.paper, C.line, 20);
    this.addText(x + 26, y + 22, `玩家 ${result.player}`, 22, C.brownDark, { bold: true });
    this.addText(x + 270, y + 24, `首次作答 ${result.firstAttemptScore}/3`, 17, C.green, { align: "right", originX: 1, bold: true });
    this.drawChocolate(x + 175, y + 176, result.shape, this.colorById(result.color), 220, 145, result.decoration);

    const sidesLabel = result.newSides.map((side, index) => `${result.edgeLabels[index]} ${this.formatNumber(side)} cm`).join("　");
    this.addText(x + 24, y + 278, `${result.shapeName}｜${sidesLabel}`, 16, C.ink, { wrap: 526, bold: true });
    this.addText(x + 24, y + 313, `算式：k = ${result.targetLength} ÷ ${result.targetSource} = ${this.formatNumber(result.factor)}`, 16, C.brown, { bold: true });

    const first = result.firstAttempt;
    const evidence = [
      `${first.formulaCorrect ? "✓" : "○"} 比例算式`,
      `${first.factorCorrect ? "✓" : "○"} 倍率`,
      `${first.sidesCorrect ? "✓" : "○"} 全部邊長`,
    ].join("　");
    this.addText(x + 24, y + 349, `${evidence}　提示${result.hintUsed ? "有" : "無"}｜共提交 ${result.attempts} 次`, 14, C.muted, { wrap: 525 });
  }

  drawChocolate(centerX, centerY, shape, color, width, height, decoration = false) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.lineStyle(4, C.brownDark, 1);

    if (shape === "rectangle") {
      const rectWidth = Math.min(width, height * 1.5);
      const rectHeight = rectWidth / 1.5;
      const x = centerX - rectWidth / 2;
      const y = centerY - rectHeight / 2;
      graphics.fillRoundedRect(x, y, rectWidth, rectHeight, 16);
      graphics.strokeRoundedRect(x, y, rectWidth, rectHeight, 16);
      graphics.lineStyle(3, C.brownDark, 0.32);
      graphics.lineBetween(x + rectWidth / 3, y + 8, x + rectWidth / 3, y + rectHeight - 8);
      graphics.lineBetween(x + rectWidth * 2 / 3, y + 8, x + rectWidth * 2 / 3, y + rectHeight - 8);
      graphics.lineBetween(x + 8, y + rectHeight / 2, x + rectWidth - 8, y + rectHeight / 2);
    } else {
      const points = this.trianglePoints(centerX, centerY, width, height);
      graphics.beginPath();
      graphics.moveTo(points[0].x, points[0].y);
      graphics.lineTo(points[1].x, points[1].y);
      graphics.lineTo(points[2].x, points[2].y);
      graphics.closePath();
      graphics.fillPath();
      graphics.strokePath();
      graphics.lineStyle(3, C.brownDark, 0.3);
      const topLeft = points[2];
      const markerSize = Math.min(12, width * 0.06);
      graphics.beginPath();
      graphics.moveTo(topLeft.x + markerSize, topLeft.y);
      graphics.lineTo(topLeft.x + markerSize, topLeft.y + markerSize);
      graphics.lineTo(topLeft.x, topLeft.y + markerSize);
      graphics.strokePath();
    }

    this.track(graphics);
    if (decoration) this.addImage(centerX + width * 0.12, centerY, "candyRed", 38, 38);
  }

  trianglePoints(centerX, centerY, width, height) {
    // The template is a 3-4-5 right triangle: height:base:hypotenuse = 3:4:5.
    const baseWidth = Math.min(width, height * 4 / 3);
    const triangleHeight = baseWidth * 3 / 4;
    const leftX = centerX - baseWidth / 2;
    const baseY = centerY + triangleHeight / 2;
    const topY = centerY - triangleHeight / 2;
    return [
      { x: leftX, y: baseY },
      { x: leftX + baseWidth, y: baseY },
      { x: leftX, y: topY },
    ];
  }

  colorById(id) {
    return CHOCOLATE_COLORS.find((option) => option.id === id)?.color ?? C.milk;
  }

  formatNumber(value) {
    return Number.isInteger(value) ? String(value) : Number(value.toFixed(2)).toString();
  }

  resetGame() {
    this.state = {
      phase: "briefing",
      playerIndex: 0,
      results: [null, null],
      draft: null,
      studentIds: null,
      matchId: null,
      submissionStatus: "idle",
      submissionError: "",
    };
    this.renderBriefing();
  }
}
