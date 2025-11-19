import type { TextNote, AudioNote, ImageNote, Site } from '../types';

/**
 * Strips HTML tags and converts HTML to plain text
 */
export function stripHtml(html: string): string {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Get text content and clean up whitespace
  const text = temp.textContent || temp.innerText || '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Groups notes by site
 */
export function groupNotesBySite(
  textNotes: TextNote[],
  audioNotes: AudioNote[],
  imageNotes: ImageNote[],
  sites: Site[]
) {
  const grouped: {
    site: Site;
    textNotes: TextNote[];
    audioNotes: AudioNote[];
    imageNotes: ImageNote[];
  }[] = [];

  // Only include sites that have at least one note
  sites.forEach((site) => {
    const siteTextNotes = textNotes.filter((n) => n.site === site.name);
    const siteAudioNotes = audioNotes.filter((n) => n.site === site.name);
    const siteImageNotes = imageNotes.filter((n) => n.site === site.name);

    if (
      siteTextNotes.length > 0 ||
      siteAudioNotes.length > 0 ||
      siteImageNotes.length > 0
    ) {
      grouped.push({
        site,
        textNotes: siteTextNotes.sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime()
        ),
        audioNotes: siteAudioNotes.sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime()
        ),
        imageNotes: siteImageNotes.sort(
          (a, b) =>
            new Date(a.created).getTime() - new Date(b.created).getTime()
        ),
      });
    }
  });

  // Sort by site index
  return grouped.sort((a, b) => a.site.index - b.site.index);
}

/**
 * Calculates statistics about notes
 */
export function calculateStats(
  textNotes: TextNote[],
  audioNotes: AudioNote[],
  imageNotes: ImageNote[]
) {
  // Get unique sites
  const sitesWithNotes = new Set<string>();
  textNotes.forEach((n) => sitesWithNotes.add(n.site));
  audioNotes.forEach((n) => sitesWithNotes.add(n.site));
  imageNotes.forEach((n) => sitesWithNotes.add(n.site));

  return {
    totalSites: sitesWithNotes.size,
    totalTextNotes: textNotes.length,
    totalAudioNotes: audioNotes.length,
    totalImageNotes: imageNotes.length,
    totalNotes: textNotes.length + audioNotes.length + imageNotes.length,
  };
}

/**
 * Formats a date range from notes
 */
export function getDateRange(
  textNotes: TextNote[],
  audioNotes: AudioNote[],
  imageNotes: ImageNote[]
): string {
  const allDates = [
    ...textNotes.map((n) => new Date(n.created)),
    ...audioNotes.map((n) => new Date(n.created)),
    ...imageNotes.map((n) => new Date(n.created)),
  ];

  if (allDates.length === 0) return 'No notes';

  const earliest = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const latest = new Date(Math.max(...allDates.map((d) => d.getTime())));

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);

  if (earliest.toDateString() === latest.toDateString()) {
    return formatDate(earliest);
  }

  return `${formatDate(earliest)} - ${formatDate(latest)}`;
}

/**
 * Formats a timestamp for PDF display
 */
export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formats audio duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
