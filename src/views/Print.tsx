import { createSignal, onMount, Show, For } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB, audioNotesDB, imageNotesDB, mediaBlobsDB, blobToDataURL } from '../lib/db';
import { sites } from '../data/sites';
import type { TextNote, AudioNote, ImageNote } from '../types';
import {
  stripHtml,
  groupNotesBySite,
  calculateStats,
  getDateRange,
  formatTimestamp,
} from '../utils/pdfHelpers';
import jsPDF from 'jspdf';
import toast from 'solid-toast';

interface AllData {
  textNotes: TextNote[];
  audioNotes: AudioNote[];
  imageNotes: ImageNote[];
  imageBlobs: Record<string, string>;
}

interface ExportOptions {
  includeSiteInfo: boolean;
  includeImages: boolean;
  includeAudioTranscripts: boolean;
  includeTableOfContents: boolean;
  includeTimestamps: boolean;
}

const Print = () => {
  const [allData, setAllData] = createSignal<AllData>({
    textNotes: [],
    audioNotes: [],
    imageNotes: [],
    imageBlobs: {},
  });

  const [loading, setLoading] = createSignal(true);
  const [generating, setGenerating] = createSignal(false);
  const [generatedPDF, setGeneratedPDF] = createSignal<Blob | null>(null);

  const [exportOptions, setExportOptions] = createSignal<ExportOptions>({
    includeSiteInfo: true,
    includeImages: false, // Default to false due to file size
    includeAudioTranscripts: false,
    includeTableOfContents: true,
    includeTimestamps: true,
  });

  // Load all data on mount
  onMount(async () => {
    try {
      const [textNotes, audioNotes, imageNotes] = await Promise.all([
        textNotesDB.getAll(),
        audioNotesDB.getAll(),
        imageNotesDB.getAll(),
      ]);

      // Load image blobs
      const imageBlobs: Record<string, string> = {};
      for (const note of imageNotes) {
        const blob = await mediaBlobsDB.get(note.id);
        if (blob) {
          imageBlobs[note.id] = await blobToDataURL(blob);
        }
      }

      setAllData({ textNotes, audioNotes, imageNotes, imageBlobs });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  });

  // Calculate statistics
  const stats = () => {
    const data = allData();
    return calculateStats(data.textNotes, data.audioNotes, data.imageNotes);
  };

  const dateRange = () => {
    const data = allData();
    return getDateRange(data.textNotes, data.audioNotes, data.imageNotes);
  };

  const toggleOption = (option: keyof ExportOptions) => {
    setExportOptions({
      ...exportOptions(),
      [option]: !exportOptions()[option],
    });
  };

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const data = allData();
      const options = exportOptions();
      const doc = new jsPDF();

      // PDF settings
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let currentY = margin;
      let currentPage = 1;

      // Helper function to add a new page
      const addNewPage = () => {
        doc.addPage();
        currentPage++;
        currentY = margin;
      };

      // Helper function to check if we need a new page
      const checkNewPage = (neededSpace: number) => {
        if (currentY + neededSpace > pageHeight - margin) {
          addNewPage();
        }
      };

      // Helper function to add footer
      const addFooter = () => {
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Pilgrim Notes', margin, footerY);
        doc.text(`Page ${currentPage}`, pageWidth - margin, footerY, {
          align: 'right',
        });
        doc.setTextColor(0, 0, 0);
      };

      // COVER PAGE
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('Pilgrimage Journal', pageWidth / 2, 100, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'italic');
      doc.text('A Spiritual Journey', pageWidth / 2, 120, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(dateRange(), pageWidth / 2, 140, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      const generatedDate = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date());
      doc.text(`Generated: ${generatedDate}`, pageWidth / 2, 160, {
        align: 'center',
      });
      doc.setTextColor(0, 0, 0);

      addFooter();

      // Group notes by site
      const groupedData = groupNotesBySite(
        data.textNotes,
        data.audioNotes,
        data.imageNotes,
        sites
      );

      // Store page numbers for table of contents
      const tocEntries: { title: string; page: number }[] = [];

      // TABLE OF CONTENTS (if enabled)
      if (options.includeTableOfContents && groupedData.length > 0) {
        addNewPage();
        currentY = margin;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Table of Contents', margin, currentY);
        currentY += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // We'll update this after generating all pages
        // For now, just reserve space
        const tocStartPage = currentPage;

        addFooter();
      }

      // CONTENT - For each site
      for (const group of groupedData) {
        addNewPage();
        currentY = margin;

        // Record TOC entry
        tocEntries.push({ title: group.site.name, page: currentPage });

        // Site Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(group.site.name, margin, currentY);
        currentY += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.text(group.site.city, margin, currentY);
        currentY += 12;

        // Site Info (if enabled)
        if (options.includeSiteInfo) {
          // Quote
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(64, 64, 64);

          const quoteLines = doc.splitTextToSize(group.site.quote, contentWidth - 10);
          for (const line of quoteLines) {
            checkNewPage(7);
            doc.text(line, margin + 5, currentY);
            currentY += 7;
          }

          // Reference
          if (group.site.reference) {
            checkNewPage(7);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const refLines = doc.splitTextToSize(
              `— ${group.site.reference}`,
              contentWidth - 10
            );
            for (const line of refLines) {
              checkNewPage(6);
              doc.text(line, margin + 5, currentY);
              currentY += 6;
            }
          }

          doc.setTextColor(0, 0, 0);
          currentY += 8;

          // Address
          if (group.site.address) {
            checkNewPage(15);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Address:', margin, currentY);
            currentY += 6;

            doc.setFont('helvetica', 'normal');
            const addrLines = doc.splitTextToSize(group.site.address, contentWidth);
            for (const line of addrLines) {
              checkNewPage(5);
              doc.text(line, margin, currentY);
              currentY += 5;
            }
            currentY += 8;
          }
        }

        // TEXT NOTES
        if (group.textNotes.length > 0) {
          checkNewPage(15);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Text Notes', margin, currentY);
          currentY += 8;

          for (const note of group.textNotes) {
            checkNewPage(20);

            // Note title
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(note.title, margin + 3, currentY);
            currentY += 7;

            // Timestamp (if enabled)
            if (options.includeTimestamps) {
              doc.setFontSize(8);
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(128, 128, 128);
              doc.text(formatTimestamp(note.created), margin + 3, currentY);
              doc.setTextColor(0, 0, 0);
              currentY += 7;
            }

            // Note content (convert HTML to plain text)
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const noteText = stripHtml(note.body);
            const noteLines = doc.splitTextToSize(noteText, contentWidth - 6);

            for (const line of noteLines) {
              checkNewPage(6);
              doc.text(line, margin + 3, currentY);
              currentY += 6;
            }

            currentY += 8;
          }
        }

        // IMAGE NOTES
        if (group.imageNotes.length > 0) {
          checkNewPage(15);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Photos', margin, currentY);
          currentY += 8;

          for (const note of group.imageNotes) {
            checkNewPage(30);

            // Note title
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(note.title, margin + 3, currentY);
            currentY += 7;

            // Timestamp (if enabled)
            if (options.includeTimestamps) {
              doc.setFontSize(8);
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(128, 128, 128);
              doc.text(formatTimestamp(note.created), margin + 3, currentY);
              doc.setTextColor(0, 0, 0);
              currentY += 7;
            }

            // Image (if enabled)
            if (options.includeImages && data.imageBlobs[note.id]) {
              checkNewPage(80);
              try {
                const imgData = data.imageBlobs[note.id];
                const imgWidth = contentWidth - 6;
                const imgHeight = 60; // Fixed height, could be calculated based on aspect ratio
                doc.addImage(imgData, 'JPEG', margin + 3, currentY, imgWidth, imgHeight);
                currentY += imgHeight + 5;
              } catch (error) {
                console.error('Error adding image to PDF:', error);
                doc.setFontSize(9);
                doc.setTextColor(128, 128, 128);
                doc.text('[Image could not be loaded]', margin + 3, currentY);
                doc.setTextColor(0, 0, 0);
                currentY += 7;
              }
            }

            currentY += 8;
          }
        }

        // AUDIO NOTES
        if (group.audioNotes.length > 0) {
          checkNewPage(15);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Audio Notes', margin, currentY);
          currentY += 8;

          for (const note of group.audioNotes) {
            checkNewPage(15);

            // Note title
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(note.title, margin + 3, currentY);
            currentY += 7;

            // Timestamp (if enabled)
            if (options.includeTimestamps) {
              doc.setFontSize(8);
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(128, 128, 128);
              doc.text(formatTimestamp(note.created), margin + 3, currentY);
              doc.setTextColor(0, 0, 0);
              currentY += 7;
            }

            // Audio info
            doc.setFontSize(9);
            doc.setTextColor(64, 64, 64);
            doc.text('[Audio Recording - Not playable in PDF]', margin + 3, currentY);
            doc.setTextColor(0, 0, 0);
            currentY += 10;
          }
        }

        addFooter();
      }

      // Update Table of Contents with actual page numbers
      if (options.includeTableOfContents && tocEntries.length > 0) {
        // Go back to TOC page
        const tocPage = 2; // Usually page 2 after cover
        doc.setPage(tocPage);
        currentY = margin + 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        for (const entry of tocEntries) {
          checkNewPage(8);
          doc.text(entry.title, margin, currentY);
          doc.text(String(entry.page), pageWidth - margin, currentY, {
            align: 'right',
          });

          // Draw dotted line
          const titleWidth = doc.getTextWidth(entry.title);
          const pageNumWidth = doc.getTextWidth(String(entry.page));
          const dotsStart = margin + titleWidth + 2;
          const dotsEnd = pageWidth - margin - pageNumWidth - 2;

          doc.setLineDash([1, 2]);
          doc.line(dotsStart, currentY - 1, dotsEnd, currentY - 1);
          doc.setLineDash([]);

          currentY += 8;
        }
      }

      // Convert to Blob
      const pdfBlob = doc.output('blob');
      setGeneratedPDF(pdfBlob);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = generatedPDF();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pilgrimage-journal-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('PDF downloaded!');
  };

  const handleShare = async () => {
    const blob = generatedPDF();
    if (!blob) return;

    if (navigator.share) {
      try {
        const file = new File([blob], 'pilgrimage-journal.pdf', {
          type: 'application/pdf',
        });

        // Check if files can be shared
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Pilgrimage Journal',
            text: 'My spiritual journey',
            files: [file],
          });
          toast.success('Shared successfully!');
        } else {
          toast.error('Sharing files is not supported on this device');
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
          toast.error('Failed to share PDF');
        }
      }
    } else {
      toast.error('Sharing is not supported on this device');
    }
  };

  const handlePrint = () => {
    const blob = generatedPDF();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 100);
    };
  };

  const handleBack = () => {
    navigationStore.pop();
  };

  return (
    <div class="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div class="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <button
          onClick={handleBack}
          class="flex items-center gap-2 text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium mb-2"
        >
          <span class="text-xl">←</span>
          <span>Back</span>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Export Journal</h1>
      </div>

      {/* Content Section */}
      <div class="flex-1 overflow-y-auto p-4">
        <Show
          when={!loading()}
          fallback={
            <div class="flex items-center justify-center h-full">
              <div class="text-gray-500">Loading...</div>
            </div>
          }
        >
          {/* Export Preview */}
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <div class="flex items-start gap-4 mb-4">
              <div class="text-4xl">🖨️</div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-gray-900 mb-2">
                  Pilgrimage Journal
                </h2>
                <p class="text-gray-600 mb-4">
                  Generate a complete PDF journal with all your notes, photos, and
                  reflections
                </p>

                {/* Statistics */}
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-blue-50 rounded-lg p-3">
                    <div class="text-2xl font-bold text-blue-600">
                      {stats().totalSites}
                    </div>
                    <div class="text-sm text-gray-600">Sites Visited</div>
                  </div>
                  <div class="bg-green-50 rounded-lg p-3">
                    <div class="text-2xl font-bold text-green-600">
                      {stats().totalTextNotes}
                    </div>
                    <div class="text-sm text-gray-600">Text Notes</div>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-3">
                    <div class="text-2xl font-bold text-purple-600">
                      {stats().totalImageNotes}
                    </div>
                    <div class="text-sm text-gray-600">Photos</div>
                  </div>
                  <div class="bg-orange-50 rounded-lg p-3">
                    <div class="text-2xl font-bold text-orange-600">
                      {stats().totalAudioNotes}
                    </div>
                    <div class="text-sm text-gray-600">Audio Recordings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Export Options
            </h3>
            <div class="space-y-3">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions().includeSiteInfo}
                  onChange={() => toggleOption('includeSiteInfo')}
                  class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">
                    Include site information and quotes
                  </div>
                  <div class="text-sm text-gray-600">
                    Adds site descriptions, quotes, and addresses
                  </div>
                </div>
              </label>

              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions().includeImages}
                  onChange={() => toggleOption('includeImages')}
                  class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">Include images</div>
                  <div class="text-sm text-gray-600">
                    Note: This will significantly increase file size
                  </div>
                </div>
              </label>

              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions().includeAudioTranscripts}
                  onChange={() => toggleOption('includeAudioTranscripts')}
                  class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">
                    Include audio transcripts
                  </div>
                  <div class="text-sm text-gray-600">
                    If available (not yet implemented)
                  </div>
                </div>
              </label>

              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions().includeTableOfContents}
                  onChange={() => toggleOption('includeTableOfContents')}
                  class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">
                    Include table of contents
                  </div>
                  <div class="text-sm text-gray-600">
                    Lists all sites with page numbers
                  </div>
                </div>
              </label>

              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions().includeTimestamps}
                  onChange={() => toggleOption('includeTimestamps')}
                  class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">Include timestamps</div>
                  <div class="text-sm text-gray-600">
                    Shows when each note was created
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Generation Button */}
          <Show
            when={!generatedPDF()}
            fallback={
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="text-center mb-4">
                  <div class="text-4xl mb-3">✅</div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    PDF Generated Successfully!
                  </h3>
                  <p class="text-gray-600 mb-4">
                    Your pilgrimage journal is ready to download, share, or print
                  </p>
                </div>

                <div class="space-y-3">
                  <button
                    onClick={handleDownload}
                    class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📥</span>
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={handleShare}
                    class="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📤</span>
                    <span>Share PDF</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    class="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 active:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🖨️</span>
                    <span>Print PDF</span>
                  </button>

                  <button
                    onClick={() => setGeneratedPDF(null)}
                    class="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  >
                    Generate New PDF
                  </button>
                </div>
              </div>
            }
          >
            <button
              onClick={generatePDF}
              disabled={generating() || stats().totalNotes === 0}
              class="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
            >
              <Show when={generating()} fallback={<span>🖨️</span>}>
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </Show>
              <span>
                {generating()
                  ? 'Generating PDF...'
                  : stats().totalNotes === 0
                  ? 'No Notes to Export'
                  : 'Generate PDF Journal'}
              </span>
            </button>
          </Show>

          {/* Empty State */}
          <Show when={stats().totalNotes === 0}>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div class="flex items-start gap-3">
                <span class="text-2xl">ℹ️</span>
                <div>
                  <h4 class="font-semibold text-yellow-900 mb-1">
                    No Notes Available
                  </h4>
                  <p class="text-sm text-yellow-800">
                    You need to create at least one note before you can export your
                    journal. Visit the sites and add your reflections, photos, or
                    audio recordings.
                  </p>
                </div>
              </div>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default Print;
