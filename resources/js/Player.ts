import type { Track } from "./types";

export type PlayerSnapshot = {
    queue: Track[];
    index: number;
    isPlaying: boolean;
    isShuffling: boolean;
    repeatMode: "none" | "one" | "all";
    currentTime: number;
    duration: number;
    volume: number;
};

type Listener = (s: PlayerSnapshot) => void;

export class Player {
    private audio: HTMLAudioElement;
    private state: PlayerSnapshot = {
        queue: [],
        index: -1,
        isPlaying: false,
        isShuffling: false,
        repeatMode: "none",
        currentTime: 0,
        duration: 0,
        volume: 1,
    };
    private listeners = new Set<Listener>();

    constructor(audio?: HTMLAudioElement) {
        this.audio = audio ?? new Audio();
        this.audio.addEventListener("timeupdate", () => {
            this.state.currentTime = this.audio.currentTime || 0;
            this.state.duration = Number.isFinite(this.audio.duration)
                ? this.audio.duration
                : 0;
            this.emit();
        });
        this.audio.addEventListener("ended", () => {
            if( this.state.isShuffling && this.state.repeatMode !== 'one' && this.state.queue.length > 1) {
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * this.state.queue.length);
                } while(nextIndex === this.state.index);
                this.load(nextIndex);
                void this.play();
                return;
            }else
                this.next();
        });
        this.audio.addEventListener("play", () => {
            this.state.isPlaying = true;
            this.emit();
        });
        this.audio.addEventListener("pause", () => {
            this.state.isPlaying = false;
            this.emit();
        });
    }

    onChange(fn: Listener) {
        this.listeners.add(fn);
        fn(this.snapshot());
        return () => this.listeners.delete(fn);
    }
    private emit() {
        const snap = this.snapshot();
        this.listeners.forEach((l) => l(snap));
    }
    snapshot(): PlayerSnapshot {
        return { ...this.state, queue: [...this.state.queue] };
    }

    private load(i: number) {
        if (i < 0 || i >= this.state.queue.length) return;
        this.state.index = i;
        this.audio.src = "/stream/" + this.state.queue[i].id;
        this.audio.load();
        this.emit();
    }

    async play(i?: number) {
        if (typeof i === "number") this.load(i);
        if (this.state.index === -1 && this.state.queue.length) this.load(0);
        await this.audio.play().catch(() => void 0);
        localStorage.setItem("queue-index", String(this.state.index));
        this.state.isPlaying = !this.audio.paused;
        this.emit();
    }
    pause() {
        this.audio.pause();
    }
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.emit();
    }
    seek(s: number) {
        this.audio.currentTime = Math.max(0, s);
    }
    next() {
        const n = this.state.repeatMode === "one" ? this.state.index : this.state.index + 1;
        if (n < this.state.queue.length) {
            this.load(n);
            void this.play();
        } else if (this.state.repeatMode === "all" && this.state.queue.length) {
            this.load(0);
            void this.play();
        }
    }
    prev() {
        const p = this.state.index - 1;
        if (p >= 0) {
            this.load(p);
            void this.play();
        }
    }

    clear() {
        this.state.queue = [];
        this.state.index = -1;
        this.stop();
    }
    enqueue(items: Track | Track[]) {
        const a = Array.isArray(items) ? items : [items];
        this.state.queue.push(...a);
        this.emit();
    }
    removeAt(i: number) {
        if (i < 0 || i >= this.state.queue.length) return;
        const wasCurrent = i === this.state.index;
        this.state.queue.splice(i, 1);
        if (wasCurrent) {
            if (this.state.index >= this.state.queue.length)
                this.state.index = this.state.queue.length - 1;
            if (this.state.index >= 0) {
                this.load(this.state.index);
                void this.play();
            } else this.stop();
        } else if (i < this.state.index) this.state.index--;
        this.emit();
    }
    toggleShuffle() {
        this.state.isShuffling = !this.state.isShuffling;
        this.emit();
    }
    setShuffle(v: boolean) {
        this.state.isShuffling = v;
        this.emit();
    }
    setRepeat(mode: "none" | "one" | "all") {
        this.state.repeatMode = mode;
        this.emit();
    }
    toggleRepeat() {
        switch (this.state.repeatMode) {
            case "none":
                this.state.repeatMode = "all";
                break;
            case "all":
                this.state.repeatMode = "one";
                break;
            case "one":
                this.state.repeatMode = "none";
                break;
        }
        this.emit();
    }
    setVolume(v: number) {
        this.audio.volume = Math.min(1, Math.max(0, v));
        this.state.volume = v;
        this.emit();
    }
}
