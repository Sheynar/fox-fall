import EventEmitter from "node:events";

export function useRenderState() {
	const renderingState = {
		pending: {},
		completed: {},
	};

	const emitter = new EventEmitter<{
		'render-required': [];
		'render-completed': [];
	}>();

	function setRenderRequired(isRequired: boolean) {
		if (isRequired) {
			renderingState.pending = {};
			emitter.emit('render-required');
		} else {
			renderingState.completed = renderingState.pending;
			emitter.emit('render-completed');
		}
	}

	function renderIsRequired() {
		return renderingState.pending !== renderingState.completed;
	}

	return {
		emitter,
		setRenderRequired,
		renderIsRequired,
	};
}
