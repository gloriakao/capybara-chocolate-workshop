export const chocolateOrder = {
  id: "double-size-chocolate",
  title: "巧克力放大訂單",
  description: "顧客要把選定的巧克力邊長放大，請用同一個比例計算整個圖樣。",
  templates: {
    rectangle: {
      id: "rectangle",
      name: "長方形",
      originalSides: [4, 6],
      edgeLabels: ["短邊", "長邊"],
      targetIndex: 0,
      targetLength: 8,
    },
    triangle: {
      id: "triangle",
      name: "三角形",
      originalSides: [3, 4, 5],
      edgeLabels: ["直角邊", "底邊", "斜邊"],
      targetIndex: 0,
      targetLength: 6,
    },
  },
};
