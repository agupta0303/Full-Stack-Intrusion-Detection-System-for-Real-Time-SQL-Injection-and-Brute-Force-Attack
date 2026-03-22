module.exports = {
  sqlRegexPatterns: [
    /['"].*\bor\b.*1\s*=\s*1/i,                    // ' OR 1=1
    /\bor\b.*['"].*=\s*['"].*1/i,                  // OR with quotes + 1
    /\bunion\b\s+\bselect\b/i,                     // UNION SELECT
    /\bdrop\b.*\btable\b/i,                        // DROP TABLE
    /;\s*(drop|delete|truncate)/i,                 // ; DROP
    /shutdown/i,                                   // SHUTDOWN
    /information_schema/i,                         // Schema enumeration
    /';--/i,                                       // Classic comment trick
    /0x[0-9a-f]{20,}/i                             // Long hex encoding
  ]
};
