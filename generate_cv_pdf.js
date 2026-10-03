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
    'network traffic analysis, and security monitoring.'
  ],
  skills: [
    'Cybersecurity and SOC operations',
    'Threat detection and SIEM monitoring',
    'Network security and firewalling',
    'Incident response and investigation',
    'Security automation and analysis'
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
  languages: 'French, English, Arabic'
};

function buildCvLines(data) {
  return [
    data.name,
    data.title,
    '',
    'Profile',
    ...data.profile,
    '',
    'Core Skills',
    ...data.skills.map((item) => `- ${item}`),
    '',
    'Certifications',
    ...data.certifications.map((item) => `- ${item}`),
    '',
    'Experience',
    ...data.experience,
    '',
    'Education',
    ...data.education,
    '',
    'Languages',
    data.languages
  ];
}

function escapePdfText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .replace(/\n/g, ' ');
}

const lines = buildCvLines(cvData);
const contentLines = ['BT', '/F1 20 Tf', '50 760 Td'];
contentLines.push(`(${escapePdfText(lines[0])}) Tj`);
contentLines.push('0 -25 Td');
contentLines.push('/F1 12 Tf');

for (let i = 1; i < lines.length; i += 1) {
  const line = lines[i];
  if (line === '') {
    contentLines.push('0 -16 Td');
    continue;
  }
  contentLines.push(`(${escapePdfText(line)}) Tj`);
  contentLines.push('0 -18 Td');
}

contentLines.push('ET');
const content = contentLines.join('\n');
const contentBytes = Buffer.byteLength(content, 'utf8');

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
  `<< /Length ${contentBytes} >>\nstream\n${content}\nendstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];

let pdf = '%PDF-1.4\n';
const offsets = [];
for (let i = 0; i < objects.length; i += 1) {
  offsets.push(Buffer.byteLength(pdf, 'binary'));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, 'binary');
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets) {
  pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
fs.writeFileSync(pdfPath, pdf, 'binary');
console.log(`Generated PDF at: ${pdfPath}`);
