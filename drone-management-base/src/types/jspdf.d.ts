declare module 'jspdf' {
  class jsPDF {
    constructor(options?: any);
    setFontSize(size: number): jsPDF;
    text(text: string, x: number, y: number, options?: any): jsPDF;
    save(filename: string): jsPDF;
    addPage(): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    rect(x: number, y: number, w: number, h: number, style?: string): jsPDF;
    setFont(fontName: string, fontStyle?: string): jsPDF;
    setTextColor(r: number, g: number, b: number): jsPDF;
    setFillColor(r: number, g: number, b: number): jsPDF;
    setDrawColor(r: number, g: number, b: number): jsPDF;
  }
  export = jsPDF;
}

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  function autoTable(doc: jsPDF, options: any): void;
  
  export = autoTable;
} 