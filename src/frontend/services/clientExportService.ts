import FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';
import type { Client } from '../types';
import type { Project } from '../types/project';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getProjectTotalContractValue } from '../utils/projectFinancials';

type ExportFormat = 'PDF' | 'DOCX' | 'JSON';

/**
 * Generates and downloads a client report in the given format.
 * input -> clients: Client[], projects: Project[], format: ExportFormat
 * output -> void (triggers file download)
 *
 * @example
 *   await exportClients(selectedClients, allProjects, 'PDF');
 */
export async function exportClients(
  dataToExport: Client[],
  projects: Project[],
  format: ExportFormat,
): Promise<void> {
  if (dataToExport.length === 0) {
    alert('Nenhum cliente selecionado para exportação.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const fileName = `Ficha_Cadastral_Completa_${dateStr}`;

  if (format === 'JSON') {
    exportAsJson(dataToExport, fileName);
  } else if (format === 'PDF') {
    exportAsPdf(dataToExport, projects, fileName);
  } else if (format === 'DOCX') {
    await exportAsDocx(dataToExport, projects, fileName);
  }
}

// --- Private helpers ---

function exportAsJson(data: Client[], fileName: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  FileSaver.saveAs(blob, `${fileName}.json`);
}

function exportAsPdf(data: Client[], projects: Project[], fileName: string): void {
  const doc = new jsPDF();
  let yPos = 20;
  const leftMargin = 14;
  const contentWidth = 182;
  const lineHeight = 6;

  const checkPageBreak = (spaceNeeded: number) => {
    if (yPos + spaceNeeded > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  const writeLine = (label: string, value: string | undefined | null, isBoldLabel = false) => {
    if (!value) return;
    checkPageBreak(lineHeight);
    doc.setFontSize(10);
    if (isBoldLabel) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');

    const fullText = isBoldLabel ? `${label}: ${value}` : value;
    const splitText = doc.splitTextToSize(fullText, contentWidth);
    doc.text(splitText, leftMargin, yPos);
    yPos += splitText.length * 5 + 2;
    doc.setFont('helvetica', 'normal');
  };

  const writeHeader = (text: string) => {
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(leftMargin, yPos, contentWidth, 8, 'F');
    doc.text(text, leftMargin + 2, yPos + 5.5);
    yPos += 12;
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Completo de Clientes', leftMargin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString()}`, leftMargin, yPos);
  yPos += 15;

  data.forEach((client) => {
    checkPageBreak(60);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(client.name, leftMargin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(100);
    const typeText = client.clientType === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física';
    doc.text(`${typeText} - ${client.status}`, leftMargin, yPos);
    doc.setTextColor(0);
    yPos += 10;

    writeHeader('Dados Cadastrais');
    writeLine('CPF/CNPJ', client.cpfCnpj, true);
    writeLine(
      client.clientType === 'PJ' ? 'Data de Abertura' : 'Data de Nascimento',
      client.birthDate ? formatDate(client.birthDate) : null,
      true,
    );
    writeLine('Email', client.email, true);

    if (client.representative?.name) {
      writeLine(
        'Representante',
        `${client.representative.name} (${client.representative.role || 'Cargo não inf.'})`,
        true,
      );
    }

    if (client.contacts && client.contacts.length > 0) {
      const contactsStr = client.contacts
        .map((c) => `${c.phone} ${c.isPrimary ? '(Principal)' : ''}`)
        .join(', ');
      writeLine('Contatos', contactsStr, true);
    }

    if (client.address) {
      const addr = client.address;
      const addressStr = [
        `${addr.street}, ${addr.number}`,
        addr.complement,
        addr.neighborhood,
        `${addr.city}/${addr.state}`,
        addr.zip ? `CEP: ${addr.zip}` : null,
      ]
        .filter(Boolean)
        .join(' - ');

      if (addr.street) writeLine('Endereço', addressStr, true);
    }

    const clientProjects = projects.filter((p) => p.clientId === client.id);
    if (clientProjects.length > 0) {
      writeHeader('Projetos Vinculados');
      clientProjects.forEach((proj) => {
        const value = getProjectTotalContractValue(proj);
        const projStr = `${proj.name} (${proj.code}) - Status: ${proj.status} | Valor: ${formatCurrency(value)}`;
        writeLine('•', projStr, false);
      });
    }

    if (client.meetings && client.meetings.length > 0) {
      writeHeader('Histórico de Reuniões');
      client.meetings
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .forEach((m) => {
          const note = m.notes ? ` - Obs: ${m.notes}` : '';
          writeLine(formatDate(m.date), `${m.reason}${note}`, true);
        });
    }

    if (client.generalNotes) {
      writeHeader('Observações Gerais');
      writeLine('', client.generalNotes, false);
    }

    yPos += 10;
    doc.setDrawColor(200);
    doc.line(leftMargin, yPos, leftMargin + contentWidth, yPos);
    yPos += 10;
  });

  doc.save(`${fileName}.pdf`);
}

async function exportAsDocx(data: Client[], projects: Project[], fileName: string): Promise<void> {
  const children: (typeof Paragraph extends new (...args: infer A) => infer R ? R : never)[] = [
    new Paragraph({ text: 'Relatório Completo de Clientes', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: `Gerado em: ${new Date().toLocaleString()}` }),
    new Paragraph({ text: '' }),
  ];

  data.forEach((client) => {
    children.push(
      new Paragraph({
        text: client.name,
        heading: HeadingLevel.HEADING_2,
        border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
      }),
      new Paragraph({
        text: `${client.clientType === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'} - ${client.status}`,
        spacing: { after: 200 },
      }),
    );

    const details: (typeof Paragraph extends new (...args: infer A) => infer R ? R : never)[] = [];
    if (client.cpfCnpj)
      details.push(
        new Paragraph({
          children: [new TextRun({ text: 'CPF/CNPJ: ', bold: true }), new TextRun(client.cpfCnpj)],
        }),
      );
    if (client.email)
      details.push(
        new Paragraph({
          children: [new TextRun({ text: 'Email: ', bold: true }), new TextRun(client.email)],
        }),
      );

    if (client.contacts && client.contacts.length > 0) {
      const phones = client.contacts
        .map((c) => `${c.phone} ${c.isPrimary ? '(Principal)' : ''}`)
        .join(', ');
      details.push(
        new Paragraph({
          children: [new TextRun({ text: 'Telefones: ', bold: true }), new TextRun(phones)],
        }),
      );
    }

    if (client.address && client.address.street) {
      const addr = client.address;
      const addrStr = `${addr.street}, ${addr.number} ${addr.complement || ''} - ${addr.neighborhood}, ${addr.city}/${addr.state} (${addr.zip})`;
      details.push(
        new Paragraph({
          children: [new TextRun({ text: 'Endereço: ', bold: true }), new TextRun(addrStr)],
        }),
      );
    }

    if (client.representative?.name) {
      details.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Representante: ', bold: true }),
            new TextRun(`${client.representative.name} (${client.representative.role || ''})`),
          ],
        }),
      );
    }

    if (details.length > 0) {
      children.push(
        new Paragraph({ text: 'Dados Cadastrais', heading: HeadingLevel.HEADING_3 }),
        ...details,
      );
    }

    const clientProjects = projects.filter((p) => p.clientId === client.id);
    if (clientProjects.length > 0) {
      children.push(
        new Paragraph({
          text: 'Projetos',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
      );
      clientProjects.forEach((p) => {
        children.push(
          new Paragraph({
            text: `• ${p.name} (${p.code}) - ${p.status} - ${formatCurrency(getProjectTotalContractValue(p))}`,
            bullet: { level: 0 },
          }),
        );
      });
    }

    if (client.meetings && client.meetings.length > 0) {
      children.push(
        new Paragraph({
          text: 'Histórico de Reuniões',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
      );
      client.meetings.forEach((m) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${formatDate(m.date)}: `, bold: true }),
              new TextRun(m.reason + (m.notes ? ` - ${m.notes}` : '')),
            ],
            bullet: { level: 0 },
          }),
        );
      });
    }

    if (client.generalNotes) {
      children.push(
        new Paragraph({
          text: 'Observações Gerais',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({ text: client.generalNotes }),
      );
    }

    children.push(new Paragraph({ text: '' }), new Paragraph({ text: '' }));
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  FileSaver.saveAs(blob, `${fileName}.docx`);
}
