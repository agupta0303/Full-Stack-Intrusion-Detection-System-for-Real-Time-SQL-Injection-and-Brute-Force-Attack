module.exports = {
  sqlRegexPatterns: [
    // Tautologies and Blind boolean logic (e.g. OR 1=1, AND 'a'='a', OR 25=25)
    /(?:\b(?:OR|AND)\b)\s+(?:['"]?)([^'"\s]+)(?:['"]?)\s*(?:=|LIKE|>|<|>=|<=)\s*(?:['"]?)\1(?:['"]?)/i,
    // UNION SELECT bypasses
    /\bUNION\b\s+(?:ALL\s+)?\bSELECT\b/i,
    // Stacked queries launching DML/DDL commands
    /;\s*(?:DECLARE|DROP|DELETE|INSERT|UPDATE|EXEC|ALTER|CREATE|TRUNCATE)\b/i,
    // System and File execution commands (Out-of-band / RCE)
    /\b(?:xp_cmdshell|load_file|sys_exec|sys_eval|sp_addextendedproc|sp_executesql)\b/i,
    // Time-based Blind SQLi
    /\b(?:WAITFOR\s+DELAY|SLEEP|PG_SLEEP|BENCHMARK)\b(?:\s*\(|\s+['"])/i,
    // Error-based SQLi (extractvalue, updatexml)
    /\b(?:EXTRACTVALUE|UPDATEXML|CAST|CONVERT)\s*\(/i,
    // Schema enumeration
    /\b(?:information_schema|mysql\.db|sqlite_master|pg_catalog|sysdatabases|sysobjects)\b/i,
    // Heavy Hex/Base64 encoding which is non-standard for normal input
    /\b0x[0-9a-fA-F]{10,}\b/i,
    // Common inline comments after quotes (e.g. admin' --)
    /['"]\s*(?:--|#|\/\*)/
  ]
};
