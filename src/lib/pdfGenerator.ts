import { jsPDF } from 'jspdf';
import { SecurityIncident } from '../types';

export async function generateForensicReport(incident: SecurityIncident, extraData?: { 
  confidence: number;
  threatType: string;
  sourceImage?: string | null;
}) {
  const doc = new jsPDF();
  const brandPrimary = '#00D1FF';
  const brandDanger = '#FF3D00';
  
  // Header
  doc.setFillColor(15, 15, 20);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CYBER SHIELD', 20, 20);
  doc.setFontSize(10);
  doc.text('ADVANCED NEURAL FORENSIC REPORT', 20, 30);
  
  doc.setFontSize(8);
  doc.text(`REPORT ID: ${incident.id.toUpperCase()}`, 150, 15);
  doc.text(`GENERATED: ${new Date().toLocaleString()}`, 150, 20);
  
  // Body - Incident Basics
  let y = 60;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Incident Overview', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Timestamp: ${new Date(incident.timestamp).toLocaleString()}`, 20, y);
  doc.text(`Risk Level: ${incident.riskLevel}`, 100, y);
  
  y += 7;
  doc.text(`Threat Type: ${incident.type}`, 20, y);
  if (extraData) {
    doc.text(`Confidence: ${extraData.confidence}%`, 100, y);
  }
  
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Threat Description:', 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  const descriptionLines = doc.splitTextToSize(incident.description, 170);
  doc.text(descriptionLines, 20, y);
  y += (descriptionLines.length * 5) + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Source Indicator:', 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  const sourceLines = doc.splitTextToSize(incident.source, 170);
  doc.text(sourceLines, 20, y);
  y += (sourceLines.length * 5) + 10;
  
  // Mitigation Steps
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 150, 0);
  doc.text('Counter-Measure Protocol:', 20, y);
  y += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  const mitigationLines = doc.splitTextToSize(incident.mitigation, 170);
  doc.text(mitigationLines, 20, y);
  y += (mitigationLines.length * 5) + 15;
  
  // Image Evidence if available
  if (extraData?.sourceImage) {
    try {
      doc.addPage();
      doc.setFillColor(15, 15, 20);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('VISUAL EVIDENCE LOG', 20, 13);
      
      doc.addImage(extraData.sourceImage, 'PNG', 20, 40, 170, 100, undefined, 'FAST');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text('* Heatmap overlay processing applied to visual evidence layer.', 20, 150);
    } catch (e) {
      console.error("PDF Image Error", e);
    }
  }
  
  // Footer on each page would be nice but let's keep it simple for now
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Confidential - Cyber Shield Security Operations Center', 105, 285, { align: 'center' });
  
  doc.save(`cyber-shield-report-${incident.id.slice(0, 8)}.pdf`);
}
