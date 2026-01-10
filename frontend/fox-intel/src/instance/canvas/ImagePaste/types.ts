import { Vector } from "@packages/data/dist/artillery/vector";

export type Props = {
	image: ImageBitmap;
	position: Vector;
	size: Vector;
	opacity: number;
}

export type Emits = {
	(e: 'update:position', position: Vector): void;
	(e: 'submit:position'): void;
	(e: 'update:size', size: Vector): void;
	(e: 'submit:size'): void;
	(e: 'update:opacity', opacity: number): void;
	(e: 'submit:opacity'): void;
	(e: 'delete'): void;
	(e: 'submit', canvasElement: HTMLCanvasElement): void;
}