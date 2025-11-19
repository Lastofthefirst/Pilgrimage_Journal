import { createSignal, onMount, Show, For } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB, audioNotesDB, imageNotesDB, mediaBlobsDB, blobToDataURL } from '../lib/db';
import { sites } from '../data/sites';
import type { TextNote, AudioNote, ImageNote, Site } from '../types';
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
  includeTimestamps: boolean;
  pageOrientation: 'portrait' | 'landscape';
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
    includeTimestamps: true,
    pageOrientation: 'portrait',
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
    if (option === 'pageOrientation') {
      setExportOptions({
        ...exportOptions(),
        pageOrientation: exportOptions().pageOrientation === 'portrait' ? 'landscape' : 'portrait',
      });
    } else {
      setExportOptions({
        ...exportOptions(),
        [option]: !exportOptions()[option],
      });
    }
  };

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: exportOptions().pageOrientation,
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Cover Page
      doc.setFontSize(32);
      doc.setTextColor(1, 93, 124); // Primary color
      doc.text('My Pilgrimage Journal', pageWidth / 2, 100, { align: 'center' });

      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      doc.text('A Spiritual Journey to the Holy Land', pageWidth / 2, 120, { align: 'center' });

      doc.setFontSize(12);
      const dateRangeText = getDateRange(allData().textNotes, allData().audioNotes, allData().imageNotes);
      doc.text(dateRangeText, pageWidth / 2, 140, { align: 'center' });

      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 150, { align: 'center' });

      // New page for table of contents
      doc.addPage();
      yPos = margin;

      doc.setFontSize(24);
      doc.setTextColor(1, 93, 124);
      doc.text('Table of Contents', margin, yPos);
      yPos += 15;

      // Get sites with notes
      const sitesWithNotes = groupNotesBySite(
        allData().textNotes,
        allData().audioNotes,
        allData().imageNotes,
        sites
      );

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      sitesWithNotes.forEach((siteData, index) => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`${index + 1}. ${siteData.site.name}`, margin + 5, yPos);
        yPos += 7;
      });

      // Site sections
      for (const siteData of sitesWithNotes) {
        doc.addPage();
        yPos = margin;

        // Site name
        doc.setFontSize(20);
        doc.setTextColor(1, 93, 124);
        doc.text(siteData.site.name, margin, yPos);
        yPos += 10;

        // City
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(siteData.site.city, margin, yPos);
        yPos += 10;

        // Quote (if enabled)
        if (exportOptions().includeSiteInfo && siteData.site.quote) {
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          doc.setFont('helvetica', 'italic');
          const quoteLines = doc.splitTextToSize(siteData.site.quote, pageWidth - 2 * margin - 10);
          doc.text(quoteLines, margin + 5, yPos);
          yPos += quoteLines.length * 6 + 5;
          doc.setFont('helvetica', 'normal');
        }

        // Reference (if enabled)
        if (exportOptions().includeSiteInfo && siteData.site.reference) {
          if (yPos > pageHeight - margin - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'italic');
          doc.text(`— ${siteData.site.reference}`, margin + 5, yPos);
          yPos += 8;
          doc.setFont('helvetica', 'normal');
        }

        // Address (if enabled)
        if (exportOptions().includeSiteInfo && siteData.site.address) {
          if (yPos > pageHeight - margin - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text('Address:', margin, yPos);
          yPos += 6;
          doc.setFont('helvetica', 'normal');

          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const addressLines = doc.splitTextToSize(siteData.site.address, pageWidth - 2 * margin - 10);
          doc.text(addressLines, margin + 5, yPos);
          yPos += addressLines.length * 5 + 10;
        }

        // Text notes
        if (siteData.textNotes.length > 0) {
          if (yPos > pageHeight - margin - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFontSize(14);
          doc.setTextColor(1, 93, 124);
          doc.setFont('helvetica', 'bold');
          doc.text('Notes', margin, yPos);
          yPos += 8;
          doc.setFont('helvetica', 'normal');

          for (const note of siteData.textNotes) {
            if (yPos > pageHeight - margin - 30) {
              doc.addPage();
              yPos = margin;
            }

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text(note.title, margin + 5, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');

            if (exportOptions().includeTimestamps) {
              doc.setFontSize(9);
              doc.setTextColor(150, 150, 150);
              doc.text(formatTimestamp(note.created), margin + 5, yPos);
              yPos += 5;
            }

            // Note content
            doc.setFontSize(10);
            doc.setTextColor(40, 40, 40);
            const content = stripHtml(note.body);
            const contentLines = doc.splitTextToSize(content, pageWidth - 2 * margin - 10);

            // Handle pagination for long notes
            for (const line of contentLines) {
              if (yPos > pageHeight - margin - 10) {
                doc.addPage();
                yPos = margin;
              }
              doc.text(line, margin + 5, yPos);
              yPos += 5;
            }
            yPos += 8;
          }
        }

        // Photos (if enabled)
        if (exportOptions().includeImages && siteData.imageNotes.length > 0) {
          if (yPos > pageHeight - margin - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFontSize(14);
          doc.setTextColor(1, 93, 124);
          doc.setFont('helvetica', 'bold');
          doc.text('Photos', margin, yPos);
          yPos += 8;
          doc.setFont('helvetica', 'normal');

          for (const photo of siteData.imageNotes) {
            if (yPos > pageHeight - 90) {
              doc.addPage();
              yPos = margin;
            }

            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(photo.title, margin + 5, yPos);
            yPos += 6;

            if (exportOptions().includeTimestamps) {
              doc.setFontSize(9);
              doc.setTextColor(150, 150, 150);
              doc.text(formatTimestamp(photo.created), margin + 5, yPos);
              yPos += 5;
            }

            const imgData = allData().imageBlobs[photo.id];
            if (imgData) {
              try {
                const imgWidth = exportOptions().pageOrientation === 'portrait' ? 80 : 120;
                const imgHeight = 60;

                if (yPos + imgHeight > pageHeight - margin) {
                  doc.addPage();
                  yPos = margin;
                }

                doc.addImage(imgData, 'JPEG', margin + 5, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 10;
              } catch (error) {
                console.error('Error adding image:', error);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text('[Image could not be loaded]', margin + 5, yPos);
                yPos += 10;
              }
            }
          }
        }

        // Audio notes
        if (siteData.audioNotes.length > 0) {
          if (yPos > pageHeight - margin - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFontSize(14);
          doc.setTextColor(1, 93, 124);
          doc.setFont('helvetica', 'bold');
          doc.text('Audio Recordings', margin, yPos);
          yPos += 8;
          doc.setFont('helvetica', 'normal');

          for (const audio of siteData.audioNotes) {
            if (yPos > pageHeight - margin - 15) {
              doc.addPage();
              yPos = margin;
            }

            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`🎤 ${audio.title}`, margin + 5, yPos);
            yPos += 6;

            if (exportOptions().includeTimestamps) {
              doc.setFontSize(9);
              doc.setTextColor(150, 150, 150);
              doc.text(formatTimestamp(audio.created), margin + 5, yPos);
              yPos += 6;
            }

            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'italic');
            doc.text('[Audio Recording - Not playable in PDF]', margin + 5, yPos);
            yPos += 8;
            doc.setFont('helvetica', 'normal');
          }
        }
      }

      // Add page numbers (skip cover page)
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 2; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i - 1} of ${pageCount - 1}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF as blob
      const blob = doc.output('blob');
      setGeneratedPDF(blob);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
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
    <div class="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Top Bar */}
      <div class="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm">
        <button
          onClick={handleBack}
          class="flex items-center gap-2 text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium mb-2"
        >
          <span class="text-xl">←</span>
          <span>Back</span>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Export Your Pilgrimage Journal</h1>
      </div>

      {/* Content Section */}
      <div class="flex-1 overflow-y-auto p-4">
        <Show
          when={!loading()}
          fallback={
            <div class="flex items-center justify-center h-full">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div class="text-gray-600 font-medium">Loading your journey...</div>
              </div>
            </div>
          }
        >
          {/* Statistics Cards */}
          <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
              <div class="text-3xl mb-2">🕌</div>
              <div class="text-3xl font-bold mb-1">{stats().totalSites}</div>
              <div class="text-sm opacity-90">Sites Visited</div>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
              <div class="text-3xl mb-2">📝</div>
              <div class="text-3xl font-bold mb-1">{stats().totalTextNotes}</div>
              <div class="text-sm opacity-90">Text Notes</div>
            </div>
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
              <div class="text-3xl mb-2">📷</div>
              <div class="text-3xl font-bold mb-1">{stats().totalImageNotes}</div>
              <div class="text-sm opacity-90">Photos</div>
            </div>
            <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
              <div class="text-3xl mb-2">🎤</div>
              <div class="text-3xl font-bold mb-1">{stats().totalAudioNotes}</div>
              <div class="text-sm opacity-90">Audio Recordings</div>
            </div>
          </div>

          {/* PDF Preview Card */}
          <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <div class="flex items-start gap-4">
              <div class="text-5xl">📖</div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-gray-900 mb-2">
                  Professional PDF Journal
                </h2>
                <p class="text-gray-600 mb-3">
                  Your complete pilgrimage experience beautifully formatted with cover page,
                  table of contents, and all your memories organized by sacred site.
                </p>
                <div class="flex flex-wrap gap-2 text-sm">
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Cover Page</span>
                  <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Table of Contents</span>
                  <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full">Professional Layout</span>
                  <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Page Numbers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚙️</span>
              <span>Export Options</span>
            </h3>
            <div class="space-y-4">
              <label class="flex items-start gap-3 cursor-pointer group">
                <div class="relative">
                  <input
                    type="checkbox"
                    checked={exportOptions().includeSiteInfo}
                    onChange={() => toggleOption('includeSiteInfo')}
                    class="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Include site information and quotes
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    Adds site descriptions, biblical quotes, and addresses to enhance context
                  </div>
                </div>
              </label>

              <label class="flex items-start gap-3 cursor-pointer group">
                <div class="relative">
                  <input
                    type="checkbox"
                    checked={exportOptions().includeImages}
                    onChange={() => toggleOption('includeImages')}
                    class="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Include images
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    <span class="text-orange-600 font-medium">Note:</span> This will significantly increase file size
                  </div>
                </div>
              </label>

              <label class="flex items-start gap-3 cursor-pointer group">
                <div class="relative">
                  <input
                    type="checkbox"
                    checked={exportOptions().includeTimestamps}
                    onChange={() => toggleOption('includeTimestamps')}
                    class="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Include timestamps
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    Shows when each note was created during your pilgrimage
                  </div>
                </div>
              </label>

              {/* Orientation Toggle */}
              <div class="pt-4 border-t border-gray-200">
                <div class="font-semibold text-gray-900 mb-3">Page Orientation</div>
                <div class="flex gap-3">
                  <button
                    onClick={() => setExportOptions({ ...exportOptions(), pageOrientation: 'portrait' })}
                    class={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      exportOptions().pageOrientation === 'portrait'
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div class="text-2xl mb-1">📄</div>
                    <div>Portrait</div>
                  </button>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions(), pageOrientation: 'landscape' })}
                    class={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      exportOptions().pageOrientation === 'landscape'
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div class="text-2xl mb-1">📃</div>
                    <div>Landscape</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Generation Button or Success Card */}
          <Show
            when={!generatedPDF()}
            fallback={
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border-2 border-green-200 p-6">
                <div class="text-center mb-6">
                  <div class="text-6xl mb-4">✅</div>
                  <h3 class="text-2xl font-bold text-gray-900 mb-2">
                    PDF Generated Successfully!
                  </h3>
                  <p class="text-gray-600 mb-1">
                    Your pilgrimage journal is ready to download, share, or print
                  </p>
                  <p class="text-sm text-gray-500">
                    {stats().totalNotes} notes from {stats().totalSites} sacred sites
                  </p>
                </div>

                <div class="space-y-3">
                  <button
                    onClick={handleDownload}
                    class="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span class="text-2xl">📥</span>
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={handleShare}
                    class="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span class="text-2xl">📤</span>
                    <span>Share PDF</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    class="w-full py-4 px-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span class="text-2xl">🖨️</span>
                    <span>Print PDF</span>
                  </button>

                  <button
                    onClick={() => setGeneratedPDF(null)}
                    class="w-full py-3 px-6 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors border-2 border-gray-200"
                  >
                    Generate New PDF with Different Options
                  </button>
                </div>
              </div>
            }
          >
            <button
              onClick={generatePDF}
              disabled={generating() || stats().totalNotes === 0}
              class="w-full py-5 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 active:scale-98 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-4"
            >
              <Show when={generating()} fallback={<span class="text-3xl">🖨️</span>}>
                <div class="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              </Show>
              <span>
                {generating()
                  ? 'Generating Your Beautiful PDF...'
                  : stats().totalNotes === 0
                  ? 'No Notes to Export'
                  : 'Generate PDF Journal'}
              </span>
            </button>
          </Show>

          {/* Empty State */}
          <Show when={stats().totalNotes === 0}>
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mt-6">
              <div class="flex items-start gap-4">
                <span class="text-4xl">ℹ️</span>
                <div>
                  <h4 class="font-bold text-yellow-900 text-lg mb-2">
                    No Notes Available Yet
                  </h4>
                  <p class="text-yellow-800 mb-3">
                    You need to create at least one note before you can export your
                    journal. Start capturing your pilgrimage experience!
                  </p>
                  <ul class="text-sm text-yellow-700 space-y-1 ml-4">
                    <li>• Visit sacred sites and add your reflections</li>
                    <li>• Capture photos of meaningful moments</li>
                    <li>• Record audio notes with your thoughts</li>
                  </ul>
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
