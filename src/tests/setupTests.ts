import '@testing-library/jest-dom';

const columnPositions: Record<string, number> = {
  BACKLOG: 0,
  TODO: 260,
  DOING: 520,
  DONE: 780,
};

const defaultRect = {
  x: 0,
  y: 0,
  width: 220,
  height: 600,
  top: 0,
  left: 0,
  right: 220,
  bottom: 600,
  toJSON() {
    return this;
  },
};

Element.prototype.getBoundingClientRect = function getBoundingClientRect(): DOMRect {
  const element = this as HTMLElement;
  const datasetId =
    element.getAttribute('data-column-id') ??
    (element.getAttribute('data-testid')?.replace('column-', '') ?? undefined);

  if (datasetId && columnPositions[datasetId] !== undefined) {
    const left = columnPositions[datasetId];
    return {
      ...defaultRect,
      left,
      right: left + defaultRect.width,
      x: left,
    } as DOMRect;
  }

  return {
    x: 0,
    y: 0,
    width: 200,
    height: 60,
    top: 0,
    left: 0,
    right: 200,
    bottom: 60,
    toJSON() {
      return this;
    },
  } as DOMRect;
};
