export function getSelectedRequestIdFromDOM(): string | undefined {
  const requestEditor = document.querySelector(
    "[data-language='http-request']",
  ) as HTMLElement;

  if (requestEditor === null) {
    return undefined;
  }

  const rawRequest = requestEditor.innerText;
  const lines = rawRequest.split("\n");
  const firstLine = lines[0]?.trim();

  if (firstLine === undefined || firstLine === "") {
    return undefined;
  }

  const parts = firstLine.split(" ");
  const pathAndQuery: string = parts[1] ?? "/";
  const [path] =
    pathAndQuery.includes("?") === true
      ? pathAndQuery.split("?")
      : [pathAndQuery, ""];

  const hostLine = lines.find((line: string) =>
    line.toLowerCase().startsWith("host:"),
  );
  const hostFromRequest =
    hostLine !== undefined
      ? hostLine.split(":").slice(1).join(":").trim()
      : undefined;

  if (hostFromRequest !== undefined && path !== undefined && path !== "") {
    const allRows = Array.from(document.querySelectorAll(".c-item-row"));

    for (const row of allRows) {
      const hostCell = row
        .querySelector("[data-column-id='REQ_HOST']")
        ?.textContent?.trim();
      const pathCell = row
        .querySelector("[data-column-id='REQ_PATH']")
        ?.textContent?.trim();
      const rowId = row.getAttribute("data-row-id");

      if (
        hostCell !== undefined &&
        hostCell !== "" &&
        hostCell.includes(hostFromRequest) &&
        pathCell === path &&
        rowId !== null &&
        rowId !== ""
      ) {
        return rowId;
      }
    }
  }

  return undefined;
}
