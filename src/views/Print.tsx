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
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import toast from 'solid-toast';

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  orientation: 'portrait' | 'landscape';
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
    orientation: 'portrait',
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
    if (option === 'orientation') {
      setExportOptions({
        ...exportOptions(),
        orientation: exportOptions().orientation === 'portrait' ? 'landscape' : 'portrait',
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
      const data = allData();
      const options = exportOptions();

      // Group notes by site
      const groupedData = groupNotesBySite(
        data.textNotes,
        data.audioNotes,
        data.imageNotes,
        sites
      );

      // Build table of contents
      const tocItems: any[] = [];
      groupedData.forEach((group, index) => {
        tocItems.push({
          text: group.site.name,
          style: 'tocItem',
          tocItem: true,
        });
      });

      // Build site sections
      const siteSections: any[] = [];

      for (const group of groupedData) {
        const siteContent: any[] = [];

        // Site Header
        siteContent.push({
          text: group.site.name,
          style: 'siteHeader',
          pageBreak: siteSections.length > 0 ? 'before' : undefined,
          tocItem: group.site.name,
        });

        siteContent.push({
          text: group.site.city,
          style: 'siteCity',
          margin: [0, 0, 0, 10],
        });

        // Site Info (if enabled)
        if (options.includeSiteInfo) {
          // Quote
          siteContent.push({
            text: group.site.quote,
            style: 'quote',
          });

          // Reference
          if (group.site.reference) {
            siteContent.push({
              text: `— ${group.site.reference}`,
              style: 'reference',
            });
          }

          // Address
          if (group.site.address) {
            siteContent.push({
              text: 'Address:',
              style: 'subheading',
              margin: [0, 10, 0, 3],
            });
            siteContent.push({
              text: group.site.address,
              style: 'address',
              margin: [0, 0, 0, 10],
            });
          }
        }

        // TEXT NOTES
        if (group.textNotes.length > 0) {
          siteContent.push({
            text: 'Text Notes',
            style: 'sectionHeader',
            margin: [0, 10, 0, 8],
          });

          for (const note of group.textNotes) {
            const noteContent: any[] = [];

            // Note title
            noteContent.push({
              text: note.title,
              style: 'noteTitle',
            });

            // Timestamp (if enabled)
            if (options.includeTimestamps) {
              noteContent.push({
                text: formatTimestamp(note.created),
                style: 'timestamp',
              });
            }

            // Note content (convert HTML to plain text)
            const noteText = stripHtml(note.body);
            noteContent.push({
              text: noteText,
              style: 'noteBody',
              margin: [0, 3, 0, 10],
            });

            siteContent.push({
              stack: noteContent,
              margin: [5, 0, 0, 8],
            });
          }
        }

        // IMAGE NOTES
        if (group.imageNotes.length > 0) {
          siteContent.push({
            text: 'Photos',
            style: 'sectionHeader',
            margin: [0, 10, 0, 8],
          });

          for (const note of group.imageNotes) {
            const imageNoteContent: any[] = [];

            // Note title
            imageNoteContent.push({
              text: note.title,
              style: 'noteTitle',
            });

            // Timestamp (if enabled)
            if (options.includeTimestamps) {
              imageNoteContent.push({
                text: formatTimestamp(note.created),
                style: 'timestamp',
              });
            }

            // Image (if enabled)
            if (options.includeImages && data.imageBlobs[note.id]) {
              try {
                imageNoteContent.push({
                  image: data.imageBlobs[note.id],
                  width: options.orientation === 'portrait' ? 400 : 600,
                  margin: [0, 5, 0, 10],
                });
              } catch (error) {
                console.error('Error adding image to PDF:', error);
                imageNoteContent.push({
                  text: '[Image could not be loaded]',
                  style: 'error',
                });
              }
            }

            siteContent.push({
              stack: imageNoteContent,
              margin: [5, 0, 0, 10],
            });
          }
        }

        // AUDIO NOTES
        if (group.audioNotes.length > 0) {
          siteContent.push({
            text: 'Audio Notes',
            style: 'sectionHeader',
            margin: [0, 10, 0, 8],
          });

          for (const note of group.audioNotes) {
            const audioNoteContent: any[] = [];

            // Note title
            audioNoteContent.push({
              text: note.title,
              style: 'noteTitle',
            });

            // Timestamp (if enabled)
            if (options.includeTimestamps) {
              audioNoteContent.push({
                text: formatTimestamp(note.created),
                style: 'timestamp',
              });
            }

            // Audio info
            audioNoteContent.push({
              text: '[Audio Recording - Not playable in PDF]',
              style: 'audioNote',
              margin: [0, 3, 0, 10],
            });

            siteContent.push({
              stack: audioNoteContent,
              margin: [5, 0, 0, 8],
            });
          }
        }

        siteSections.push(...siteContent);
      }

      // Document definition
      const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: options.orientation,
        pageMargins: [40, 60, 40, 60],

        content: [
          // Cover page
          {
            stack: [
              {
                text: 'My Pilgrimage Journal',
                style: 'coverTitle',
                margin: [0, 100, 0, 20],
              },
              {
                text: 'A Spiritual Journey to the Holy Land',
                style: 'coverSubtitle',
                margin: [0, 0, 0, 20],
              },
              {
                text: dateRange(),
                style: 'coverDate',
              },
              {
                text: `Generated: ${new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}`,
                style: 'generatedDate',
                margin: [0, 20, 0, 0],
              },
            ],
            margin: [0, 0, 0, 0],
          },
          {
            text: '',
            pageBreak: 'after',
          },

          // Table of contents
          {
            text: 'Table of Contents',
            style: 'tocHeader',
            margin: [0, 0, 0, 20],
          },
          {
            toc: {
              title: { text: '' },
            },
            margin: [0, 0, 0, 20],
          },
          {
            text: '',
            pageBreak: 'after',
          },

          // Site sections
          ...siteSections,
        ],

        styles: {
          coverTitle: {
            fontSize: 32,
            bold: true,
            alignment: 'center',
            color: '#015D7C',
          },
          coverSubtitle: {
            fontSize: 18,
            italics: true,
            alignment: 'center',
            color: '#666666',
          },
          coverDate: {
            fontSize: 14,
            alignment: 'center',
            color: '#333333',
          },
          generatedDate: {
            fontSize: 10,
            alignment: 'center',
            color: '#999999',
          },
          tocHeader: {
            fontSize: 24,
            bold: true,
            color: '#015D7C',
          },
          tocItem: {
            fontSize: 12,
            margin: [0, 3, 0, 3],
          },
          siteHeader: {
            fontSize: 20,
            bold: true,
            color: '#015D7C',
            margin: [0, 0, 0, 5],
          },
          siteCity: {
            fontSize: 14,
            italics: true,
            color: '#666666',
          },
          quote: {
            fontSize: 11,
            italics: true,
            color: '#444444',
            margin: [20, 10, 20, 5],
          },
          reference: {
            fontSize: 10,
            italics: true,
            color: '#666666',
            margin: [20, 0, 20, 10],
          },
          subheading: {
            fontSize: 11,
            bold: true,
            color: '#333333',
          },
          address: {
            fontSize: 10,
            color: '#666666',
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#015D7C',
          },
          noteTitle: {
            fontSize: 12,
            bold: true,
            color: '#333333',
            margin: [0, 0, 0, 3],
          },
          timestamp: {
            fontSize: 9,
            italics: true,
            color: '#999999',
            margin: [0, 0, 0, 3],
          },
          noteBody: {
            fontSize: 10,
            color: '#333333',
            lineHeight: 1.3,
          },
          audioNote: {
            fontSize: 9,
            italics: true,
            color: '#666666',
          },
          error: {
            fontSize: 9,
            color: '#999999',
            italics: true,
          },
        },

        defaultStyle: {
          font: 'Helvetica',
        },

        // Footer
        footer: (currentPage: number, pageCount: number) => {
          return {
            columns: [
              {
                text: 'Pilgrim Notes',
                alignment: 'left',
                fontSize: 8,
                color: '#999999',
                margin: [40, 0, 0, 0],
              },
              {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: 'right',
                fontSize: 8,
                color: '#999999',
                margin: [0, 0, 40, 0],
              },
            ],
          };
        },
      };

      // Generate PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);

      pdfDocGenerator.getBlob((blob: Blob) => {
        setGeneratedPDF(blob);
        setGenerating(false);
        toast.success('PDF generated successfully!');
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
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
                    onClick={() => setExportOptions({ ...exportOptions(), orientation: 'portrait' })}
                    class={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      exportOptions().orientation === 'portrait'
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div class="text-2xl mb-1">📄</div>
                    <div>Portrait</div>
                  </button>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions(), orientation: 'landscape' })}
                    class={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      exportOptions().orientation === 'landscape'
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
