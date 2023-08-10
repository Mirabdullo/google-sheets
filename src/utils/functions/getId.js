async function getIds(gsapi, sheetId, range) {
  const opt = {
    spreadsheetId: sheetId,
    range: range,
  };

  // gsapi.spreadsheets.values.append(idOpt);
  let data = await gsapi.spreadsheets.values.get(opt);
  let dataValue = data?.data?.values;
  return dataValue.length ? dataValue.flat() : "dataValue";
}

module.exports = getIds;
