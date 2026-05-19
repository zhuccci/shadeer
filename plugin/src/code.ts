/// <reference types="@figma/plugin-typings" />

declare const __html__: string;

figma.showUI(__html__, { width: 360, height: 580, title: 'Neuroshade' });

async function exportSelection(): Promise<{ bytes: number[]; width: number; height: number } | null> {
  const node = figma.currentPage.selection[0];
  if (!node) return null;

  try {
    const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
    const width = 'width' in node ? (node.width as number) : 100;
    const height = 'height' in node ? (node.height as number) : 100;
    return { bytes: Array.from(bytes), width, height };
  } catch (_) {
    return null;
  }
}

figma.ui.onmessage = async (msg: Record<string, unknown>) => {
  if (msg.type === 'get-selection') {
    const result = await exportSelection();
    if (result) {
      figma.ui.postMessage({ type: 'image-data', ...result });
    } else {
      figma.ui.postMessage({ type: 'no-selection' });
    }
  }

  if (msg.type === 'apply-effect') {
    const bytes = msg.bytes as number[];
    const width = msg.width as number;
    const height = msg.height as number;
    const node = figma.currentPage.selection[0];

    const image = figma.createImage(new Uint8Array(bytes));
    const rect = figma.createRectangle();

    if (node && 'x' in node && 'width' in node) {
      rect.x = (node.x as number) + (node.width as number) + 24;
      rect.y = node.y as number;
      rect.resize(node.width as number, node.height as number);
      rect.name = `${node.name} — Neuroshade`;
    } else {
      rect.resize(width, height);
      rect.name = 'Neuroshade';
    }

    rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];
    figma.currentPage.appendChild(rect);
    figma.viewport.scrollAndZoomIntoView([rect]);
    figma.notify('Effect applied ✓');
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

figma.on('selectionchange', () => {
  const node = figma.currentPage.selection[0];
  figma.ui.postMessage({
    type: 'selection-changed',
    hasSelection: node != null,
    nodeName: node ? node.name : null,
  });
});
