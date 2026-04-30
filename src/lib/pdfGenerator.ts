import { jsPDF } from 'jspdf';
import { SecurityIncident } from '../types';

export async function generateForensicReport(incident: SecurityIncident, extraData?: { 
  confidence: number;
  threatType: string;
  sourceImage?: string | null;
}) {
  const doc = new jsPDF();
  
  // DRACULA MODE PDF (Dark theme)
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Accent Header
  doc.setFillColor(0, 209, 255);
  doc.rect(0, 0, 210, 2, 'F');
  
  // Neon Logo
  doc.setTextColor(0, 209, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('CYBER SHIELD', 20, 25);
  
  doc.setDrawColor(0, 209, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 30, 80, 30);
  
  doc.setTextColor(100, 100, 110);
  doc.setFontSize(9);
  doc.text('SECURE NEURAL FORENSIC PROTOCOL v4.2', 20, 37);
  
  // Top metadata boxes
  doc.setFillColor(20, 20, 25);
  doc.rect(130, 15, 65, 25, 'F');
  doc.setDrawColor(40, 40, 50);
  doc.rect(130, 15, 65, 25, 'S');
  
  doc.setTextColor(80, 80, 90);
  doc.setFontSize(7);
  doc.text('INCIDENT ID', 135, 22);
  doc.text('CLASSIFICATION', 135, 30);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(incident.id.toUpperCase(), 135, 26);
  
  const riskColor: [number, number, number] = 
    incident.riskLevel === 'CRITICAL' ? [255, 61, 0] : 
    incident.riskLevel === 'HIGH' ? [255, 152, 0] : [0, 209, 255];
    
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.text(incident.riskLevel + ' PRIORITY', 135, 34);
  
  // Main Data Section
  let y = 60;
  
  // SECTION: ORIGIN
  doc.setTextColor(80, 80, 90);
  doc.setFontSize(8);
  doc.text('NEURAL SOURCE SIGNATURE', 20, y);
  y += 6;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  const sourceLines = doc.splitTextToSize(incident.source, 170);
  doc.text(sourceLines, 20, y);
  y += (sourceLines.length * 6) + 12;
  
  // SECTION: HEURISTIC DATA
  doc.setTextColor(80, 80, 90);
  doc.setFontSize(8);
  doc.text('THREAT INTELLIGENCE SUMMARY', 20, y);
  y += 6;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(incident.description, 170);
  doc.text(descLines, 20, y);
  y += (descLines.length * 5) + 15;
  
  // DASHED LINE
  doc.setDrawColor(30, 30, 40);
  doc.setLineDashPattern([2, 1], 0);
  doc.line(20, y, 190, y);
  doc.setLineDashPattern([], 0);
  y += 15;
  
  // COUNTER-MEASURES
  doc.setTextColor(0, 255, 150);
  doc.setFontSize(9);
  doc.text('ACTIVE MITIGATION PROTOCOLS', 20, y);
  y += 8;
  
  const steps = incident.mitigation.split('. ');
  steps.forEach((step, i) => {
    if (!step) return;
    doc.setTextColor(80, 80, 90);
    doc.text(`[${i+1}]`, 20, y);
    doc.setTextColor(200, 200, 210);
    const stepLines = doc.splitTextToSize(step, 160);
    doc.text(stepLines, 28, y);
    y += (stepLines.length * 5) + 3;
  });
  
  // IMAGE ATTACHMENT
  if (extraData?.sourceImage) {
    y += 10;
    if (y > 200) {
      doc.addPage();
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, 210, 297, 'F');
      y = 30;
    }
    
    doc.setTextColor(0, 209, 255);
    doc.setFontSize(8);
    doc.text('VISUAL FORENSIC CAPTURE', 20, y);
    y += 5;
    
    try {
      doc.addImage(extraData.sourceImage, 'PNG', 20, y, 170, 95, undefined, 'FAST');
      y += 105;
      doc.setTextColor(60, 60, 70);
      doc.setFontSize(7);
      doc.text('* GRAD-CAM HEATMAP LAYERS APPLIED TO NEURAL INFERENCE ENGINE OUTPUT.', 20, y);
    } catch (e) {
      console.error("PDF Image Error", e);
    }
  }
  
  // FOOTER
  doc.setTextColor(40, 40, 50);
  doc.setFontSize(7);
  doc.text('// CLASSIFIED // CYBER SHIELD SYSTEMS // DO NOT DISTRIBUTE //', 105, 285, { align: 'center' });
  
  doc.save(`FORENSIC-REPORT-${incident.id.slice(-8)}.pdf`);
}

