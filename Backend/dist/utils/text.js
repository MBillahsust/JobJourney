"use strict";
// tiny text helpers for ATS
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOPWORDS = void 0;
exports.stripHtml = stripHtml;
exports.normalizeForMatch = normalizeForMatch;
exports.containsNormalized = containsNormalized;
exports.tokenizeKeywords = tokenizeKeywords;
exports.topKeywords = topKeywords;
const RAW_STOPWORDS = `
a an and are as at be but by for from has have he her hers him his i in into is it its itself
me more most my of on or our ours she so that the their them they this to was we were what when where which who will with you your yours
about above after again against all am among because been before being below between both did do does doing down during each few further
here how if into itself just no nor not off once only other out over own same should than then there these those through too under until up very
`;
exports.STOPWORDS = new Set(RAW_STOPWORDS.split(/\s+/).map(s => s.trim().toLowerCase()).filter(Boolean));
function stripHtml(html) {
    if (!html)
        return "";
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function normalizeForMatch(s) {
    // lower + collapse non-alphanum to single space; keep + and # so C++/C# survive
    return s
        .toLowerCase()
        .replace(/[^a-z0-9+#.]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function containsNormalized(haystackNorm, needleRaw) {
    const needle = normalizeForMatch(needleRaw);
    if (!needle)
        return false;
    // quick exact word/phrase lookup
    return (" " + haystackNorm + " ").includes(" " + needle + " ");
}
function tokenizeKeywords(s) {
    const norm = normalizeForMatch(s);
    const tokens = norm.split(" ").filter(Boolean);
    return tokens.filter(t => !exports.STOPWORDS.has(t) && t.length >= 2);
}
function topKeywords(s, topN = 30) {
    const tokens = tokenizeKeywords(s);
    const freq = new Map();
    for (const t of tokens)
        freq.set(t, (freq.get(t) || 0) + 1);
    return [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([k]) => k);
}
