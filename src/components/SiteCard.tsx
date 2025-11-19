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
          <Icon name="document-text" size={20} style={{ color: colors.primaryText }} />
          <span
            class="mr-3 ml-1 font-semibold"
            style={{ color: colors.primaryText }}
          >
            {props.numNotes}
          </span>

          {/* Audio Count */}
          <Icon name="microphone" size={20} style={{ color: colors.primaryText }} />
          <span
            class="mr-3 ml-1 font-semibold"
            style={{ color: colors.primaryText }}
          >
            {props.numAudio}
          </span>

          {/* Photo Count */}
          <Icon name="photo" size={20} style={{ color: colors.primaryText }} />
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
          <Icon name="microphone" size={22} style={{ color: colors.primaryText }} />
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
          <Icon name="camera" size={22} style={{ color: colors.primaryText }} />
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
          <Icon name="plus" size={20} style={{ color: colors.primaryText }} />
        </button>
      </div>
    </div>
  );
};

export default SiteCard;
