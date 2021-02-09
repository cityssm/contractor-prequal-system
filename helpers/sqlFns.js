"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWhereClauseLike = void 0;
const sanitizeWherePiece = (unsanitizedString) => {
    const sanitizedString = unsanitizedString
        .replace(/\[/g, "[[]")
        .replace(/_/g, "[_]")
        .replace(/%/g, "[%]")
        .replace(/'/g, "''");
    return sanitizedString;
};
const buildWhereClauseLike = (columnNames, queryString) => {
    let whereClause = "";
    const queryStringArray = queryString.split(" ");
    for (const queryStringPiece of queryStringArray) {
        if (queryStringPiece === "") {
            continue;
        }
        let stringWhere = "";
        for (const columnName of columnNames) {
            stringWhere += (stringWhere === "" ? "" : " or ") +
                columnName + " like '%" + sanitizeWherePiece(queryStringPiece) + "%'";
        }
        if (columnNames.length > 1) {
            stringWhere = "(" + stringWhere + ")";
        }
        whereClause += (whereClause === "" ? "" : " and ") + stringWhere;
    }
    return whereClause;
};
exports.buildWhereClauseLike = buildWhereClauseLike;
