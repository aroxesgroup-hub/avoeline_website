/** XSS / injection / SSRF / redirect / header / CSV formula corpus (T7). */
export const XSS_HTML = [
  `<script>alert(1)</script>`,
  `<img src=x onerror=alert(1)>`,
  `"><svg/onload=alert(1)>`,
  `<iframe src="javascript:alert(1)">`,
];

export const CSV_FORMULA = ["=CMD|' /C calc'!A0", "+1+1", "-1+1", "@SUM(A1:A2)", "\t=1+1"];

export const SQLI = ["' OR '1'='1", "1; DROP TABLE users--", '" OR 1=1 --'];

export const SSRF = [
  "http://127.0.0.1:5432",
  "http://169.254.169.254/latest/meta-data/",
  "file:///etc/passwd",
  "gopher://127.0.0.1:6379/_INFO",
];

export const OPEN_REDIRECT = [
  "//evil.example/phish",
  "https://evil.example/",
  "/\\evil.example",
  "https://avoeline.aroxes.com.evil.example/",
];

export const HEADER_INJECT = [
  "ok\r\nBcc: attacker@evil.example",
  "Subject\r\nX-Injected: 1",
  "name\nCc: evil@example.test",
];

export const PATH_TRAVERSAL_NAMES = [
  "../../../etc/passwd",
  "..\\..\\windows\\system32\\config\\sam",
  "safe.png/../../evil.exe",
];
