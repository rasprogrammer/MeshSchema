import { toPng, toSvg } from "html-to-image";
import { downloadTextFile } from "@/lib/utils";

async function exportElement(
  element: HTMLElement,
  format: "png" | "svg",
  filename: string
): Promise<void> {
  const options = {
    backgroundColor: "#0b1120",
    pixelRatio: 2,
    filter: (node: HTMLElement) => !node.classList?.contains("react-flow__minimap"),
  };

  const dataUrl = format === "png" ? await toPng(element, options) : await toSvg(element, options);

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportDiagramAsPng(element: HTMLElement, filename = "erd.png") {
  return exportElement(element, "png", filename);
}

export async function exportDiagramAsSvg(element: HTMLElement, filename = "erd.svg") {
  return exportElement(element, "svg", filename);
}

export { downloadTextFile };
