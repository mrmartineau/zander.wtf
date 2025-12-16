import type { Setter } from 'solid-js';
import type { BookmarkType } from '../../fetching/links';

interface Props {
  type: BookmarkType;
  setSearchQuery: Setter<string>;
}

export function LinkType({ type, setSearchQuery }: Props) {
  let icon = 'link-simple-horizontal';
  let label = 'Link';
  switch (type) {
    case 'article':
      icon = 'newspaper-clipping';
      label = 'Article';
      break;
    case 'video':
      icon = 'video-camera';
      label = 'Video';
      break;
    case 'audio':
      icon = 'headphones';
      label = 'Audio';
      break;
    case 'image':
      icon = 'image';
      label = 'Image';
      break;
    case 'recipe':
      icon = 'hamburger';
      label = 'Recipe';
      break;
    case 'document':
      icon = 'files';
      label = 'Document';
      break;
    case 'product':
      icon = 'barbell';
      label = 'Product';
      break;
    case 'game':
      icon = 'game-controller';
      label = 'Game';
      break;
    case 'note':
      icon = 'notepad';
      label = 'Note';
      break;
    case 'event':
      icon = 'calendar';
      label = 'Event';
      break;
  }

  return (
    <button
      class="flex items-center gap-2 hover:opacity-60"
      onClick={() => setSearchQuery(label)}
      type="button"
    >
      <i class={`ph-duotone ph-${icon} zm-icon`}></i>
      {label}
    </button>
  );
}
