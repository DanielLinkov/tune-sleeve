import { reactive, toRefs, onMounted, onBeforeUnmount } from 'vue';
import { Player } from './Player';
import type { Track } from './types';

export function usePlayer() {
  const player = new Player();
  const state = reactive({
    queue: [] as Track[],
    index: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  let stopSub: (() => void) | null = null;

  onMounted(() => {
    stopSub = player.onChange(s => {
      state.queue = s.queue;
      state.index = s.index;
      state.isPlaying = s.isPlaying;
      state.currentTime = s.currentTime;
      state.duration = s.duration;
    });

    // Optional Media Session
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('nexttrack', () => player.next());
      navigator.mediaSession.setActionHandler('previoustrack', () => player.prev());
      navigator.mediaSession.setActionHandler('pause', () => player.pause());
      navigator.mediaSession.setActionHandler('play',  () => player.play());
    }
  });

  onBeforeUnmount(() => { stopSub?.(); });

  return {
    ...toRefs(state),
    play: (i?: number) => player.play(i),
    pause: () => player.pause(),
    next: () => player.next(),
    prev: () => player.prev(),
    seek: (s: number) => player.seek(s),
    clear: () => player.clear(),
    enqueue: (t: Track | Track[]) => player.enqueue(t),
    removeAt: (i: number) => player.removeAt(i),
  };
}
