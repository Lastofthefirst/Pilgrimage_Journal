import { createSignal } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { colors } from '../styles/colors';
import type { Site } from '../types';
import SitePage from '../views/SitePage';
import Editor from '../views/Editor';
import { v4 as uuidv4 } from 'uuid';
import toast from 'solid-toast';

interface SiteCardProps {
  site: Site;
  numNotes: number;
  numAudio: number;
  numImages: number;
  onUpdate: () => void;
}

const SiteCard = (props: SiteCardProps) => {
  const [recording, setRecording] = createSignal(false);

  const handleSiteClick = () => {
    navigationStore.push(() => <SitePage site={props.site} />);
  };

  const handleNewNote = (e: MouseEvent) => {
    e.stopPropagation();
    navigationStore.push(() => (
      <Editor
        note={{
          id: uuidv4(),
          title: '',
          site: props.site.name,
          body: '',
          type: 'text',
          created: new Date().toISOString(),
        }}
      />
    ));
  };

  const handleCamera = (e: MouseEvent) => {
    e.stopPropagation();
    toast.error('Camera not available in web version');
  };

  const handleMic = (e: MouseEvent) => {
    e.stopPropagation();
    toast.error('Audio recording not available in web version');
  };

  return (
    <div
      class="relative mx-10 my-10 mb-20 cursor-pointer"
      onClick={handleSiteClick}
      style={{ 'border-radius': '5px' }}
    >
      {/* Site Image */}
      <img
        src={props.site.image}
        alt={props.site.name}
        class="w-full h-64 object-cover"
        style={{ 'border-radius': '24px' }}
      />

      {/* Info Box (bottom right overlay) */}
      <div
        class="absolute -bottom-10 -right-2.5 overflow-hidden"
        style={{
          background: colors.white,
          width: '95%',
          'border-radius': '8px',
          'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'border': `0.5px solid ${colors.primaryBg}`,
        }}
      >
        {/* Site Name and Quote */}
        <div class="p-2.5">
          <div class="font-bold text-xl mb-1">{props.site.name}</div>
          <div
            class="text-xs italic"
            style={{
              color: '#113747',
              'font-family': 'serif',
              overflow: 'hidden',
              'text-overflow': 'ellipsis',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
            }}
          >
            {props.site.quote}
          </div>
        </div>

        {/* Stats Row */}
        <div
          class="flex items-center p-2 pl-5"
          style={{ background: colors.primaryBg }}
        >
          {/* Text Notes Count */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primaryText}
            stroke-width="2"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span
            class="mr-3 ml-1 font-semibold"
            style={{ color: colors.primaryText }}
          >
            {props.numNotes}
          </span>

          {/* Audio Count */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primaryText}
            stroke-width="2"
          >
            <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span
            class="mr-3 ml-1 font-semibold"
            style={{ color: colors.primaryText }}
          >
            {props.numAudio}
          </span>

          {/* Photo Count */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primaryText}
            stroke-width="2"
          >
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span
            class="font-semibold ml-1"
            style={{ color: colors.primaryText }}
          >
            {props.numImages}
          </span>
        </div>
      </div>

      {/* Action Buttons (top right) */}
      <div class="absolute top-2 -right-2.5 flex gap-2">
        {/* Mic Button */}
        <button
          onClick={handleMic}
          class="flex items-center justify-center"
          style={{
            background: colors.primaryBg,
            width: '40px',
            height: '40px',
            'border-radius': '20px',
            'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primaryText}
            stroke-width="2"
          >
            <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Camera Button */}
        <button
          onClick={handleCamera}
          class="flex items-center justify-center"
          style={{
            background: colors.primaryBg,
            width: '40px',
            height: '40px',
            'border-radius': '20px',
            'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primaryText}
            stroke-width="2"
          >
            <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Add Note Button */}
        <button
          onClick={handleNewNote}
          class="p-3 mr-0.5 flex items-center justify-center"
          style={{
            background: colors.primaryBg,
            'border-radius': '20px',
            'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primaryText}
            stroke-width="2"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SiteCard;
