const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const pdfPath = path.join(projectRoot, 'assets', 'cv', 'Resume.pdf');

const cvData = {
  name: 'Abir Htira',
  title: 'Network & Security Engineer | SOC Analyst | Detection & Incident Response',
  profile: [
    'Engineering graduate specialized in cybersecurity, SOC operations, network security,',
    'and secure infrastructure. Skilled in threat detection, incident response,',
    'network traffic analysis, security monitoring, and automation.'
  ],
  skills: [
    'SOC Operations',
    'SIEM & Security Monitoring',
    'Alert Triage & Incident Analysis',
    'Threat Detection & Threat Hunting',
    'Incident Response',
    'Threat Intelligence & IOC Analysis',
    'MITRE ATT&CK',
    'EDR / XDR',
    'IDS / IPS',
    'SOAR & Security Automation',
    'Firewalling & NGFW',
    'Palo Alto Networks',
    'Fortinet / FortiGate',
    'VPN',
    'VLAN & Network Segmentation',
    'NAT',
    'Network Traffic Analysis',
    'Wireshark',
    'Nmap',
    'TCP/IP',
    'LAN / WAN',
    'Routing & Switching',
    'OSPF',
    'Network Troubleshooting',
    '3G / 4G / 5G',
    'QoS & Network Monitoring',
    'Windows / Windows Server',
    'Linux / Kali Linux',
    'Active Directory',
    'Docker / Docker Compose',
    'VMware',
    'Wazuh',
    'Microsoft Sentinel',
    'Elastic / ELK',
    'OpenSearch',
    'TheHive',
    'Cortex',
    'MISP',
    'VirusTotal',
    'Grafana / Prometheus / Loki',
    'Python',
    'REST API',
    'Webhooks',
    'Security Automation',
    'SOAR Orchestration'
  ],
  certifications: [
    'Fortinet Introduction to the Threat Landscape 3.0',
    'Fortinet Network Security',
    'Oracle AI Fundamentals',
    'Oracle Cloud Infrastructure',
    'Certified Phishing Prevention Specialist'
  ],
  experience: [
    'Network & Cybersecurity Engineer - SOC',
    'Final-Year Internship / PFE',
    'Feb. 2026 - Jul. 2026'
  ],
  education: [
    'Communications & Networks Engineering (ENIG, 2026)',
    'Focused on network security and cybersecurity.'
  ],
  academicProjects: [
    'AI-based Android Attack Detection — Design and development of an AI-based system for detecting Android attacks (rooting, privilege escalation, malicious behaviors). Extraction of system and network indicators, training of classification models (LSTM, Random Forest), and integration into a supervision platform for proactive mobile threat detection. Tools: Python, Wireshark, TShark, GNS3, VirtualBox.',
    'VoIP/SMS QoS Analysis — Deployment of a VoIP (SIP/RTP) and SMS (SMPP) environment under Linux with controlled network congestion using iPerf3. Implementation of QoS mechanisms (tc/netem, DSCP marking, Weighted Fair Queuing) and performance analysis (latency, jitter, packet loss) using Wireshark.',
    'CV Management Web Application — Development of a web application for CV management and centralization. Technologies: React.js, Node.js, MongoDB.'
  ],
  languages: 'French, English, Arabic'
};

function wrapText(value, maxLength = 92) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxLength) {
      line = candidate;
    } else {
      if (line) {
        lines.push(line);
      }
      line = `  ${word}`;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function buildCvRows(data) {
  const rows = [
    { type: 'title', text: data.name },
    { type: 'subtitle', text: data.title },
    { type: 'spacer' },
    { type: 'heading', text: 'Profile' },
    ...data.profile.flatMap((line) => wrapText(line).map((text) => ({ type: 'body', text }))),
    { type: 'heading', text: 'Core Skills' },
    ...data.skills.flatMap((item) => wrapText(`- ${item}`).map((text) => ({ type: 'body', text }))),
    { type: 'heading', text: 'Certifications' },
    ...data.certifications.flatMap((item) => wrapText(`- ${item}`).map((text) => ({ type: 'body', text }))),
    { type: 'heading', text: 'Experience' },
    ...data.experience.flatMap((item) => wrapText(item).map((text) => ({ type: 'body', text }))),
    { type: 'heading', text: 'Academic Projects' },
    ...data.academicProjects.flatMap((item) => wrapText(`- ${item}`).map((text) => ({ type: 'body', text }))),
    { type: 'heading', text: 'Education' },
    ...data.education.flatMap((item) => wrapText(item).map((text) => ({ type: 'body', text }))),
    { type: 'heading', text: 'Languages' },
    ...wrapText(data.languages).map((text) => ({ type: 'body', text }))
  ];

  return rows;
}

function escapePdfText(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—−]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .replace(/\n/g, ' ');
}

const rowStyles = {
  title: { font: 'F2', size: 19, lineHeight: 26, gap: 0 },
  subtitle: { font: 'F1', size: 9, lineHeight: 18, gap: 0 },
  heading: { font: 'F2', size: 11, lineHeight: 16, gap: 7 },
  body: { font: 'F1', size: 9, lineHeight: 12, gap: 0 },
  spacer: { font: 'F1', size: 9, lineHeight: 8, gap: 0 }
};
const rows = buildCvRows(cvData);
const pageContents = [];
let operations = [];
let y = 790;

function finishPage() {
  pageContents.push(operations.join('\n'));
  operations = [];
}

for (const row of rows) {
  const style = rowStyles[row.type];
  if (y - style.gap - style.lineHeight < 50) {
    finishPage();
    y = 790;
    operations.push(`BT /F2 9 Tf 1 0 0 1 50 ${y} Tm (${escapePdfText(`${cvData.name} - Resume`)}) Tj ET`);
    y -= 18;
  }

  y -= style.gap;
  if (row.type !== 'spacer') {
    operations.push(
      `BT /${style.font} ${style.size} Tf 1 0 0 1 50 ${y} Tm (${escapePdfText(row.text)}) Tj ET`
    );
  }
  y -= style.lineHeight;
}
finishPage();

const pageObjectStart = 3;
const regularFontObject = pageObjectStart + pageContents.length * 2;
const boldFontObject = regularFontObject + 1;
const pageObjectIds = pageContents.map((_, index) => pageObjectStart + index * 2);
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageContents.length} >>`
];

for (let i = 0; i < pageContents.length; i += 1) {
  const pageObject = pageObjectStart + i * 2;
  const contentObject = pageObject + 1;
  const content = pageContents[i];
  const contentLength = Buffer.byteLength(content, 'ascii');
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObject} 0 R /Resources << /Font << /F1 ${regularFontObject} 0 R /F2 ${boldFontObject} 0 R >> >> >>`,
    `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`
  );
}

objects.push(
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
);

const buffers = [Buffer.from('%PDF-1.4\n', 'ascii')];
const offsets = [];
let byteOffset = buffers[0].length;

for (let i = 0; i < objects.length; i += 1) {
  offsets.push(byteOffset);
  const objectBuffer = Buffer.from(`${i + 1} 0 obj\n${objects[i]}\nendobj\n`, 'ascii');
  buffers.push(objectBuffer);
  byteOffset += objectBuffer.length;
}

const xrefOffset = byteOffset;
let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
xref += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
buffers.push(Buffer.from(xref, 'ascii'));

fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
fs.writeFileSync(pdfPath, Buffer.concat(buffers));
console.log(`Generated PDF at: ${pdfPath}`);
